# Vercel and Supabase deployment

Use separate staging/production databases. Never deploy the local demo credentials or database address.

## Server environment

| Variable | Value |
|---|---|
| DATABASE_URL | Supabase Connect → transaction pooler, port 6543; URL-encode password characters |
| DATABASE_SSL | `true` |
| SUPABASE_URL | Project origin; omit `/rest/v1/` |
| SUPABASE_PUBLISHABLE_KEY | Project publishable key |
| SUPABASE_SERVICE_ROLE_KEY | Secret/service-role key for staff provisioning and sign-out |
| APP_ORIGIN | Exact public origin; omit for changing Vercel previews to use their request origin |
| CRON_SECRET | Random 32+ character secret for optional authenticated expiration endpoint |
| RATE_LIMIT_SECRET | Independent random HMAC secret |
| DEMO_MODE | `false` |
| LOCAL_DEMO_PASSWORD | Omit in production |

The user's project origin is recorded in git-ignored `.env.supabase.local`. Fill its empty DATABASE_URL and SUPABASE_SERVICE_ROLE_KEY locally. Do not commit it. Apply remote migrations without replacing local development: `node --env-file=.env.supabase.local --import tsx scripts/migrate.ts`.

Private queue operations use a server-only database connection with prepared statements disabled for transaction pooling, a four-connection maximum per process, and SSL. No public/client database policies expose queue rows. Staff authorization is rechecked for each operation.

## Schema and jobs

1. Enable **pg_cron** in Supabase Integrations before migration when possible.
2. Apply `npm run db:migrate` using the intended database environment.
3. If cron was enabled after migration, run `supabase/schedule.sql` in the SQL editor as the database owner.
4. Verify active `jokers-expire-waitlist` every minute and `jokers-cleanup-history` daily. Inspect cron.job_run_details for actual successful executions.

Every transaction also enforces deadlines immediately. The periodic job expires state without browser activity. Once-daily hosting cron is insufficient for short seat holds. Manual `npm run db:expire` and `/api/jobs/expire` (Bearer CRON_SECRET) are recovery tools, not the required periodic schedule.

## Owner and staff

Run scripts/bootstrap-owner.ts with owner email and a 12+ character password supplied on stdin from a password manager. It refuses initial bootstrapping when an active owner already exists and creates a confirmed managed Auth identity without invitation mail.

Sign in at `/staff/login`. Create individual staff in Team. Staff can change passwords under My account. For account recovery, use the authenticated Supabase administrator and retain a backup owner/recovery contact.

## Hosting

Vercel project `aggieland-poker` connects to `pradyumnagnoor1/aggieland-poker`. Confirm the plan is suitable for the club's commercial use; a personal free plan is not an assumed final arrangement. Configure Preview/Production secrets separately.

vercel.json specifies Next.js, npm ci, and npm run build. .vercelignore excludes .env files, the old static artifact, and old Sites metadata. Git production-branch pushes deploy; pull requests create previews according to project settings. Verify `/api/health`, not only static pages.

A deployment without database configuration intentionally shows setup-in-progress and does not accept joins. A successful build alone does not verify hosted Auth or background jobs.

## Launch gates

- Real Supabase owner/floor login tested; revoked access rejected.
- Club approves arrival/offer/freshness rules in Queue rules.
- Staff configures actual shift, games, and available seats.
- Named cron jobs are active; an expired offer is released without browser activity.
- Two staff devices cannot reserve the same seat; guest status is private.
- Backup/restore rehearsal and staff fallback practice complete.
- DEMO_MODE is false; production starts with no synthetic data.

Custom-domain cutover needs the domain owner's authorization. Preserve DNS and email records, document rollback values, and update APP_ORIGIN/auth settings. Do not overwrite the club's existing Wix site during a sales demo. Transfer repository/hosting/database billing/access as part of handover. Retire the old preview after replacement is verified and requested.
