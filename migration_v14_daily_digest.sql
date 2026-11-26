-- Subham Astu v14: daily email digest for the admin (what needs action today).
-- Run once in Supabase SQL Editor, after migration_v13_whatsapp_api.sql.
-- Uses the existing email outbox (channel 'email') and the existing send-outbox email sender.

-- 1) Builds the digest text from live numbers.
create or replace function sa_build_daily_digest() returns text
language plpgsql stable security definer set search_path = public as $$
declare
  v_pending int; v_requested int; v_orders int; v_cancel int; v_wa_failed int;
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
begin
  select count(*) into v_pending from partner_profiles where not is_approved and not is_sample;
  select count(*) into v_requested from service_bookings where status = 'requested';
  select count(*) into v_orders from samagri_orders where status = 'waiting_for_confirmation';
  select count(*) into v_cancel from service_bookings where status = 'cancelled' and event_date >= v_today;
  select count(*) into v_wa_failed from outbox where channel = 'whatsapp' and status = 'failed';
  return 'Subham Asthu daily summary, ' || to_char(v_today, 'DD Mon YYYY') || E'\n\n' ||
    'Priests & cooks waiting for approval: ' || v_pending || E'\n' ||
    'Booking requests waiting for the provider: ' || v_requested || E'\n' ||
    'Samagri orders waiting for the store: ' || v_orders || E'\n' ||
    'Upcoming cancellations needing a replacement: ' || v_cancel || E'\n' ||
    'WhatsApp messages that failed to send: ' || v_wa_failed || E'\n\n' ||
    'Open the admin panel to act on these.';
end $$;

-- 2) Queues the digest for every admin (email outbox). The email sender delivers it.
create or replace function sa_queue_daily_digest() returns int
language plpgsql security definer set search_path = public as $$
declare
  r record;
  v_n int := 0;
  v_text text := sa_build_daily_digest();
begin
  for r in select email from users where role = 'admin' and email is not null loop
    insert into outbox (channel, template, ref, to_addr, text_ta, text_en)
    values ('email', 'daily_digest', 'digest:' || r.email || ':' || (now() at time zone 'Asia/Kolkata')::date,
            r.email, v_text, v_text)
    on conflict (channel, ref) do nothing;
    if found then v_n := v_n + 1; end if;
  end loop;
  return v_n;
end $$;

grant execute on function sa_build_daily_digest() to service_role;
grant execute on function sa_queue_daily_digest() to service_role;

-- 3) Optional schedule, run once the email sender is deployed (Supabase > Database > Extensions: pg_cron, pg_net).
-- Every day at 08:00 India time (02:30 UTC): queue the digest, then ask the email sender to send it.
-- select cron.schedule('daily-admin-digest', '30 2 * * *', $$
--   select sa_queue_daily_digest();
--   select net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-outbox',
--     headers := '{"Content-Type":"application/json","apikey":"YOUR_ANON_KEY"}'::jsonb,
--     body := '{}'::jsonb);
-- $$);

-- Confirm: returns the digest text as a preview.
select sa_build_daily_digest() as digest_preview;
