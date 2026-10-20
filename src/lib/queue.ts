import type postgres from "postgres";
import { database } from "./db";
import { activeStates, assert, AppError } from "./errors";
import { hash, localDemo } from "./security";
import type {
  Game,
  Policy,
  Staff,
  Ticket,
  Seat,
  PlayerData,
  StaffData,
} from "./types";

type Tx = postgres.TransactionSql;
const active = ["waiting", "arrived", "offered", "acknowledged"];
async function transaction<T>(fn: (sql: Tx) => Promise<T>): Promise<T> {
  return (await database().begin(async (sql) => {
    await sql`select pg_advisory_xact_lock(20261020)`;
    await sql`select public.expire_waitlist()`;
    return fn(sql);
  })) as unknown as T;
}
async function audit(
  sql: Tx,
  actor: string | null,
  type: string,
  action: string,
  entity: string | null,
  details: Record<string, unknown> = {},
) {
  await sql`insert into audit_events(actor_id,actor_type,action,entity_id,details) values(${actor},${type},${action},${entity},${sql.json(details as never)})`;
}
async function staffAccess(sql: Tx, staff: Staff, roles?: string[]) {
  const [current] =
    await sql`select * from staff_members where id=${staff.id} and active=true`;
  assert(current, "AUTH", "Your staff access has been removed.", 403);
  assert(
    !roles || roles.includes(current.role),
    "ROLE",
    "Your role cannot perform this action.",
    403,
  );
  return current;
}
async function once(
  sql: Tx,
  actor: string,
  requestId: string,
  payload: unknown,
  fn: () => Promise<unknown>,
) {
  const fingerprint = hash(JSON.stringify(payload));
  const [receipt] =
    await sql`select * from command_receipts where actor=${actor} and request_id=${requestId}`;
  if (receipt) {
    assert(
      receipt.fingerprint === fingerprint,
      "RETRY",
      "This request ID belongs to another action.",
      409,
    );
    return receipt.result;
  }
  const result = await fn();
  await sql`insert into command_receipts(actor,request_id,fingerprint,result) values(${actor},${requestId},${fingerprint},${sql.json((result ?? { ok: true }) as never)})`;
  return result;
}
export async function rateLimit(
  bucket: string,
  limit: number,
  seconds: number,
) {
  const [row] =
    await database()`insert into request_buckets(bucket,hits,expires_at) values(${bucket},1,now()+${seconds}*interval '1 second')
    on conflict(bucket) do update set hits=case when request_buckets.expires_at<=now() then 1 else request_buckets.hits+1 end,
    expires_at=case when request_buckets.expires_at<=now() then now()+${seconds}*interval '1 second' else request_buckets.expires_at end returning hits`;
  assert(
    row.hits <= limit,
    "RATE_LIMIT",
    "Too many attempts. Please wait a few minutes and try again.",
    429,
  );
}
export async function guestSession(token: string) {
  const tokenHash = hash(token);
  await database()`insert into guest_sessions(token_hash,expires_at) values(${tokenHash},now()+interval '30 days') on conflict(token_hash) do nothing`;
}
export async function validGuestSession(token: string) {
  const [g] =
    await database()`select id from guest_sessions where token_hash=${hash(token)} and expires_at>now()`;
  return !!g;
}
async function requireScheduler(sql: Tx) {
  if (localDemo()) return;
  const [extension] =
    await sql`select exists(select 1 from pg_extension where extname='pg_cron') as enabled`;
  assert(
    extension.enabled,
    "SCHEDULER",
    "Background expiration must be configured before opening online joins.",
    409,
  );
  const [job] =
    await sql`select exists(select 1 from cron.job where jobname='jokers-expire-waitlist' and active=true) as enabled`;
  assert(
    job.enabled,
    "SCHEDULER",
    "Enable the wait-list expiration job before opening online joins.",
    409,
  );
}
async function guest(sql: Tx, token: string) {
  const [g] =
    await sql`select * from guest_sessions where token_hash=${hash(token)} and expires_at>now()`;
  assert(
    g,
    "SESSION",
    "Your session expired. Reload the page or check with the floor.",
    401,
  );
  return g;
}
async function entries(sql: Tx, guestId?: string): Promise<Ticket[]> {
  const rows = await sql`
    select e.id,e.reference,e.display_name,e.game_id,g.name as game_name,g.stakes,e.state,e.joined_at,e.arrival_deadline,e.arrived_at,e.source,e.version,
      case when e.state=any(${active}::text[]) then (select count(*)::integer from waitlist_entries q where q.game_id=e.game_id and q.state=any(${active}::text[]) and (q.priority_at,q.sequence)<=(e.priority_at,e.sequence)) else 0 end as position,
      o.expires_at,s.label as seat_label
    from waitlist_entries e join games g on g.id=e.game_id
    left join lateral(select * from seat_offers where entry_id=e.id order by created_at desc limit 1) o on true
    left join seats s on s.id=o.seat_id
    where (${guestId ?? null}::uuid is null and e.state=any(${active}::text[])) or e.guest_id=${guestId ?? null}::uuid
    order by e.priority_at,e.sequence`;
  return rows as unknown as Ticket[];
}
async function common(sql: Tx) {
  const [policy] = await sql<
    Policy[]
  >`select arrival_minutes,offer_minutes,stale_minutes,policy_confirmed from club_settings`;
  const games = await sql<
    Game[]
  >`select g.id,g.name,g.variant,g.stakes,g.status,g.accepting,g.note,g.confirmed_at,g.version,
    (select count(*)::int from waitlist_entries e where e.game_id=g.id and e.state=any(${active}::text[])) as waiting,
    g.confirmed_at<now()-${policy.stale_minutes}*interval '1 minute' as stale from games g order by g.created_at,g.id`;
  return {
    policy,
    games,
    demo: process.env.DEMO_MODE === "true",
    server_time: new Date().toISOString(),
  };
}
export async function playerSnapshot(token: string): Promise<PlayerData> {
  return transaction(async (sql) => {
    const g = await guest(sql, token);
    const data = await common(sql);
    const list = await entries(sql, g.id);
    return {
      ...data,
      games: data.games.filter((g) => g.status !== "finished"),
      ticket:
        list.filter((e) => activeStates.includes(e.state)).at(-1) ??
        list.at(-1) ??
        null,
    };
  });
}
export async function staffSnapshot(staff: Staff): Promise<StaffData> {
  return transaction(async (sql) => {
    const current = await staffAccess(sql, staff);
    const data = await common(sql);
    const [session] =
      await sql`select id,opened_at from operating_sessions where closed_at is null`;
    const seats = await sql<
      Seat[]
    >`select s.*,exists(select 1 from seat_offers o where o.seat_id=s.id and resolved_at is null) as held from seats s where active=true order by label`;
    const team =
      current.role === "owner"
        ? await sql`select id,email,display_name,role,active from staff_members order by created_at`
        : [];
    const events =
      await sql`select id,action,created_at,details from audit_events order by id desc limit 40`;
    const [cron] =
      await sql`select exists(select 1 from pg_extension where extname='pg_cron') as enabled`;
    let scheduler = false;
    if (cron.enabled) {
      const [job] =
        await sql`select exists(select 1 from cron.job where jobname='jokers-expire-waitlist' and active=true) as enabled`;
      scheduler = job.enabled;
    }
    return {
      ...data,
      ticket: null,
      staff: current as Staff,
      entries: await entries(sql),
      seats,
      session: (session as StaffData["session"]) ?? null,
      team: team as Staff[],
      audit: events as unknown as StaffData["audit"],
      scheduler,
    };
  });
}
export async function joinQueue(
  token: string,
  requestId: string,
  input: { gameId: string; name: string; accepted: boolean },
) {
  return transaction(async (sql) => {
    const g = await guest(sql, token);
    return once(sql, `guest:${g.id}`, requestId, input, async () => {
      assert(
        input.accepted,
        "RULES",
        "Please acknowledge the arrival instructions.",
      );
      const [existing] =
        await sql`select id from waitlist_entries where guest_id=${g.id} and state=any(${active}::text[])`;
      assert(
        !existing,
        "ALREADY_JOINED",
        "You already have a spot. Open My spot to view it.",
        409,
      );
      const [policy] = await sql`select * from club_settings`;
      assert(
        policy.policy_confirmed,
        "POLICY",
        "Remote joining is not open yet. Please call the club.",
        409,
      );
      await requireScheduler(sql);
      const [game] =
        await sql`select g.* from games g join operating_sessions s on s.id=g.session_id where g.id=${input.gameId} and s.closed_at is null`;
      assert(
        game && game.accepting && ["running", "forming"].includes(game.status),
        "CLOSED",
        "This game is not accepting players right now.",
        409,
      );
      assert(
        new Date(game.confirmed_at).getTime() >
          Date.now() - policy.stale_minutes * 60000,
        "STALE",
        "The floor needs to confirm this game. Please call to join.",
        409,
      );
      const [e] =
        await sql`insert into waitlist_entries(game_id,guest_id,display_name,source,arrival_deadline)
        values(${game.id},${g.id},${input.name},'web',now()+${policy.arrival_minutes}*interval '1 minute') returning id`;
      await audit(sql, g.id, "guest", "joined", e.id, { gameId: game.id });
      return { id: e.id };
    });
  });
}
export async function playerCommand(
  token: string,
  requestId: string,
  action: "cancel" | "acknowledge",
  entryId: string,
) {
  return transaction(async (sql) => {
    const g = await guest(sql, token);
    return once(
      sql,
      `guest:${g.id}`,
      requestId,
      { action, entryId },
      async () => {
        const [e] =
          await sql`select * from waitlist_entries where id=${entryId} and guest_id=${g.id}`;
        assert(e, "NOT_FOUND", "That entry is not available.", 404);
        if (action === "cancel") {
          assert(
            activeStates.includes(e.state),
            "STATE",
            "This entry has already finished.",
            409,
          );
          await sql`update waitlist_entries set state='cancelled',ended_at=now(),version=version+1 where id=${e.id}`;
          await sql`update seat_offers set resolved_at=now(),resolution='cancelled' where entry_id=${e.id} and resolved_at is null`;
        } else {
          assert(
            e.state === "offered",
            "STATE",
            "This offer has expired or was already acknowledged. Refresh your spot.",
            409,
          );
          await sql`update waitlist_entries set state='acknowledged',version=version+1 where id=${e.id}`;
          await sql`update seat_offers set acknowledged_at=now() where entry_id=${e.id} and resolved_at is null`;
        }
        await audit(sql, g.id, "guest", action, e.id);
        return { ok: true };
      },
    );
  });
}
export type StaffCommand = { action: string; [key: string]: unknown };
export async function staffCommand(
  staff: Staff,
  requestId: string,
  input: StaffCommand,
) {
  return transaction(async (sql) => {
    const actor = await staffAccess(sql, staff);
    return once(sql, `staff:${staff.id}`, requestId, input, async () => {
      const action = input.action;
      let entity: string | null = null;
      const manager = () =>
        assert(
          ["owner", "manager"].includes(actor.role),
          "ROLE",
          "A manager or owner must do this.",
          403,
        );
      const owner = () =>
        assert(
          actor.role === "owner",
          "ROLE",
          "Only the owner can do this.",
          403,
        );
      if (action === "session_open") {
        const [session] =
          await sql`select id from operating_sessions where closed_at is null`;
        assert(!session, "SESSION", "A shift is already open.", 409);
        const [s] =
          await sql`insert into operating_sessions(opened_by) values(${staff.id}) returning id`;
        entity = s.id;
      } else if (action === "session_close") {
        manager();
        const [s] =
          await sql`select id from operating_sessions where closed_at is null`;
        assert(s, "SESSION", "There is no open shift.", 409);
        entity = s.id;
        await sql`update waitlist_entries set state='cancelled',ended_at=now(),version=version+1 where state=any(${active}::text[])`;
        await sql`update seat_offers set resolved_at=now(),resolution='shift_closed' where resolved_at is null`;
        await sql`update games set accepting=false,status='finished',confirmed_at=now(),version=version+1`;
        await sql`update seats set occupied=false`;
        await sql`update operating_sessions set closed_at=now() where id=${s.id}`;
      } else if (action === "game_create") {
        manager();
        const [g] =
          await sql`insert into games(name,variant,stakes) values(${String(input.name)},${String(input.variant)},${String(input.stakes)}) returning id`;
        entity = g.id;
      } else if (action === "game_update") {
        const [g] =
          await sql`select * from games where id=${String(input.gameId)}`;
        assert(g, "NOT_FOUND", "Game not found.", 404);
        entity = g.id;
        assert(
          g.version === input.version,
          "CONFLICT",
          "Someone else changed this game. Refresh and review it.",
          409,
        );
        const [s] =
          await sql`select id from operating_sessions where closed_at is null`;
        assert(
          input.status === "finished" || s,
          "SESSION",
          "Open a shift first.",
          409,
        );
        const [p] = await sql`select policy_confirmed from club_settings`;
        assert(
          !input.accepting || p.policy_confirmed,
          "POLICY",
          "An owner or manager must confirm the queue policy first.",
          409,
        );
        if (input.accepting) await requireScheduler(sql);
        const accepting =
          !!input.accepting &&
          ["running", "forming"].includes(String(input.status));
        if (input.status === "finished") {
          await sql`update waitlist_entries set state='cancelled',ended_at=now(),version=version+1 where game_id=${g.id} and state=any(${active}::text[])`;
          await sql`update seat_offers o set resolved_at=now(),resolution='game_finished' from waitlist_entries e where o.entry_id=e.id and e.game_id=${g.id} and o.resolved_at is null`;
          await sql`update seats set occupied=false where game_id=${g.id}`;
        }
        await sql`update games set status=${String(input.status)},accepting=${accepting},note=${String(input.note)},session_id=${s?.id ?? null},confirmed_at=now(),version=version+1 where id=${g.id}`;
      } else if (action === "seat_create") {
        const [g] =
          await sql`select id from games where id=${String(input.gameId)}`;
        assert(g, "NOT_FOUND", "Game not found.", 404);
        const [seat] =
          await sql`insert into seats(game_id,label) values(${g.id},${String(input.label)}) on conflict(game_id,label) do update set active=true returning id`;
        entity = seat.id;
      } else if (action === "seat_release") {
        const [held] =
          await sql`select id from seat_offers where seat_id=${String(input.seatId)} and resolved_at is null`;
        assert(
          !held,
          "HELD",
          "Resolve the active offer before releasing this seat.",
          409,
        );
        const [s] =
          await sql`update seats set occupied=false where id=${String(input.seatId)} returning id`;
        assert(s, "NOT_FOUND", "Seat not found.", 404);
        entity = s.id;
      } else if (action === "entry_add") {
        const [g] =
          await sql`select g.* from games g join operating_sessions s on s.id=g.session_id where g.id=${String(input.gameId)} and s.closed_at is null and g.status in ('running','forming','paused')`;
        assert(g, "CLOSED", "Open this game in the current shift first.", 409);
        const [p] = await sql`select arrival_minutes from club_settings`;
        const arrived = input.source === "walk_in";
        const [e] =
          await sql`insert into waitlist_entries(game_id,display_name,source,state,arrived_at,arrival_deadline)
          values(${g.id},${String(input.name)},${String(input.source)},${arrived ? "arrived" : "waiting"},${arrived ? new Date() : null},${arrived ? null : new Date(Date.now() + p.arrival_minutes * 60000)}) returning id`;
        entity = e.id;
      } else if (action.startsWith("entry_")) {
        const [e] =
          await sql`select * from waitlist_entries where id=${String(input.entryId)}`;
        assert(e, "NOT_FOUND", "Player not found.", 404);
        entity = e.id;
        assert(
          e.version === input.version,
          "CONFLICT",
          "This player’s status changed. Refresh before acting.",
          409,
        );
        assert(
          activeStates.includes(e.state),
          "STATE",
          "This entry has finished.",
          409,
        );
        if (action === "entry_arrive") {
          assert(
            e.state === "waiting",
            "STATE",
            "This player is already checked in.",
            409,
          );
          await sql`update waitlist_entries set state='arrived',arrived_at=now(),arrival_deadline=null,version=version+1 where id=${e.id}`;
        } else if (action === "entry_offer") {
          assert(
            e.state === "arrived",
            "ARRIVAL",
            "Confirm the player’s arrival before offering a seat.",
            409,
          );
          const [seat] =
            await sql`select * from seats where id=${String(input.seatId)} and game_id=${e.game_id} and active=true`;
          assert(
            seat && !seat.occupied,
            "SEAT",
            "This seat is not available.",
            409,
          );
          const [held] =
            await sql`select id from seat_offers where seat_id=${seat.id} and resolved_at is null`;
          assert(
            !held,
            "HELD",
            "Another player already has this seat offer.",
            409,
          );
          const [ahead] =
            await sql`select id from waitlist_entries where game_id=${e.game_id} and state='arrived' and (priority_at,sequence)<(${e.priority_at},${e.sequence}) limit 1`;
          if (ahead) {
            manager();
            assert(
              String(input.reason || "").trim().length >= 5,
              "REASON",
              "Explain why you are offering ahead of another checked-in player.",
            );
          }
          const [p] = await sql`select offer_minutes from club_settings`;
          await sql`insert into seat_offers(entry_id,seat_id,expires_at,offered_by) values(${e.id},${seat.id},now()+${p.offer_minutes}*interval '1 minute',${staff.id})`;
          await sql`update waitlist_entries set state='offered',version=version+1 where id=${e.id}`;
        } else if (action === "entry_seat") {
          assert(
            ["offered", "acknowledged"].includes(e.state),
            "STATE",
            "Offer an available seat first.",
            409,
          );
          const [o] =
            await sql`select * from seat_offers where entry_id=${e.id} and resolved_at is null and expires_at>now()`;
          assert(o, "EXPIRED", "The offer expired. Refresh the queue.", 409);
          await sql`update seats set occupied=true where id=${o.seat_id}`;
          await sql`update seat_offers set resolved_at=now(),resolution='seated' where id=${o.id}`;
          await sql`update waitlist_entries set state='seated',ended_at=now(),version=version+1 where id=${e.id}`;
        } else if (action === "entry_cancel" || action === "entry_no_show") {
          assert(
            String(input.reason || "").trim().length >= 3,
            "REASON",
            "Enter a short reason.",
          );
          await sql`update waitlist_entries set state=${action === "entry_cancel" ? "cancelled" : "no_show"},ended_at=now(),version=version+1 where id=${e.id}`;
          await sql`update seat_offers set resolved_at=now(),resolution=${action === "entry_cancel" ? "cancelled" : "no_show"} where entry_id=${e.id} and resolved_at is null`;
        } else if (action === "entry_move") {
          manager();
          assert(
            ["waiting", "arrived"].includes(e.state),
            "STATE",
            "Resolve the seat offer before changing priority.",
            409,
          );
          assert(
            String(input.reason || "").trim().length >= 5,
            "REASON",
            "Explain the priority override.",
          );
          await sql`update waitlist_entries set priority_at=(select coalesce(min(priority_at),now())-interval '1 second' from waitlist_entries where game_id=${e.game_id} and state=any(${active}::text[])),version=version+1 where id=${e.id}`;
        } else throw new AppError("ACTION", "Unknown action.");
      } else if (action === "policy_update") {
        manager();
        await sql`update club_settings set arrival_minutes=${Number(input.arrivalMinutes)},offer_minutes=${Number(input.offerMinutes)},stale_minutes=${Number(input.staleMinutes)},policy_confirmed=true,updated_at=now()`;
      } else if (action === "team_update") {
        owner();
        assert(
          String(input.staffId) !== staff.id,
          "SELF",
          "You cannot change your own owner access.",
        );
        const [s] =
          await sql`update staff_members set active=${!!input.active},role=${String(input.role)} where id=${String(input.staffId)} returning id`;
        assert(s, "NOT_FOUND", "Staff member not found.", 404);
        entity = s.id;
      } else throw new AppError("ACTION", "Unknown action.");
      await audit(sql, staff.id, "staff", action, entity, {
        ...input,
        action: undefined,
      } as Record<string, unknown>);
      return { ok: true, id: entity };
    });
  });
}

export async function registerStaff(
  actor: Staff,
  user: { id: string; email: string; name: string; role: string },
) {
  return transaction(async (sql) => {
    await staffAccess(sql, actor, ["owner"]);
    await sql`insert into staff_members(id,email,display_name,role) values(${user.id},${user.email},${user.name},${user.role})`;
    await audit(sql, actor.id, "staff", "staff_created", user.id, {
      email: user.email,
      role: user.role,
    });
  });
}
