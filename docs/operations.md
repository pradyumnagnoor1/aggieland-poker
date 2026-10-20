# Operations and handover

Record primary/backup owners for GitHub, Vercel, Supabase, and domain registrar. Use an owner-controlled password manager and revocable developer collaboration. Separate production/staging secrets. Never reuse the local demo login in production.

## Monitoring

- `/api/health` returns 200 only with database connectivity; a static homepage is not a queue health check.
- Monitor Vercel `waitlist_request_failed` counts without logging credentials or query parameters.
- Verify actual successful execution of the named Supabase cron jobs. An installed extension alone is insufficient.
- Monitor Supabase size, egress, connections, and latency. Active pages poll every 10 seconds and resynchronize on return; responses are private and uncached.
- Configure RATE_LIMIT_SECRET and monitor rejection spikes. IP-derived identifiers are HMAC hashes, not raw stored IP addresses.

## Backups and retention

Agree recovery-point/restore-time expectations with the owner. Use encrypted off-site exports on Supabase Free, or verify paid backup capabilities. Restore to a separate database and rehearse; an untested backup is insufficient.

Application-table exports do not replace managed Auth identity recovery. Staff records refer to Auth UUIDs, so preserve/recover matching provider identities. Website images are in Git; database backups do not include storage objects if uploads are added later.

Daily cleanup anonymizes names/session links on terminal entries after 90 days, deletes audit events after 180 days, and retains idempotency receipts for seven days. Agree defaults with the owner. Review cron execution-log growth and add a provider-appropriate retention job as needed.

## Incident workflow

1. Pause remote joins and use the manual floor queue.
2. Check hosting, database, secrets, and cron status without printing credentials.
3. Restore connectivity or roll back the app deployment. Keep migrations backward compatible; do not delete live tables to roll back.
4. Sweep expiration and reconcile seat occupancy, holds, and arrivals with staff.
5. Reopen joins after the floor confirms consistency; record the incident.

Back up before schema changes. The migration runner applies only new filenames, each transactionally. Avoid maintenance during playing hours when possible.

## Pilot and sale

Rehearse one game with a club representative: open shift, confirm game, join on another device, check in, offer/acknowledge, seat, free seat, close. Test simultaneous staff actions, lost session, expiration, and network loss.

Complete billing/domain authorization, staff training, backup/restore, and account handover before declaring the club live. Local checks do not establish that hosted Auth, jobs, or the club's actual procedures are configured. The former Sites identity is archived only; no runtime depends on Sites or a ChatGPT account.
