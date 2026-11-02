# Jokers of Aggieland

A poker club website and persistent player waitlist for Jokers of Aggieland. Players find staff-confirmed games and follow a private queue ticket; staff manage arrivals, seat offers, and club operations.

Built with Next.js 16, React 19, TypeScript, and PostgreSQL. Vercel hosts the app; Supabase provides managed database and staff authentication.

## Features

- Public club information and game discovery.
- Device-bound guest tickets with queue updates and optional sound while the website is open.
- Staff check-in, available-seat offers, and queue expiration.
- Role-based controls for games, rules, staff accounts, and audit records.
- Database-backed state with concurrency and idempotency safeguards.

[Deployment](docs/deployment.md) · [Staff guide](docs/staff-guide.md) · [Operations](docs/operations.md)

## Routes

- `/`: marketing site and wait-list entry points.
- `/play`: staff-confirmed games accepting players.
- `/play/status`: current device's private queue ticket.
- `/staff/login`: individual staff login.
- `/staff/waitlist`: games, queues, seats, rules, team, account, and audit controls.

## Local development

Use Node 24 and PostgreSQL 15+.

```sh
git clone https://github.com/pradyumnagnoor1/aggieland-poker.git
cd aggieland-poker
npm ci
cp .env.example .env.local
```

Configure the database connection in `.env.local`. Set `DATABASE_SSL=false` only for a trusted local database. Keep credentials out of Git and chat.

```sh
npm run db:migrate
npm run dev
```

Open http://127.0.0.1:3000. Operational state is in PostgreSQL. An unconfigured deployment shows setup-in-progress and accepts no joins.

For a clearly labeled **local synthetic demonstration only**, set `DEMO_MODE=true` and `LOCAL_DEMO_PASSWORD` to a local-only password, run `npm run db:demo`, then sign in as `owner@jokers.local`. This login is blocked in production and on Vercel. Builds never seed demo players or games.

## Supabase and deployment

See [deployment guide](docs/deployment.md). Use the transaction-pooler URL, configure managed Auth server-side, apply migrations, schedule Supabase Cron, and bootstrap an owner. A publishable key alone cannot migrate data or create staff.

`npm run db:bootstrap -- owner@example.com` reads a 12+ character password from stdin; supply it securely from a password manager. No automated invitation is sent. Staff can change passwords in My account.

## Verification

- `npm run check`: generate Next.js route types and check TypeScript.
- `npm run build`: production build.
- `TEST_DATABASE_URL=postgresql://.../jokers_test DATABASE_SSL=false npm test`: real database integration tests. The dedicated test database must end in `_test` and is reset. Never use a live database.
- GitHub Actions runs checks with an isolated PostgreSQL service.

Tests cover concurrent joins/offers, idempotency, guest isolation, roles/revocation, stale writes, expiration, shift closing, rate limits, and mutation-origin checks. Hosted Supabase Auth, jobs, and provider environment configuration need separate live verification.

## Operating the queue

Read the [staff guide](docs/staff-guide.md) and [operations guide](docs/operations.md). Managers approve rules before joins open. Production also requires the active named database expiration job. Staff checks in actual arrivals and offers explicitly available seats.

Guests have one active entry per session. Their secure HttpOnly cookie survives refresh on that device; lost-session recovery is through the floor. Updates and optional enabled sound appear on the open website. Closed/suspended browsers can miss alerts. There is no marketing messaging or automated SMS/email alert integration.

## Hosting and ownership

The app is independent of ChatGPT Sites: Vercel builds from GitHub and Supabase provides database/Auth. Old Sites configuration is archived in `docs/legacy-sites-hosting.json`. The old hosted preview is not automatically deleted. `dist/` preserves the prior static artifact and is excluded from Vercel; active source is `src/` and `public/`.

Club-owned domain, billing, and source/database access are part of handover. Existing club/Wix DNS is unchanged. A real-staff pilot and authorized domain cutover are launch steps.
