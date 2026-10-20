"use client";
import { useState } from "react";
import { request } from "@/lib/client";
export default function Login() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div className="login-layout">
      <div>
        <p className="wl-eyebrow">FOR THE PEOPLE BEHIND THE GAME</p>
        <h1>
          Welcome to
          <br />
          the floor desk.
        </h1>
        <p>
          Manage tonight’s games, welcome your players,
          <br />
          and keep the next hand moving.
        </p>
        <a className="inline-link" href="/play">
          View player page ↗
        </a>
      </div>
      <form
        className="login-panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const f = new FormData(e.currentTarget);
          try {
            await request("/api/auth/login", {
              email: f.get("email"),
              password: f.get("password"),
            });
            window.location.assign("/staff/waitlist");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not sign in.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <span className="aside-suit">♣</span>
        <h2>Staff sign-in</h2>
        <p>Use your individual club account.</p>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="wl-button full" disabled={busy}>
          {busy ? "Signing in…" : "Open the floor desk ↗"}
        </button>
        <p className="fine-print">
          Need access or a password reset? Contact your club owner. Owners can
          recover access through their Supabase administrator.
        </p>
      </form>
    </div>
  );
}
