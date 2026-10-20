-- Run as the database owner after enabling pg_cron in Supabase Integrations.
-- One-minute sweep; every queue transaction also expires stale offers immediately.
create extension if not exists pg_cron;
select cron.schedule('jokers-expire-waitlist','* * * * *','select public.expire_waitlist()');
select cron.schedule('jokers-cleanup-history','30 10 * * *','select public.cleanup_waitlist_history()');
-- Monitor: select jobid,status,start_time,end_time from cron.job_run_details order by start_time desc limit 20;
-- Periodically prune cron history through an owner-approved retention job.
