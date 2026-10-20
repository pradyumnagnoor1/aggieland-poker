import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import nextEnv from "@next/env";
import { database, disconnect } from "../src/lib/db";
import {
  guestSession,
  joinQueue,
  playerSnapshot,
  playerCommand,
  staffCommand,
  staffSnapshot,
  rateLimit,
  validGuestSession,
} from "../src/lib/queue";
import { newToken, requireOrigin } from "../src/lib/security";
import type { Staff } from "../src/lib/types";

nextEnv.loadEnvConfig(process.cwd());
const testURL = process.env.TEST_DATABASE_URL;
if (!testURL || !new URL(testURL).pathname.endsWith("_test"))
  throw new Error(
    "Set TEST_DATABASE_URL to a dedicated database ending in _test. Tests never reset production.",
  );
process.env.DATABASE_URL = testURL;
const sql = database();
const owner: Staff = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "owner@test.local",
  display_name: "Owner",
  role: "owner",
};
const floor: Staff = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "floor@test.local",
  display_name: "Floor",
  role: "floor",
};
let gameId: string, seatId: string;
const cmd = (
  action: string,
  extra: Record<string, unknown> = {},
  who = owner,
  key = randomUUID(),
) => staffCommand(who, key, { action, ...extra });
async function reset() {
  await sql`truncate command_receipts,audit_events,seat_offers,waitlist_entries,guest_sessions,seats,games,operating_sessions,local_staff_sessions,staff_members,request_buckets restart identity cascade`;
  await sql`insert into staff_members(id,email,display_name,role) values(${owner.id},${owner.email},'Owner','owner'),(${floor.id},${floor.email},'Floor','floor')`;
  await sql`update club_settings set policy_confirmed=true,arrival_minutes=30,offer_minutes=5,stale_minutes=30`;
  await cmd("session_open");
  const s = await staffSnapshot(owner);
  const [game] =
    await sql`insert into games(name,variant,stakes,status,accepting,session_id) values('Test Hold’em','NLH','$1 / $2','running',true,${s.session!.id}) returning id`;
  gameId = game.id;
  const [seat] =
    await sql`insert into seats(game_id,label) values(${gameId},'Table 1 · Seat 1') returning id`;
  seatId = seat.id;
}
async function join(name = "Player") {
  const token = newToken();
  await guestSession(token);
  await joinQueue(token, randomUUID(), { gameId, name, accepted: true });
  return { token, ticket: (await playerSnapshot(token)).ticket! };
}
before(async () => {
  await sql.unsafe(
    await readFile("supabase/migrations/202610200001_waitlist.sql", "utf8"),
  );
  await sql.unsafe(
    await readFile("supabase/migrations/202610200002_retention.sql", "utf8"),
  );
});

test("production joins require the background expiration job", async () => {
  await reset();
  const token = newToken();
  await guestSession(token);
  const previous = process.env.DEMO_MODE;
  process.env.DEMO_MODE = "false";
  try {
    await assert.rejects(
      () =>
        joinQueue(token, randomUUID(), {
          gameId,
          name: "Player",
          accepted: true,
        }),
      /Background expiration/,
    );
  } finally {
    process.env.DEMO_MODE = previous;
  }
});

test("expired guest sessions cannot access a private ticket", async () => {
  await reset();
  const { token } = await join();
  assert.equal(await validGuestSession(token), true);
  await sql`update guest_sessions set expires_at=now()-interval '1 second'`;
  assert.equal(await validGuestSession(token), false);
  await assert.rejects(() => playerSnapshot(token), /session expired/);
});

test("retention anonymizes finished entries while preserving queue outcomes", async () => {
  await reset();
  const { token, ticket } = await join("Private former player");
  await playerCommand(token, randomUUID(), "cancel", ticket.id);
  await sql`update waitlist_entries set ended_at=now()-interval '91 days'`;
  await sql`select public.cleanup_waitlist_history()`;
  const [entry] =
    await sql`select display_name,guest_id,state from waitlist_entries where id=${ticket.id}`;
  assert.equal(entry.display_name, "Former player");
  assert.equal(entry.guest_id, null);
  assert.equal(entry.state, "cancelled");
});

test("public player responses exclude other names and staff identities", async () => {
  await reset();
  const a = await join("First private player");
  await join("Second private player");
  const snapshot = JSON.stringify(await playerSnapshot(a.token));
  assert.equal(snapshot.includes("First private player"), true);
  assert.equal(snapshot.includes("Second private player"), false);
  assert.equal(snapshot.includes(owner.email), false);
  assert.equal(snapshot.includes("token_hash"), false);
});
after(async () => {
  await disconnect();
});

test("persistent queue and private guest status", async () => {
  await reset();
  const a = await join("First"),
    b = await join("Second");
  assert.equal((await playerSnapshot(a.token)).ticket?.position, 1);
  assert.equal((await playerSnapshot(b.token)).ticket?.position, 2);
  await assert.rejects(
    () => playerCommand(a.token, randomUUID(), "cancel", b.ticket.id),
    /not available/,
  );
  await playerCommand(a.token, randomUUID(), "cancel", a.ticket.id);
  assert.equal((await playerSnapshot(b.token)).ticket?.position, 1);
  assert.equal((await playerSnapshot(b.token)).games[0].waiting, 1);
});
test("simultaneous duplicate joins are idempotent", async () => {
  await reset();
  const token = newToken();
  await guestSession(token);
  const key = randomUUID();
  const input = { gameId, name: "Same person", accepted: true };
  const [a, b] = await Promise.all([
    joinQueue(token, key, input),
    joinQueue(token, key, input),
  ]);
  assert.deepEqual(a, b);
  const [count] = await sql`select count(*)::int as n from waitlist_entries`;
  assert.equal(count.n, 1);
  await assert.rejects(
    () => joinQueue(token, randomUUID(), input),
    /already have a spot/,
  );
});
test("simultaneous different joins preserve unique ordered positions", async () => {
  await reset();
  const tokens = Array.from({ length: 10 }, newToken);
  await Promise.all(tokens.map(guestSession));
  await Promise.all(
    tokens.map((token, i) =>
      joinQueue(token, randomUUID(), {
        gameId,
        name: `Player ${i}`,
        accepted: true,
      }),
    ),
  );
  const positions = await Promise.all(
    tokens.map(async (t) => (await playerSnapshot(t)).ticket!.position),
  );
  assert.deepEqual(
    positions.sort((a, b) => a - b),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  );
});
test("check-in required and only one simultaneous offer for a seat", async () => {
  await reset();
  const a = await join("First"),
    b = await join("Second");
  await assert.rejects(
    () => cmd("entry_offer", { entryId: a.ticket.id, version: 1, seatId }),
    /Confirm.*arrival/,
  );
  await cmd("entry_arrive", { entryId: a.ticket.id, version: 1 });
  await cmd("entry_arrive", { entryId: b.ticket.id, version: 1 });
  const results = await Promise.allSettled([
    cmd("entry_offer", { entryId: a.ticket.id, version: 2, seatId }),
    cmd("entry_offer", {
      entryId: b.ticket.id,
      version: 2,
      seatId,
      reason: "Manager approved exception",
    }),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  const [count] =
    await sql`select count(*)::int as n from seat_offers where resolved_at is null`;
  assert.equal(count.n, 1);
});
test("acknowledgment does not seat a player; staff seating occupies seat", async () => {
  await reset();
  const a = await join();
  await cmd("entry_arrive", { entryId: a.ticket.id, version: 1 });
  await cmd("entry_offer", { entryId: a.ticket.id, version: 2, seatId });
  await playerCommand(a.token, randomUUID(), "acknowledge", a.ticket.id);
  let s = await staffSnapshot(owner);
  assert.equal(s.entries[0].state, "acknowledged");
  assert.equal(s.seats[0].occupied, false);
  await cmd("entry_seat", { entryId: a.ticket.id, version: 4 });
  s = await staffSnapshot(owner);
  assert.equal(s.entries.length, 0);
  assert.equal(s.seats[0].occupied, true);
  assert.equal(s.seats[0].held, false);
});
test("offer expires without any browser and releases seat", async () => {
  await reset();
  const a = await join();
  await cmd("entry_arrive", { entryId: a.ticket.id, version: 1 });
  await cmd("entry_offer", { entryId: a.ticket.id, version: 2, seatId });
  await sql`update seat_offers set expires_at=now()-interval '1 second'`;
  await sql`select public.expire_waitlist()`;
  const s = await staffSnapshot(owner);
  assert.equal(s.entries.length, 0);
  assert.equal(s.seats[0].held, false);
  assert.equal((await playerSnapshot(a.token)).ticket?.state, "expired");
  await assert.rejects(
    () => cmd("entry_seat", { entryId: a.ticket.id, version: 3 }),
    /status changed|finished/,
  );
});
test("arrival deadline expires remote joins but not checked-in players", async () => {
  await reset();
  const a = await join("Waiting"),
    b = await join("Arrived");
  await cmd("entry_arrive", { entryId: b.ticket.id, version: 1 });
  await sql`update waitlist_entries set arrival_deadline=now()-interval '1 second'`;
  await sql`select public.expire_waitlist()`;
  assert.equal((await playerSnapshot(a.token)).ticket?.state, "expired");
  assert.equal((await playerSnapshot(b.token)).ticket?.state, "arrived");
});
test("floor role cannot edit policy, grant access, or override ordering", async () => {
  await reset();
  await assert.rejects(
    () =>
      cmd(
        "policy_update",
        { arrivalMinutes: 20, offerMinutes: 3, staleMinutes: 30 },
        floor,
      ),
    /manager or owner/,
  );
  await assert.rejects(
    () =>
      cmd(
        "team_update",
        { staffId: floor.id, role: "owner", active: true },
        floor,
      ),
    /Only the owner/,
  );
  const p = await join();
  await assert.rejects(
    () =>
      cmd(
        "entry_move",
        { entryId: p.ticket.id, version: 1, reason: "Priority override" },
        floor,
      ),
    /manager or owner/,
  );
});
test("server rechecks revoked staff and does not trust supplied role", async () => {
  await reset();
  await sql`update staff_members set active=false where id=${floor.id}`;
  await assert.rejects(
    () => staffSnapshot({ ...floor, role: "owner" }),
    /removed/,
  );
});
test("priority changes require a reason and are audited", async () => {
  await reset();
  const a = await join("First"),
    b = await join("Second");
  await assert.rejects(
    () => cmd("entry_move", { entryId: b.ticket.id, version: 1, reason: "" }),
    /Explain/,
  );
  await cmd("entry_move", {
    entryId: b.ticket.id,
    version: 1,
    reason: "Correcting a floor entry error",
  });
  assert.equal((await playerSnapshot(b.token)).ticket?.position, 1);
  assert.equal((await playerSnapshot(a.token)).ticket?.position, 2);
  const [event] =
    await sql`select details from audit_events where action='entry_move'`;
  assert.equal(event.details.reason, "Correcting a floor entry error");
});
test("optimistic version prevents stale staff actions", async () => {
  await reset();
  const a = await join();
  await cmd("entry_arrive", { entryId: a.ticket.id, version: 1 });
  await assert.rejects(
    () =>
      cmd("entry_cancel", {
        entryId: a.ticket.id,
        version: 1,
        reason: "Stale action",
      }),
    /status changed/,
  );
});
test("finishing a game cancels entries and prevents new joins", async () => {
  await reset();
  const a = await join();
  const [g] = await sql`select version from games where id=${gameId}`;
  await cmd("game_update", {
    gameId,
    version: g.version,
    status: "finished",
    accepting: false,
    note: "",
  });
  assert.equal((await playerSnapshot(a.token)).ticket?.state, "cancelled");
  const token = newToken();
  await guestSession(token);
  await assert.rejects(
    () =>
      joinQueue(token, randomUUID(), {
        gameId,
        name: "Late player",
        accepted: true,
      }),
    /not accepting/,
  );
});
test("stale games and unconfirmed policy prevent remote joins", async () => {
  await reset();
  const token = newToken();
  await guestSession(token);
  await sql`update games set confirmed_at=now()-interval '1 hour'`;
  await assert.rejects(
    () =>
      joinQueue(token, randomUUID(), {
        gameId,
        name: "Player",
        accepted: true,
      }),
    /confirm this game/,
  );
  await sql`update games set confirmed_at=now()`;
  await sql`update club_settings set policy_confirmed=false`;
  await assert.rejects(
    () =>
      joinQueue(token, randomUUID(), {
        gameId,
        name: "Player",
        accepted: true,
      }),
    /not open yet/,
  );
});
test("closing shift resolves all entries and held seats", async () => {
  await reset();
  const a = await join();
  await cmd("entry_arrive", { entryId: a.ticket.id, version: 1 });
  await cmd("entry_offer", { entryId: a.ticket.id, version: 2, seatId });
  await cmd("session_close");
  const s = await staffSnapshot(owner);
  assert.equal(s.session, null);
  assert.equal(s.entries.length, 0);
  assert.equal(s.seats[0].held, false);
  assert.equal(s.games[0].accepting, false);
});
test("same request ID cannot be reused for different commands", async () => {
  await reset();
  const a = await join();
  const key = randomUUID();
  await cmd("entry_arrive", { entryId: a.ticket.id, version: 1 }, owner, key);
  await assert.rejects(
    () =>
      cmd(
        "entry_cancel",
        { entryId: a.ticket.id, version: 2, reason: "Changed request" },
        owner,
        key,
      ),
    /another action/,
  );
});
test("rate limiting is atomic and mutation origin checks reject cross-site requests", async () => {
  await reset();
  await rateLimit("test", 1, 60);
  await assert.rejects(() => rateLimit("test", 1, 60), /Too many attempts/);
  process.env.APP_ORIGIN = "https://jokers.example";
  assert.throws(
    () =>
      requireOrigin(
        new Request("https://jokers.example/api/player", {
          method: "POST",
          headers: { origin: "https://attacker.example" },
        }),
      ),
    /reload/,
  );
  assert.doesNotThrow(() =>
    requireOrigin(
      new Request("https://jokers.example/api/player", {
        method: "POST",
        headers: { origin: "https://jokers.example" },
      }),
    ),
  );
});
