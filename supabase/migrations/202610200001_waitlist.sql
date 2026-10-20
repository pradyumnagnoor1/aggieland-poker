create table if not exists club_settings (
  id boolean primary key default true check (id),
  arrival_minutes integer not null default 30 check (arrival_minutes between 5 and 240),
  offer_minutes integer not null default 5 check (offer_minutes between 1 and 30),
  stale_minutes integer not null default 30 check (stale_minutes between 5 and 120),
  policy_confirmed boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into club_settings(id) values(true) on conflict do nothing;

create table if not exists staff_members (
  id uuid primary key, email text not null unique,
  display_name text not null,
  role text not null check(role in ('owner','manager','floor')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists local_staff_sessions (
  token_hash text primary key, staff_id uuid not null references staff_members(id),
  expires_at timestamptz not null
);
create table if not exists operating_sessions (
  id uuid primary key default gen_random_uuid(),
  opened_at timestamptz not null default now(), closed_at timestamptz,
  opened_by uuid not null references staff_members(id)
);
create unique index if not exists one_open_session on operating_sessions((true)) where closed_at is null;

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  name text not null, variant text not null, stakes text not null,
  status text not null default 'finished' check(status in ('forming','running','paused','finished')),
  accepting boolean not null default false,
  note text not null default '',
  session_id uuid references operating_sessions(id),
  confirmed_at timestamptz not null default now(),
  version integer not null default 1,
  created_at timestamptz not null default now()
);
create table if not exists seats (
  id uuid primary key default gen_random_uuid(), game_id uuid not null references games(id),
  label text not null, occupied boolean not null default false, active boolean not null default true,
  unique(game_id,label)
);
create table if not exists guest_sessions (
  id uuid primary key default gen_random_uuid(), token_hash text not null unique,
  expires_at timestamptz not null, created_at timestamptz not null default now()
);
create table if not exists waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
  game_id uuid not null references games(id), guest_id uuid references guest_sessions(id),
  display_name text not null check(char_length(display_name) between 2 and 40),
  source text not null check(source in ('web','walk_in','phone')),
  state text not null default 'waiting' check(state in ('waiting','arrived','offered','acknowledged','seated','cancelled','expired','no_show')),
  sequence bigint generated always as identity,
  priority_at timestamptz not null default clock_timestamp(),
  joined_at timestamptz not null default now(), arrival_deadline timestamptz,
  arrived_at timestamptz, ended_at timestamptz,
  version integer not null default 1
);
create unique index if not exists one_active_entry_per_guest on waitlist_entries(guest_id)
  where guest_id is not null and state in ('waiting','arrived','offered','acknowledged');
create index if not exists queue_order on waitlist_entries(game_id, priority_at, sequence)
  where state in ('waiting','arrived','offered','acknowledged');
create table if not exists seat_offers (
  id uuid primary key default gen_random_uuid(), entry_id uuid not null references waitlist_entries(id),
  seat_id uuid not null references seats(id),
  expires_at timestamptz not null, acknowledged_at timestamptz,
  resolved_at timestamptz, resolution text,
  offered_by uuid not null references staff_members(id), created_at timestamptz not null default now()
);
create unique index if not exists one_active_offer_per_seat on seat_offers(seat_id) where resolved_at is null;
create unique index if not exists one_active_offer_per_entry on seat_offers(entry_id) where resolved_at is null;
create table if not exists audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid, actor_type text not null, action text not null,
  entity_id uuid, details jsonb not null default '{}', created_at timestamptz not null default now()
);
create table if not exists command_receipts (
  actor text not null, request_id uuid not null, fingerprint text not null,
  result jsonb not null, created_at timestamptz not null default now(),
  primary key(actor,request_id)
);
create table if not exists request_buckets (
  bucket text primary key, hits integer not null default 1, expires_at timestamptz not null
);

-- All access is through the server. No public/client role may read private rows.
do $$ declare t text; r text; begin
  foreach t in array array['club_settings','staff_members','local_staff_sessions','operating_sessions','games','seats','guest_sessions','waitlist_entries','seat_offers','audit_events','command_receipts','request_buckets'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public',t);
    foreach r in array array['anon','authenticated'] loop
      if exists(select 1 from pg_roles where rolname=r) then
        execute format('revoke all on public.%I from %I',t,r);
      end if;
    end loop;
  end loop;
end $$;

create or replace function public.expire_waitlist() returns integer
language plpgsql security definer set search_path=public,pg_temp as $$
declare changed integer:=0; n integer; begin
  perform pg_advisory_xact_lock(20261020);
  with expired as (
    update waitlist_entries e set state='expired',ended_at=now(),version=version+1
    where e.state in ('offered','acknowledged') and exists(
      select 1 from seat_offers o where o.entry_id=e.id and o.resolved_at is null and o.expires_at<=now()
    ) returning id
  ) insert into audit_events(actor_type,action,entity_id) select 'system','offer_expired',id from expired;
  get diagnostics n = row_count; changed:=changed+n;
  update seat_offers set resolved_at=now(),resolution='expired' where resolved_at is null and expires_at<=now();
  with expired as (
    update waitlist_entries set state='expired',ended_at=now(),version=version+1
    where state='waiting' and arrival_deadline<=now() returning id
  ) insert into audit_events(actor_type,action,entity_id) select 'system','arrival_expired',id from expired;
  get diagnostics n = row_count; changed:=changed+n;
  delete from local_staff_sessions where expires_at<now();
  delete from command_receipts where created_at<now()-interval '7 days';
  delete from request_buckets where expires_at<now()-interval '1 hour';
  delete from guest_sessions g where expires_at<now() and not exists(select 1 from waitlist_entries e where e.guest_id=g.id);
  return changed;
end $$;
revoke all on function public.expire_waitlist() from public;

-- Supabase Cron runs independently of application browsers and Vercel plan limits.
-- Enable pg_cron in Dashboard > Integrations before migration, or run schedule.sql later.
do $$ begin
  if exists(select 1 from pg_extension where extname='pg_cron') then
    if not exists(select 1 from cron.job where jobname='jokers-expire-waitlist') then
      perform cron.schedule('jokers-expire-waitlist','* * * * *','select public.expire_waitlist()');
    end if;
  end if;
end $$;
