"use client";
import { useRef, useState } from "react";
import { request, usePoll, time } from "@/lib/client";
import type { Game, StaffData, Ticket } from "@/lib/types";

type Command = Record<string, unknown> & { action: string };
export default function StaffDesk() {
  const { data, error, loading, updated, reload } =
    usePoll<StaffData>("/api/staff");
  const [tab, setTab] = useState("queue"),
    [gameId, setGameId] = useState(""),
    [busy, setBusy] = useState(false),
    [failure, setFailure] = useState(""),
    [success, setSuccess] = useState("");
  const [dialog, setDialog] = useState<{
    title: string;
    command: Command;
    entry?: Ticket;
    kind: "offer" | "reason" | "close";
  } | null>(null);
  const modal = useRef<HTMLDialogElement>(null),
    pending = useRef<{ key: string; fingerprint: string } | null>(null);
  async function command(input: Command) {
    setBusy(true);
    setFailure("");
    setSuccess("");
    const fingerprint = JSON.stringify(input);
    if (pending.current?.fingerprint !== fingerprint)
      pending.current = { key: crypto.randomUUID(), fingerprint };
    try {
      await request("/api/staff/action", {
        ...input,
        requestId: pending.current!.key,
      });
      pending.current = null;
      setSuccess("Saved. The floor and player pages are up to date.");
      modal.current?.close();
      setDialog(null);
      await reload();
      return true;
    } catch (e) {
      setFailure(e instanceof Error ? e.message : "Could not save.");
      await reload();
      return false;
    } finally {
      setBusy(false);
    }
  }
  function openDialog(value: NonNullable<typeof dialog>) {
    setFailure("");
    setDialog(value);
    modal.current?.showModal();
  }
  const game = data?.games.find((g) => g.id === gameId) ?? data?.games[0];
  const entries = data?.entries.filter((e) => e.game_id === game?.id) ?? [];
  const manager =
    data?.staff.role === "owner" || data?.staff.role === "manager";
  return (
    <>
      {data?.demo && (
        <div className="demo-banner">
          <strong>Local demonstration</strong> · Synthetic games and test-only
          staff login.
        </div>
      )}
      <div className="staff-intro">
        <div>
          <p className="wl-eyebrow">
            WELCOME BACK
            {data ? `, ${data.staff.display_name.toUpperCase()}` : ""}
          </p>
          <h1>The floor desk.</h1>
        </div>
        <div className="staff-tools">
          <a
            className="wl-button secondary small"
            href="/play"
            target="_blank"
            rel="noreferrer"
          >
            Player view ↗
          </a>
          <button
            className="text-button"
            onClick={async () => {
              await request("/api/auth/logout", {});
              window.location.assign("/staff/login");
            }}
          >
            Sign out
          </button>
        </div>
      </div>
      {error && (
        <div className="notice error" role="alert">
          {error}
          <button onClick={() => void reload()}>Reconnect</button>
        </div>
      )}
      {failure && (
        <div className="notice error" role="alert">
          {failure}
        </div>
      )}
      {success && (
        <div className="notice" role="status">
          {success}
        </div>
      )}
      {loading && !data && (
        <p role="status" className="loading-state">
          Opening the floor desk…
        </p>
      )}
      {data && (
        <>
          <div className="shift-strip">
            <span
              className={`status-pill ${data.session ? "running" : "paused"}`}
            >
              <i />
              {data.session
                ? `Shift opened ${time(data.session.opened_at)}`
                : "No active shift"}
            </span>
            <span>{data.entries.length} on the list</span>
            <span className="last-sync">
              Synced {updated ? time(updated.toISOString()) : "—"}
            </span>
            {!data.session ? (
              <button
                className="wl-button small"
                disabled={busy}
                onClick={() => void command({ action: "session_open" })}
              >
                Open a shift
              </button>
            ) : (
              manager && (
                <button
                  className="text-button danger"
                  disabled={busy}
                  onClick={() =>
                    openDialog({
                      title: "Close this shift?",
                      kind: "close",
                      command: { action: "session_close" },
                    })
                  }
                >
                  Close shift
                </button>
              )
            )}
          </div>
          {!data.policy.policy_confirmed && (
            <div className="notice">
              A manager must confirm the arrival and seat-offer rules before
              opening online joins.
            </div>
          )}
          {!data.scheduler && !data.demo && (
            <div className="notice">
              Background expiration is not scheduled. Enable the Supabase Cron
              job before accepting live players.
            </div>
          )}
          <nav className="staff-tabs" aria-label="Staff workspace">
            {[
              ["queue", "Wait-list"],
              ["room", "Games & seats"],
              ...(manager ? [["rules", "Queue rules"]] : []),
              ...(data.staff.role === "owner" ? [["team", "Team"]] : []),
              ["audit", "Activity"],
              ["account", "My account"],
            ].map(([id, label]) => (
              <button
                key={id}
                aria-current={tab === id ? "page" : undefined}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>
          {(tab === "queue" || tab === "room") && (
            <div className="game-switcher" aria-label="Select game">
              {data.games.map((g) => (
                <button
                  key={g.id}
                  className={game?.id === g.id ? "selected" : ""}
                  onClick={() => setGameId(g.id)}
                >
                  <span>{g.stakes}</span>
                  {g.name}
                  <strong>{g.waiting}</strong>
                </button>
              ))}
              {!data.games.length && (
                <div className="empty-state">
                  <h2>Set up your first game.</h2>
                  <p>A manager can create games in Games & seats.</p>
                </div>
              )}
            </div>
          )}
          {tab === "queue" && game && (
            <div className="staff-queue-layout">
              <section>
                <div className="list-heading">
                  <div>
                    <p className="wl-eyebrow">
                      {game.stakes} · {game.name}
                    </p>
                    <h2>
                      {entries.length
                        ? `${entries.length} ${entries.length === 1 ? "player" : "players"} in line`
                        : "A clean slate."}
                    </h2>
                  </div>
                  <span className={`status-pill ${game.status}`}>
                    <i />
                    {game.status}
                  </span>
                </div>
                {!entries.length && (
                  <div className="empty-state compact">
                    <span className="empty-suit">♠</span>
                    <h3>Ready for the next player.</h3>
                    <p>
                      Online joins and staff-added players will appear here.
                    </p>
                  </div>
                )}
                <div className="roster">
                  {entries.map((e) => (
                    <article className="roster-row" key={e.id}>
                      <div className="roster-position">{e.position}</div>
                      <div className="roster-person">
                        <h3>{e.display_name}</h3>
                        <p>
                          {e.reference} · {e.source.replace("_", " ")} ·{" "}
                          {time(e.joined_at)}
                        </p>
                        <span className={`entry-pill ${e.state}`}>
                          {e.state === "acknowledged"
                            ? "Offer acknowledged"
                            : e.state.replace("_", " ")}
                        </span>
                        {e.seat_label &&
                          ["offered", "acknowledged"].includes(e.state) && (
                            <p>
                              {e.seat_label} · Hold until {time(e.expires_at)}
                            </p>
                          )}
                        {e.state === "waiting" && (
                          <p>Arrive by {time(e.arrival_deadline)}</p>
                        )}
                      </div>
                      <div className="roster-actions">
                        {e.state === "waiting" && (
                          <button
                            className="wl-button small"
                            disabled={busy}
                            onClick={() =>
                              void command({
                                action: "entry_arrive",
                                entryId: e.id,
                                version: e.version,
                              })
                            }
                          >
                            Check in
                          </button>
                        )}
                        {e.state === "arrived" && (
                          <button
                            className="wl-button small"
                            disabled={busy}
                            onClick={() =>
                              openDialog({
                                title: `Offer a seat to ${e.display_name}`,
                                kind: "offer",
                                entry: e,
                                command: {
                                  action: "entry_offer",
                                  entryId: e.id,
                                  version: e.version,
                                },
                              })
                            }
                          >
                            Offer seat
                          </button>
                        )}
                        {["offered", "acknowledged"].includes(e.state) && (
                          <button
                            className="wl-button small"
                            disabled={busy}
                            onClick={() =>
                              void command({
                                action: "entry_seat",
                                entryId: e.id,
                                version: e.version,
                              })
                            }
                          >
                            Confirm seated
                          </button>
                        )}
                        <details className="entry-options">
                          <summary>More actions</summary>
                          <button
                            disabled={busy}
                            onClick={() =>
                              openDialog({
                                title: `Remove ${e.display_name}`,
                                kind: "reason",
                                command: {
                                  action: "entry_cancel",
                                  entryId: e.id,
                                  version: e.version,
                                },
                              })
                            }
                          >
                            Cancel entry
                          </button>
                          <button
                            disabled={busy}
                            onClick={() =>
                              openDialog({
                                title: `Mark ${e.display_name} a no-show`,
                                kind: "reason",
                                command: {
                                  action: "entry_no_show",
                                  entryId: e.id,
                                  version: e.version,
                                },
                              })
                            }
                          >
                            Mark no-show
                          </button>
                          {manager &&
                            ["waiting", "arrived"].includes(e.state) && (
                              <button
                                disabled={busy}
                                onClick={() =>
                                  openDialog({
                                    title: `Move ${e.display_name} to front`,
                                    kind: "reason",
                                    command: {
                                      action: "entry_move",
                                      entryId: e.id,
                                      version: e.version,
                                    },
                                  })
                                }
                              >
                                Move to front
                              </button>
                            )}
                        </details>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
              <aside className="staff-panel">
                <p className="wl-eyebrow">WELCOME THEM IN</p>
                <h2>Add a player</h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget,
                      f = new FormData(form);
                    if (
                      await command({
                        action: "entry_add",
                        gameId: game.id,
                        name: f.get("name"),
                        source: f.get("source"),
                      })
                    )
                      form.reset();
                  }}
                >
                  <label htmlFor="walkin-name">Player name</label>
                  <input
                    id="walkin-name"
                    name="name"
                    required
                    minLength={2}
                    maxLength={40}
                  />
                  <label htmlFor="source">Joining from</label>
                  <select id="source" name="source">
                    <option value="walk_in">Walk-in · already here</option>
                    <option value="phone">Phone · arriving later</option>
                  </select>
                  <button
                    className="wl-button full"
                    disabled={busy || game.status === "finished"}
                  >
                    Add to list ↗
                  </button>
                </form>
                <p className="fine-print">
                  Walk-ins are checked in immediately. A phone entry follows the
                  arrival deadline. Both use the same queue.
                </p>
              </aside>
            </div>
          )}
          {tab === "room" && (
            <>
              <div className="room-grid">
                {game && (
                  <>
                    <GameEditor
                      key={`${game.id}:${game.version}`}
                      game={game}
                      busy={busy}
                      command={command}
                    />
                    <section className="staff-panel">
                      <p className="wl-eyebrow">THE ACTUAL SEATS</p>
                      <h2>Seats for {game.stakes}</h2>
                      <p>
                        Mark a seat free only when the player has left. Active
                        offers reserve their seats.
                      </p>
                      <div className="seat-list">
                        {data.seats
                          .filter((s) => s.game_id === game.id)
                          .map((s) => (
                            <div key={s.id}>
                              <span>
                                <strong>{s.label}</strong>
                                <small>
                                  {s.held
                                    ? "Offer pending"
                                    : s.occupied
                                      ? "Occupied"
                                      : "Available"}
                                </small>
                              </span>
                              {s.occupied && !s.held && (
                                <button
                                  className="wl-button secondary small"
                                  disabled={busy}
                                  onClick={() =>
                                    void command({
                                      action: "seat_release",
                                      seatId: s.id,
                                    })
                                  }
                                >
                                  Mark free
                                </button>
                              )}
                            </div>
                          ))}
                      </div>
                      <form
                        className="inline-form"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const form = e.currentTarget,
                            f = new FormData(form);
                          if (
                            await command({
                              action: "seat_create",
                              gameId: game.id,
                              label: f.get("label"),
                            })
                          )
                            form.reset();
                        }}
                      >
                        <label htmlFor="seat-label">
                          Add an actual available seat
                        </label>
                        <input
                          id="seat-label"
                          name="label"
                          placeholder="Table 1 · Seat 4"
                          minLength={2}
                          maxLength={40}
                          required
                        />
                        <button className="wl-button secondary" disabled={busy}>
                          Add seat
                        </button>
                      </form>
                    </section>
                  </>
                )}
              </div>
              {manager && (
                <section className="staff-panel new-game-panel">
                  <h2>Create a game</h2>
                  <form
                    className="form-grid"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget,
                        f = new FormData(form);
                      if (
                        await command({
                          action: "game_create",
                          name: f.get("name"),
                          variant: f.get("variant"),
                          stakes: f.get("stakes"),
                        })
                      )
                        form.reset();
                    }}
                  >
                    <label>
                      Name
                      <input
                        name="name"
                        placeholder="No Limit Hold’em"
                        required
                        minLength={2}
                        maxLength={40}
                      />
                    </label>
                    <label>
                      Variant
                      <input
                        name="variant"
                        placeholder="Hold’em"
                        required
                        minLength={2}
                        maxLength={50}
                      />
                    </label>
                    <label>
                      Stakes
                      <input
                        name="stakes"
                        placeholder="$1 / $2"
                        required
                        maxLength={30}
                      />
                    </label>
                    <button className="wl-button" disabled={busy}>
                      Create game
                    </button>
                  </form>
                  <p className="fine-print">
                    New games start closed. Open a shift, then choose their
                    status and online join availability.
                  </p>
                </section>
              )}
            </>
          )}
          {tab === "rules" && manager && (
            <section className="staff-panel rules-panel">
              <p className="wl-eyebrow">SET THE EXPECTATIONS</p>
              <h2>House rules for the list.</h2>
              <p>
                These settings are published to players before they join.
                Updates apply to new entries and offers; existing deadlines stay
                the same.
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  await command({
                    action: "policy_update",
                    arrivalMinutes: Number(f.get("arrival")),
                    offerMinutes: Number(f.get("offer")),
                    staleMinutes: Number(f.get("stale")),
                  });
                }}
              >
                <label>
                  Arrival deadline (minutes)
                  <input
                    type="number"
                    name="arrival"
                    min={5}
                    max={240}
                    defaultValue={data.policy.arrival_minutes}
                    required
                  />
                </label>
                <label>
                  Seat-offer window (minutes)
                  <input
                    type="number"
                    name="offer"
                    min={1}
                    max={30}
                    defaultValue={data.policy.offer_minutes}
                    required
                  />
                </label>
                <label>
                  Require game reconfirmation after (minutes)
                  <input
                    type="number"
                    name="stale"
                    min={5}
                    max={120}
                    defaultValue={data.policy.stale_minutes}
                    required
                  />
                </label>
                <label className="check-label">
                  <input type="checkbox" required />I confirm these are the
                  club’s approved queue rules.
                </label>
                <button className="wl-button" disabled={busy}>
                  Confirm & publish rules
                </button>
              </form>
              <p className="fine-print">
                One active list per device. Queue order follows join time; staff
                offers seats to checked-in players. Managers must give a reason
                for priority overrides.
              </p>
            </section>
          )}
          {tab === "team" && data.staff.role === "owner" && (
            <div className="room-grid">
              <section className="staff-panel">
                <h2>Your crew</h2>
                {data.team.map((person) => (
                  <div className="team-row" key={person.id}>
                    <div>
                      <strong>{person.display_name}</strong>
                      <p>{person.email}</p>
                      <span>
                        {person.role}
                        {(person as typeof person & { active: boolean })
                          .active === false
                          ? " · disabled"
                          : ""}
                      </span>
                    </div>
                    {person.id !== data.staff.id && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const f = new FormData(e.currentTarget);
                          void command({
                            action: "team_update",
                            staffId: person.id,
                            role: f.get("role"),
                            active: f.get("active") === "on",
                          });
                        }}
                      >
                        <label
                          className="sr-only"
                          htmlFor={`role-${person.id}`}
                        >
                          Role for {person.display_name}
                        </label>
                        <select
                          id={`role-${person.id}`}
                          name="role"
                          defaultValue={person.role}
                        >
                          <option value="floor">Floor</option>
                          <option value="manager">Manager</option>
                          <option value="owner">Owner</option>
                        </select>
                        <label className="check-label">
                          <input
                            name="active"
                            type="checkbox"
                            defaultChecked={
                              (person as typeof person & { active: boolean })
                                .active !== false
                            }
                          />
                          Active
                        </label>
                        <button
                          className="wl-button secondary small"
                          disabled={busy}
                        >
                          Save
                        </button>
                      </form>
                    )}
                  </div>
                ))}
              </section>
              <section className="staff-panel">
                <h2>Add staff access</h2>
                <p>
                  Create an individual account. Share the temporary password
                  with the staff member directly; they can change it in My
                  account.
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget,
                      f = new FormData(form);
                    setBusy(true);
                    setFailure("");
                    try {
                      await request("/api/staff/team", {
                        name: f.get("name"),
                        email: f.get("email"),
                        password: f.get("password"),
                        role: f.get("role"),
                      });
                      form.reset();
                      setSuccess(
                        "Staff account created. No invitation email was sent.",
                      );
                      await reload();
                    } catch (err) {
                      setFailure(
                        err instanceof Error
                          ? err.message
                          : "Could not create account.",
                      );
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <label>
                    Name
                    <input name="name" required minLength={2} maxLength={40} />
                  </label>
                  <label>
                    Email
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="off"
                    />
                  </label>
                  <label>
                    Temporary password
                    <input
                      name="password"
                      type="password"
                      minLength={12}
                      maxLength={128}
                      required
                      autoComplete="new-password"
                    />
                  </label>
                  <label>
                    Role
                    <select name="role">
                      <option value="floor">Floor staff</option>
                      <option value="manager">Manager</option>
                      <option value="owner">Owner</option>
                    </select>
                  </label>
                  <button className="wl-button full" disabled={busy}>
                    Create staff account
                  </button>
                </form>
              </section>
            </div>
          )}
          {tab === "audit" && (
            <section className="staff-panel">
              <p className="wl-eyebrow">A CLEAR RECORD</p>
              <h2>Recent floor activity</h2>
              <div className="activity-list">
                {data.audit.map((item) => (
                  <div key={item.id}>
                    <strong>{item.action.replaceAll("_", " ")}</strong>
                    <time>{time(item.created_at)}</time>
                    {typeof item.details.reason === "string" && (
                      <p>{item.details.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {tab === "account" && (
            <section className="staff-panel rules-panel">
              <h2>Change your password</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget,
                    f = new FormData(form);
                  setBusy(true);
                  setFailure("");
                  try {
                    await request("/api/staff/password", {
                      currentPassword: f.get("currentPassword"),
                      password: f.get("password"),
                    });
                    form.reset();
                    setSuccess("Password changed.");
                  } catch (err) {
                    setFailure(
                      err instanceof Error
                        ? err.message
                        : "Could not update password.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <label>
                  Current password
                  <input
                    type="password"
                    name="currentPassword"
                    autoComplete="current-password"
                    required
                  />
                </label>
                <label>
                  New password
                  <input
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                  />
                </label>
                <button className="wl-button" disabled={busy}>
                  Change password
                </button>
              </form>
            </section>
          )}
        </>
      )}
      <dialog
        ref={modal}
        className="join-dialog"
        onCancel={(e) => {
          if (busy) e.preventDefault();
          else setDialog(null);
        }}
      >
        <button
          className="dialog-close"
          disabled={busy}
          aria-label="Close action"
          onClick={() => {
            modal.current?.close();
            setDialog(null);
          }}
        >
          ×
        </button>
        <p className="wl-eyebrow">THE FLOOR DESK</p>
        <h2>{dialog?.title}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!dialog) return;
            const f = new FormData(e.currentTarget);
            void command({
              ...dialog.command,
              ...(dialog.kind === "offer" ? { seatId: f.get("seatId") } : {}),
              ...(dialog.kind !== "close"
                ? { reason: f.get("reason") || "" }
                : {}),
            });
          }}
        >
          {dialog?.kind === "offer" && (
            <>
              <label htmlFor="offer-seat">Available seat</label>
              <select name="seatId" id="offer-seat" required defaultValue="">
                <option value="" disabled>
                  Select a seat
                </option>
                {data?.seats
                  .filter(
                    (s) =>
                      s.game_id === dialog.entry?.game_id &&
                      !s.occupied &&
                      !s.held,
                  )
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
              </select>
              <p className="fine-print">
                No seats? Add available seats in Games & seats. Offers are
                available to checked-in players.
              </p>
            </>
          )}
          {dialog?.kind !== "close" ? (
            <>
              <label htmlFor="action-reason">
                {dialog?.kind === "offer"
                  ? "Priority override reason (if needed)"
                  : "Reason"}
              </label>
              <textarea
                id="action-reason"
                name="reason"
                required={dialog?.kind === "reason"}
                minLength={dialog?.kind === "reason" ? 5 : undefined}
                maxLength={300}
              />
            </>
          ) : (
            <p>
              Online joins will stop. All remaining entries will be cancelled
              and seat holds released. This affects every game in the current
              shift.
            </p>
          )}
          {failure && (
            <p className="form-error" role="alert">
              {failure}
            </p>
          )}
          <button className="wl-button full" disabled={busy}>
            {busy
              ? "Saving…"
              : dialog?.kind === "close"
                ? "Close shift & resolve queue"
                : "Confirm action"}
          </button>
        </form>
      </dialog>
    </>
  );
}
function GameEditor({
  game,
  busy,
  command,
}: {
  game: Game;
  busy: boolean;
  command: (input: Command) => Promise<boolean>;
}) {
  return (
    <section className="staff-panel">
      <p className="wl-eyebrow">{game.stakes}</p>
      <h2>{game.name}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          void command({
            action: "game_update",
            gameId: game.id,
            version: game.version,
            status: f.get("status"),
            accepting: f.get("accepting") === "on",
            note: f.get("note"),
          });
        }}
      >
        <label>
          Status
          <select name="status" defaultValue={game.status}>
            <option value="forming">Forming</option>
            <option value="running">Running</option>
            <option value="paused">Paused</option>
            <option value="finished">
              Finished · cancels remaining entries
            </option>
          </select>
        </label>
        <label className="check-label">
          <input
            name="accepting"
            type="checkbox"
            defaultChecked={game.accepting}
          />
          Accept online joins
        </label>
        <label>
          Public note
          <textarea
            name="note"
            maxLength={200}
            defaultValue={game.note}
            placeholder="A short update from the floor"
          />
        </label>
        <button className="wl-button full" disabled={busy}>
          Save & confirm current status
        </button>
      </form>
      <p className="fine-print">
        Last confirmed {time(game.confirmed_at)}. Finishing a game cancels its
        remaining entries and releases seat holds.
      </p>
    </section>
  );
}
