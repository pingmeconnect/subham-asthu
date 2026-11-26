-- Subham Astu v13: send WhatsApp automatically through the WhatsApp Business Cloud API (approved templates).
-- Run once in Supabase SQL Editor, after migration_v12_partner_approved_wa.sql.

-- 1) Outbox keeps the raw values (for template variables) and delivery tracking.
alter table outbox add column if not exists params jsonb;
alter table outbox add column if not exists attempts int not null default 0;
alter table outbox add column if not exists last_error text;
alter table outbox add column if not exists sent_at timestamptz;
alter table outbox add column if not exists provider_id text;

-- 2) sa_queue_wa now also stores the raw values. Same behaviour otherwise.
create or replace function sa_queue_wa(p_template text, p_mobile text, p_ref text, p_data jsonb) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_trigger text := case p_template
    when 'order_received' then 'wa_trigger_order_received'
    when 'order_confirmed' then 'wa_trigger_order_final'
    when 'order_unavailable' then 'wa_trigger_order_final'
    when 'booking_confirmed' then 'wa_trigger_booking'
    when 'reminder_1day' then 'wa_trigger_reminder'
    else null end;
begin
  if v_trigger is not null and not sa_setting_bool(v_trigger) and p_ref not like 'test:%' then
    return false;
  end if;
  insert into outbox (channel, template, ref, to_addr, text_ta, text_en, params)
  values ('whatsapp', p_template, p_ref, '+91 ' || p_mobile,
          'சுபம் அஸ்து: ' || sa_tpl(p_template, 0, p_data),
          'சுபம் அஸ்து: ' || sa_tpl(p_template, 1, p_data), p_data)
  on conflict (channel, ref) do nothing;
  return found;
end $$;

-- 3) Admin can see failed sends (the send function writes these).
create index if not exists outbox_wa_pending on outbox (channel, status) where status = 'queued';

-- Optional, after deploying the function (see SETUP-WHATSAPP-API.md): run the sender every minute.
-- Replace YOUR_PROJECT_REF and YOUR_ANON_KEY. Needs the pg_net and pg_cron extensions (Supabase > Database > Extensions).
-- select cron.schedule('send-whatsapp-every-minute', '* * * * *', $$
--   select net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-whatsapp',
--     headers := '{"Content-Type":"application/json","apikey":"YOUR_ANON_KEY"}'::jsonb,
--     body := '{}'::jsonb);
-- $$);

-- Confirm: should return 5 (the columns added).
select count(*) as outbox_new_columns from information_schema.columns
 where table_name = 'outbox' and column_name in ('params','attempts','last_error','sent_at','provider_id');
