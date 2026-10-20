"use client";
import { useEffect, useRef, useState } from "react";
import { request, usePoll, time, ago } from "@/lib/client";
import type { Game, PlayerData, Ticket } from "@/lib/types";

const active = ["waiting", "arrived", "offered", "acknowledged"];
export default function Player({ status = false }: { status?: boolean }) {
  const { data, error, loading, updated, reload } =
    usePoll<PlayerData>("/api/player");
  const [joining, setJoining] = useState<Game | null>(null),
    [busy, setBusy] = useState(false),
    [failure, setFailure] = useState(""),
    [sound, setSound] = useState(false);
  const [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null),
    name = useRef<HTMLInputElement>(null),
    opener = useRef<HTMLButtonElement | null>(null),
    requestId = useRef<string | null>(null),
    audio = useRef<AudioContext | null>(null),
    lastState = useRef("");
  const ticket = data?.ticket;
  useEffect(() => {
    if (joining) {
      dialog.current?.showModal();
      name.current?.focus();
    }
  }, [joining]);
  useEffect(() => {
    const state = ticket?.state || "";
    if (
      state === "offered" &&
      lastState.current &&
      lastState.current !== state &&
      sound &&
      audio.current
    ) {
      const ctx = audio.current;
      const osc = ctx.createOscillator(),
        gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
    }
    lastState.current = state;
  }, [ticket?.state, sound]);
  const close = () => {
    if (busy) return;
    dialog.current?.close();
    setJoining(null);
    setFailure("");
    requestId.current = null;
    opener.current?.focus();
  };
  async function join(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!joining) return;
    setBusy(true);
    setFailure("");
    const form = new FormData(event.currentTarget);
    requestId.current ??= crypto.randomUUID();
    try {
      await request("/api/player", {
        requestId: requestId.current,
        gameId: joining.id,
        name: form.get("name"),
        accepted: form.get("accepted") === "on",
      });
      window.location.assign("/play/status");
    } catch (e) {
      setFailure(e instanceof Error ? e.message : "Could not join.");
    } finally {
      setBusy(false);
    }
  }
  async function action(action: "cancel" | "acknowledge") {
    if (!ticket) return;
    if (
      action === "cancel" &&
      !confirm("Leave the wait-list? Your position will be released.")
    )
      return;
    setBusy(true);
    setFailure("");
    try {
      await request("/api/player/action", {
        requestId: crypto.randomUUID(),
        entryId: ticket.id,
        action,
      });
      setNotice(
        action === "cancel"
          ? "You have left the list."
          : "Acknowledged. Please see the floor to be seated.",
      );
      await reload();
    } catch (e) {
      setFailure(e instanceof Error ? e.message : "Could not update.");
      await reload();
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {data?.demo && (
        <div className="demo-banner">
          <strong>Demonstration</strong> · Synthetic games. This is not the
          club’s live queue.
        </div>
      )}
      {data?.setup && (
        <div className="notice">
          Online joining is being set up. Please call the floor to check
          tonight’s games.
        </div>
      )}
      <div className="page-intro">
        <p className="wl-eyebrow">
          {status ? "YOUR NEXT HAND" : "THE JOKERS CHECK-IN DESK"}
        </p>
        <h1>
          {status ? (
            "A spot with your name on it."
          ) : (
            <>
              Good company.
              <br />
              Your kind of game.
            </>
          )}
        </h1>
        <p>
          {status
            ? "Your place in line, without the guesswork."
            : "Find your game, get on the list, and check in with the floor when you arrive."}
        </p>
      </div>
      {error && (
        <div role="alert" className="notice error">
          {error} {data && "Showing your last retrieved status."}
          <button type="button" onClick={() => void reload()}>
            Try again
          </button>
        </div>
      )}
      {failure && (
        <div role="alert" className="notice error">
          {failure}
        </div>
      )}
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      {loading && !data && (
        <div className="loading-state" role="status">
          <span className="loading-dot" /> Checking with the floor…
        </div>
      )}
      {status && data && (
        <div className="ticket-layout">
          <div>
            {ticket ? (
              <TicketCard ticket={ticket} busy={busy} action={action} />
            ) : (
              <div className="empty-state">
                <span className="empty-suit">♠</span>
                <h2>Your next hand starts here.</h2>
                <p>You haven’t joined a game on this device yet.</p>
                <a className="wl-button" href="/play">
                  Find your game ↗
                </a>
              </div>
            )}
          </div>
          <aside className="player-aside">
            <p className="wl-eyebrow">A LITTLE HOUSEKEEPING</p>
            <h2>
              We’ll see you
              <br />
              at the floor.
            </h2>
            <ol className="instructions">
              <li>
                <span>01</span>Keep this page open for updates.
              </li>
              <li>
                <span>02</span>Check in with staff when you arrive.
              </li>
              <li>
                <span>03</span>Wait for your seat offer, then see the floor.
              </li>
            </ol>
            <button
              className="wl-button secondary"
              onClick={async () => {
                if (!sound) {
                  audio.current ??= new AudioContext();
                  await audio.current.resume();
                }
                setSound(!sound);
              }}
              aria-pressed={sound}
            >
              {sound ? "♪ Sound on" : "Enable seat-ready sound"}
            </button>
            <p className="fine-print">
              Alerts appear on this page. A closed or sleeping browser may miss
              them. No text messages are sent.
            </p>
            <a className="inline-link" href="tel:+19794462077">
              Questions? Call the club ↗
            </a>
          </aside>
        </div>
      )}
      {!status && data && (
        <div className="games-layout">
          <section
            className="game-list-panel"
            aria-labelledby="tonight-heading"
          >
            <div className="list-heading">
              <div>
                <span className="wl-eyebrow">PULL UP A CHAIR</span>
                <h2 id="tonight-heading">Tonight’s lineup</h2>
              </div>
              <span className="count-tag">
                {data.games.filter((g) => g.status !== "finished").length} games
              </span>
            </div>
            {!data.games.length && (
              <div className="empty-state">
                <span className="empty-suit">♣</span>
                <h3>The room is getting ready.</h3>
                <p>
                  No games are accepting online joins yet. Call the floor for
                  tonight’s lineup.
                </p>
                <a className="wl-button secondary" href="tel:+19794462077">
                  Call (979) 446-2077 ↗
                </a>
              </div>
            )}
            {data.games.map((game, index) => {
              const canJoin =
                game.accepting &&
                ["running", "forming"].includes(game.status) &&
                !game.stale &&
                data.policy.policy_confirmed;
              return (
                <article className="game-row" key={game.id}>
                  <div className="game-index">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="game-detail">
                    <div className="game-row-top">
                      <span className="stakes">{game.stakes}</span>
                      <span className={`status-pill ${game.status}`}>
                        <i />
                        {game.status}
                      </span>
                    </div>
                    <h3>{game.name}</h3>
                    <p>
                      {game.variant} <span aria-hidden="true">·</span>{" "}
                      {game.waiting} {game.waiting === 1 ? "player" : "players"}{" "}
                      waiting
                    </p>
                    {game.note && <p className="game-note">{game.note}</p>}
                    <span className={`freshness ${game.stale ? "stale" : ""}`}>
                      {game.stale
                        ? "Update needed · call to confirm"
                        : ago(game.confirmed_at)}
                    </span>
                  </div>
                  <div className="game-action">
                    {ticket && active.includes(ticket.state) ? (
                      <a
                        className="wl-button secondary small"
                        href="/play/status"
                      >
                        View my spot ↗
                      </a>
                    ) : (
                      <button
                        className="wl-button small"
                        disabled={!canJoin || !!error}
                        onClick={(e) => {
                          opener.current = e.currentTarget;
                          setJoining(game);
                        }}
                      >
                        {" "}
                        {canJoin
                          ? "Join the list ↗"
                          : game.stale
                            ? "Call to confirm"
                            : "Joins paused"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
            <div className="list-footnote">
              <span aria-hidden="true">↻</span> Updated{" "}
              {updated ? time(updated.toISOString()) : "—"} · Live status is
              confirmed by club staff.
            </div>
          </section>
          <aside className="player-aside">
            <div className="aside-card">
              <span className="aside-suit" aria-hidden="true">
                ♠
              </span>
              <p className="wl-eyebrow">YOUR SPOT AT JOKERS</p>
              <h2>
                Less waiting
                <br />
                around.
                <br />
                More poker.
              </h2>
              <p>
                One game. One place in line. Join from your phone and arrive
                ready to play.
              </p>
              <div className="aside-rule" />
              <p className="small-label">BEFORE YOU JOIN</p>
              <p>
                Membership and seat rental apply separately. Joining a list
                doesn’t guarantee a seat or a waiting time.
              </p>
            </div>
            <p className="fine-print">
              2553 Texas Avenue South, Suite D<br />
              College Station, TX 77840
            </p>
          </aside>
        </div>
      )}
      <dialog
        className="join-dialog"
        aria-labelledby="join-heading"
        ref={dialog}
        onCancel={(e) => {
          if (busy) e.preventDefault();
          else close();
        }}
      >
        <button
          className="dialog-close"
          disabled={busy}
          onClick={close}
          aria-label="Close join form"
        >
          ×
        </button>
        <p className="wl-eyebrow">LET’S GET YOU ON THE LIST</p>
        <h2 id="join-heading">{joining?.name}</h2>
        <p className="dialog-stakes">{joining?.stakes}</p>
        <form onSubmit={join}>
          <label htmlFor="player-name">What should the floor call you?</label>
          <input
            ref={name}
            id="player-name"
            name="name"
            autoComplete="given-name"
            minLength={2}
            maxLength={40}
            required
            placeholder="Your name or nickname"
          />
          <div className="arrival-note">
            <strong>
              Check in within {data?.policy.arrival_minutes} minutes.
            </strong>
            <p>
              Your spot is confirmed when you join. Staff will confirm your
              arrival and offer a seat when one is available.
            </p>
          </div>
          <label className="check-label">
            <input name="accepted" type="checkbox" required />
            I’ll check in with staff and keep my status page open. Alerts appear
            on the website.
          </label>
          {failure && (
            <p role="alert" className="form-error">
              {failure}
            </p>
          )}
          <button className="wl-button full" disabled={busy}>
            {busy ? "Getting your spot…" : "Join the wait-list ↗"}
          </button>
          <p className="fine-print">
            No account needed. Your private spot is remembered on this device.
          </p>
        </form>
      </dialog>
    </>
  );
}
function TicketCard({
  ticket: t,
  busy,
  action,
}: {
  ticket: Ticket;
  busy: boolean;
  action: (a: "cancel" | "acknowledge") => void;
}) {
  const isActive = active.includes(t.state),
    offered = ["offered", "acknowledged"].includes(t.state);
  const step =
    t.state === "seated" ? 3 : offered ? 2 : t.state === "arrived" ? 1 : 0;
  const headline =
    t.state === "offered"
      ? "Your seat is ready."
      : t.state === "acknowledged"
        ? "The floor is expecting you."
        : t.state === "seated"
          ? "You’re in. Enjoy the game."
          : t.state === "expired"
            ? "Your spot has expired."
            : t.state === "cancelled"
              ? "You’ve left the list."
              : t.state === "no_show"
                ? "This spot was released."
                : t.state === "arrived"
                  ? "You’re checked in."
                  : "You’re on the list.";
  return (
    <section
      className={`queue-ticket ${offered ? "ticket-ready" : ""}`}
      aria-labelledby="ticket-heading"
    >
      <div className="ticket-top">
        <span>JOKERS / ADMIT ONE</span>
        <span aria-hidden="true">♠</span>
      </div>
      <div className="ticket-body">
        <p className="wl-eyebrow" id="ticket-heading">
          {headline}
        </p>
        <div className="ticket-number" aria-live="polite">
          {isActive && !offered ? (
            <>
              <span className="hash">#</span>
              {t.position}
            </>
          ) : (
            <span className="ticket-symbol">
              {t.state === "seated" ? "✓" : offered ? "↗" : "♠"}
            </span>
          )}
        </div>
        <p className="ticket-place">
          {isActive && !offered
            ? `${Math.max(0, t.position - 1)} ${t.position === 2 ? "player" : "players"} ahead of you`
            : offered
              ? t.seat_label
              : "See you around the table."}
        </p>
        <div className="ticket-game">
          <h2>{t.game_name}</h2>
          <strong>{t.stakes}</strong>
          <p>
            For {t.display_name} · Joined {time(t.joined_at)}
          </p>
        </div>
        {isActive && (
          <>
            <ol className="ticket-progress" aria-label="Your progress">
              {["On the list", "Checked in", "Seat offered", "Seated"].map(
                (label, i) => (
                  <li
                    key={label}
                    className={i <= step ? "complete" : ""}
                    aria-current={i === step ? "step" : undefined}
                  >
                    <span>{i < step ? "✓" : i + 1}</span>
                    {label}
                  </li>
                ),
              )}
            </ol>
            <div className="ticket-callout">
              {offered ? (
                <>
                  <strong>Please see the floor by {time(t.expires_at)}.</strong>
                  <p>
                    {t.state === "acknowledged"
                      ? "You’ve acknowledged the offer. Staff will confirm your seat in person."
                      : "Acknowledge your offer and head to the floor before your seat hold expires."}
                  </p>
                </>
              ) : t.state === "arrived" ? (
                <>
                  <strong>You’re checked in with the floor.</strong>
                  <p>
                    Keep this page open. We’ll display your seat offer here.
                  </p>
                </>
              ) : (
                <>
                  <strong>Check in by {time(t.arrival_deadline)}.</strong>
                  <p>
                    Tell the floor your name and show this ticket when you
                    arrive.
                  </p>
                </>
              )}
            </div>
          </>
        )}
        {t.state === "offered" && (
          <button
            className="wl-button full"
            disabled={busy}
            onClick={() => action("acknowledge")}
          >
            {busy ? "Updating…" : "I’m here · acknowledge offer ↗"}
          </button>
        )}
        {!isActive && (
          <a className="wl-button full" href="/play">
            Find another game ↗
          </a>
        )}
      </div>
      <div className="ticket-tear" />
      <div className="ticket-bottom">
        <div>
          <span>YOUR REFERENCE</span>
          <strong>{t.reference}</strong>
        </div>
        {isActive && (
          <button
            className="leave-button"
            disabled={busy}
            onClick={() => action("cancel")}
          >
            Leave wait-list
          </button>
        )}
      </div>
      <div className="ticket-bars" aria-hidden="true" />
    </section>
  );
}
