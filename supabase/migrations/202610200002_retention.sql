-- Native UUID generation keeps this independent of pgcrypto's installation schema.
alter table waitlist_entries alter column reference set default upper(substr(replace(gen_random_uuid()::text,'-',''),1,10));

create or replace function public.cleanup_waitlist_history() returns void
language plpgsql security definer set search_path=public,pg_temp as $$
begin
  perform pg_advisory_xact_lock(20261020);
  -- Retain counts/outcomes; remove names and session linkage after 90 days.
  update waitlist_entries set display_name='Former player',guest_id=null
    where ended_at<now()-interval '90 days' and state not in ('waiting','arrived','offered','acknowledged')
    and (display_name<>'Former player' or guest_id is not null);
  delete from audit_events where created_at<now()-interval '180 days';
  delete from command_receipts where created_at<now()-interval '7 days';
  delete from guest_sessions g where expires_at<now() and not exists(select 1 from waitlist_entries e where e.guest_id=g.id);
end $$;
revoke all on function public.cleanup_waitlist_history() from public;
do $$ begin
  if exists(select 1 from pg_extension where extname='pg_cron') then
    if not exists(select 1 from cron.job where jobname='jokers-cleanup-history') then
      perform cron.schedule('jokers-cleanup-history','30 10 * * *','select public.cleanup_waitlist_history()');
    end if;
  end if;
end $$;
