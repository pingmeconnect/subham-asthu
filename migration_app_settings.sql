-- =====================================================================
-- Sankalpam — migration: live app settings (run ONCE, after schema.sql).
-- Moves every business rule, fee range, threshold, text, WhatsApp template and trigger switch
-- into the app_settings table. The Admin Dashboard edits it; the app reads it on load.
-- =====================================================================

-- ---------- table ----------
create table app_settings (
  key         text primary key,
  value       jsonb not null,
  label       text not null,
  group_name  text not null,
  updated_at  timestamptz not null default now()
);

alter table app_settings enable row level security;
revoke all on app_settings from anon, authenticated;

-- ---------- defaults (current business rules) ----------
insert into app_settings (key, value, label, group_name) values
('subscriptions_enabled',      'true',  'Partner subscriptions enabled (off = free launch promo)', 'subscription'),
('sub_free_events',            '3',     'Free completed events before billing', 'subscription'),
('sub_grace_day',              '5',     'Day of month unpaid partners are auto-hidden (after this day)', 'subscription'),
('sub_priest_fee_min',         '299',   'Priest monthly fee: minimum (INR)', 'subscription'),
('sub_priest_fee_max',         '499',   'Priest monthly fee: maximum (INR)', 'subscription'),
('sub_cook_fee_min',           '499',   'Cook monthly fee: minimum (INR)', 'subscription'),
('sub_cook_fee_max',           '799',   'Cook monthly fee: maximum (INR)', 'subscription'),
('sub_fee_step',               '50',    'Fee choice step (INR)', 'subscription'),
('partner_auto_approve',       'false', 'New priests/cooks visible without admin approval', 'subscription'),
('security_max_attempts',      '5',     'Wrong PIN attempts before lockout', 'security'),
('security_lockout_minutes',   '15',    'Lockout duration (minutes)', 'security'),
('security_reset_max_tries',   '5',     'Wrong reset-code attempts before a new code is needed', 'security'),
('security_reset_minutes',     '15',    'Reset code validity (minutes)', 'security'),
('mask_phone_numbers',         'true',  'Hide phone numbers until accept / confirm (off = show always)', 'security'),
('support_whatsapp',           '""',    'Support WhatsApp number (10 digits, blank = hidden)', 'content'),
('text_disclaimer_customer',   '{"ta":"","en":""}', 'Customer Disclaimer', 'content'),
('text_disclaimer_partner',    '{"ta":"","en":""}', 'Partner & Vendor Guidelines', 'content'),
('text_pdf_watermark',         '{"ta":"","en":""}', 'PDF watermark text (every page)', 'content'),
('text_footer',                '{"ta":"","en":""}', 'Footer text', 'content'),
('wa_trigger_order_received',  'true',  'WhatsApp 1 · Samagri order received', 'whatsapp'),
('wa_trigger_order_final',     'true',  'WhatsApp 2 · Samagri order confirmed / unavailable', 'whatsapp'),
('wa_trigger_booking',         'true',  'WhatsApp 3 · Priest/Cook booking confirmed', 'whatsapp'),
('wa_trigger_reminder',        'true',  'WhatsApp 4 · One-day reminder', 'whatsapp')
on conflict (key) do nothing;

-- ---------- default content (the approved texts that were hardcoded in index.html) ----------
update app_settings set value = jsonb_build_object(
  'ta', 'சங்கல்பம் என்பது வாத்தியார்கள், சமையல்காரர்கள் மற்றும் உள்ளூர் கடைகளை இணைக்கும் சேவைத் தளம் மட்டுமே. சடங்கு முறைகள், மந்திர உச்சரிப்புகள் அல்லது சமையல் சுவை/தரம் அந்தந்தச் சேவை வழங்குநர்களின் அனுபவம் மற்றும் வழக்கத்தைப் பொறுத்தது; அவற்றில் சங்கல்பம் தலையிடாது. தட்சணை, சமையல் கட்டணம் மற்றும் பேமெண்ட் விவரங்களை வாடிக்கையாளரும் சேவை வழங்குநரும் நேரடியாகப் பேசிக் கொள்ள வேண்டும். எதிர்பாராத சூழலில் சேவை வழங்குநர் வர இயலாமல் போனால் நேரடிப் பொறுப்பேற்க இயலாது என்றாலும், மாற்று ஏற்பாட்டுக்கு எங்களால் முடிந்த எல்லா உதவியையும் செய்வோம்.',
  'en', 'Sankalpam is only a platform that connects priests, cooks and local stores. Ritual procedures, mantra chanting, and the taste and quality of cooking depend on each service provider''s experience and customs, and Sankalpam does not interfere with them. Dakshina, cooking charges and payment details must be discussed and settled directly between the customer and the service provider. If a service provider is unable to attend due to an unexpected situation, we cannot take direct responsibility, but we will do everything possible to help arrange an alternative.')
where key = 'text_disclaimer_customer';

update app_settings set value = jsonb_build_object(
  'ta', 'சங்கல்பம் மூலம் வரும் வாய்ப்புகள் ஒரு இணைப்பு வசதி மட்டுமே. ஒப்புக்கொண்ட தேதியில் சரியான நேரத்தில் சேவை வழங்குவது வாடிக்கையாளர் நம்பிக்கைக்கு அவசியம். சாமான் ஆர்டர் உறுதி செய்யப்பட்ட பிறகு, டெலிவரி நேரம் மற்றும் விவரங்களை வாடிக்கையாளருடன் நேரடியாகப் பேசிக் கொள்ள வேண்டியது கடைக்காரரின் பொறுப்பு; அதில் சங்கல்பம் தலையிடாது.',
  'en', 'Opportunities that come through Sankalpam are only a connection facility. Serving on time, on the agreed date, is essential for customer trust. Once a samagri order is confirmed, it is the store''s responsibility to discuss delivery timing and details directly with the customer, and Sankalpam does not interfere.')
where key = 'text_disclaimer_partner';

update app_settings set value = jsonb_build_object(
  'ta', 'தனிப்பட்ட பயன்பாட்டிற்கு மட்டுமே — மறுவிற்பனைக்கு (Resale) அல்ல',
  'en', 'For personal use only — not for resale')
where key = 'text_pdf_watermark';

update app_settings set value = jsonb_build_object(
  'ta', 'சங்கல்பம் என்பது பரணி இன்னோவேஷன்ஸ் நிறுவனத்தின் தயாரிப்பு — சென்னை – 600 126',
  'en', 'Sankalpam is a product of Bharani Innovations, Chennai – 600 126')
where key = 'text_footer';

-- ---------- WhatsApp templates move from wa_templates into app_settings ----------
insert into app_settings (key, value, label, group_name)
select 'wa_tpl_' || template, jsonb_build_object('ta', ta, 'en', en),
       case template
         when 'order_received' then 'WhatsApp 1 · Order received (Tamil & English)'
         when 'order_confirmed' then 'WhatsApp 2a · Order confirmed / dispatched (Tamil & English)'
         when 'order_unavailable' then 'WhatsApp 2b · Order unavailable (Tamil & English)'
         when 'booking_confirmed' then 'WhatsApp 3 · Booking confirmed (Tamil & English)'
         when 'reminder_1day' then 'WhatsApp 4 · One-day reminder (Tamil & English)'
       end, 'whatsapp'
from wa_templates
on conflict (key) do nothing;

insert into app_settings (key, value, label, group_name) values
('wa_sample', jsonb_build_object(
   'pooja', jsonb_build_array('சுமங்கலி பிரார்த்தனை', 'Sumangali Prarthanai'),
   'shop', jsonb_build_array('மாதிரி பூஜைக் கடை', 'Sample Pooja Store'),
   'shop_phone', '9000000050',
   'partner', jsonb_build_array('வேதம் ராமசாமி அய்யர்', 'Vedam Ramasamy Iyer'),
   'phone', '9000000001',
   'date', '2026-12-05'),
 'Sample values used for WhatsApp previews and test messages', 'whatsapp')
on conflict (key) do nothing;

drop table wa_templates;

-- ---------- new flags: pooja visibility, partner approval and hiding ----------
alter table poojas add column is_visible boolean not null default true;
alter table partner_profiles add column is_approved boolean not null default false;
alter table partner_profiles add column is_hidden boolean not null default false;
update partner_profiles set is_approved = true where is_sample;

-- ---------- helpers ----------
create or replace function sa_setting(p_key text) returns jsonb
language sql stable security definer set search_path = public as $$
  select value from app_settings where key = p_key;
$$;

create or replace function sa_setting_int(p_key text) returns int
language sql stable security definer set search_path = public as $$
  select (value #>> '{}')::int from app_settings where key = p_key;
$$;

create or replace function sa_setting_bool(p_key text) returns boolean
language sql stable security definer set search_path = public as $$
  select (value #>> '{}')::boolean from app_settings where key = p_key;
$$;

-- ---------- public read: every setting, with label and group (no secrets are stored here) ----------
create or replace function sa_get_settings() returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('key', key, 'value', value, 'label', label, 'group', group_name)
                           order by group_name, key), '[]'::json)
  from app_settings;
$$;

-- ---------- admin: update settings (only the admin role; only existing keys; values validated) ----------
create or replace function sa_admin_update_settings(p_token text, p_values jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u users := sa_admin(p_token);
  r record;
  v_int int;
begin
  if v_u.id is null then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  for r in select key, value from jsonb_each(p_values) loop
    if not exists (select 1 from app_settings where key = r.key) then
      return json_build_object('ok', false, 'error', 'unknown_setting', 'key', r.key);
    end if;
    if r.key like 'wa_trigger_%' or r.key like 'mask_%' or r.key = 'subscriptions_enabled'
       or r.key = 'partner_auto_approve' then
      if jsonb_typeof(r.value) <> 'boolean' then
        return json_build_object('ok', false, 'error', 'bad_value', 'key', r.key);
      end if;
    elsif r.key like 'text_%' or r.key = 'wa_sample' or r.key like 'wa_tpl_%' then
      if jsonb_typeof(r.value) not in ('object', 'array') then
        return json_build_object('ok', false, 'error', 'bad_value', 'key', r.key);
      end if;
    elsif r.key = 'support_whatsapp' then
      if jsonb_typeof(r.value) <> 'string' or (r.value #>> '{}') !~ '^([0-9]{10})?$' then
        return json_build_object('ok', false, 'error', 'bad_value', 'key', r.key);
      end if;
    else
      if jsonb_typeof(r.value) <> 'number' then
        return json_build_object('ok', false, 'error', 'bad_value', 'key', r.key);
      end if;
      v_int := (r.value #>> '{}')::int;
      if (r.key = 'sub_free_events' and v_int not between 1 and 10)
         or (r.key = 'sub_grace_day' and v_int not between 1 and 28)
         or (r.key = 'sub_fee_step' and v_int < 1)
         or (r.key in ('security_max_attempts', 'security_reset_max_tries') and v_int not between 1 and 20)
         or (r.key in ('security_lockout_minutes', 'security_reset_minutes') and v_int not between 1 and 1440)
         or (r.key like 'sub_%_fee_min' and v_int < 0)
         or (r.key like 'sub_%_fee_max' and v_int < 0) then
        return json_build_object('ok', false, 'error', 'bad_value', 'key', r.key);
      end if;
    end if;
  end loop;
  -- All values passed validation; apply them together.
  update app_settings s set value = v.value, updated_at = now()
    from jsonb_each(p_values) v(key, value) where s.key = v.key;
  return json_build_object('ok', true);
end $$;

-- ---------- subscription state: now reads the live rules (free events, grace day, enable switch) ----------
create or replace function sa_partner_state(p_partner uuid) returns json
language plpgsql stable security definer set search_path = public as $$
declare
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
  v_cur text := to_char(v_today, 'YYYY-MM');
  v_free_events int := sa_setting_int('sub_free_events');
  v_grace int := sa_setting_int('sub_grace_day');
  v_done date[];
  v_paid text[];
  v_third date;
  v_free_until date;
  v_bs text;
  v_ym date;
  v_overdue boolean := false;
  v_st text;
begin
  select coalesce(array_agg(event_date order by event_date), '{}') into v_done
    from service_bookings where provider_id = p_partner and status = 'completed';
  select s.paid_months into v_paid from subscriptions s where s.partner_id = p_partner;
  v_paid := coalesce(v_paid, '{}');

  -- Global promo switch: while subscriptions are disabled, every partner is free and visible.
  if not sa_setting_bool('subscriptions_enabled') then
    return json_build_object('status', 'free', 'visible', true, 'completed', coalesce(array_length(v_done, 1), 0),
                             'freeUntil', null, 'billingStart', null);
  end if;

  if coalesce(array_length(v_done, 1), 0) < v_free_events then
    return json_build_object('status', 'free', 'visible', true, 'completed', coalesce(array_length(v_done, 1), 0),
                             'freeUntil', null, 'billingStart', null);
  end if;

  v_third := v_done[v_free_events];
  v_free_until := (date_trunc('month', v_third) + interval '1 month' - interval '1 day')::date;
  if v_today <= v_free_until then
    return json_build_object('status', 'free', 'visible', true, 'completed', array_length(v_done, 1),
                             'freeUntil', to_char(v_free_until, 'YYYY-MM-DD'), 'billingStart', null);
  end if;

  v_bs := to_char(date_trunc('month', v_third) + interval '1 month', 'YYYY-MM');
  v_ym := to_date(v_bs, 'YYYY-MM');
  while to_char(v_ym, 'YYYY-MM') <= v_cur loop
    if not (to_char(v_ym, 'YYYY-MM') = any(v_paid))
       and (to_char(v_ym, 'YYYY-MM') < v_cur or extract(day from v_today) > v_grace) then
      v_overdue := true;
    end if;
    v_ym := (v_ym + interval '1 month')::date;
  end loop;

  if v_overdue then v_st := 'hidden';
  elsif v_cur = any(v_paid) then v_st := 'paid';
  else v_st := 'due';
  end if;

  return json_build_object('status', v_st, 'visible', v_st <> 'hidden', 'completed', array_length(v_done, 1),
                           'freeUntil', to_char(v_free_until, 'YYYY-MM-DD'), 'billingStart', v_bs);
end $$;

-- ---------- WhatsApp: texts from app_settings; each trigger has its own on/off switch ----------
create or replace function sa_tpl(p_template text, p_i int, p_data jsonb) returns text
language plpgsql stable security definer set search_path = public as $$
declare
  v_t text;
  v_k text;
  v_v jsonb;
begin
  select case when p_i = 0 then s.value ->> 'ta' else s.value ->> 'en' end into v_t
    from app_settings s where s.key = 'wa_tpl_' || p_template;
  foreach v_k in array array['pooja', 'shop', 'shop_phone', 'partner', 'phone', 'date'] loop
    v_v := p_data -> v_k;
    v_t := replace(v_t, '{' || v_k || '}',
      case when jsonb_typeof(v_v) = 'array' then coalesce(v_v ->> p_i, '')
           else coalesce(p_data ->> v_k, '') end);
  end loop;
  return v_t;
end $$;

-- Returns false (nothing queued) when the trigger is switched off or the message already exists.
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
  insert into outbox (channel, template, ref, to_addr, text_ta, text_en)
  values ('whatsapp', p_template, p_ref, '+91 ' || p_mobile,
          'Sankalpam: ' || sa_tpl(p_template, 0, p_data),
          'Sankalpam: ' || sa_tpl(p_template, 1, p_data))
  on conflict (channel, ref) do nothing;
  return found;
end $$;

-- ---------- auth: lockout and reset limits come from settings ----------
create or replace function sa_login(p_mobile text, p_pin text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_m text := sa_norm_mobile(p_mobile);
  v_u users;
  v_fails int;
begin
  if v_m is null then return json_build_object('ok', false, 'error', 'invalid_mobile'); end if;
  if not sa_pin_ok(p_pin) then return json_build_object('ok', false, 'error', 'invalid_pin'); end if;
  select * into v_u from users where mobile = v_m;
  if v_u.id is null then return json_build_object('ok', false, 'error', 'invalid_credentials'); end if;
  if v_u.locked_until is not null and v_u.locked_until > now() then
    return json_build_object('ok', false, 'error', 'locked');
  end if;
  if crypt(p_pin, v_u.pin_hash) <> v_u.pin_hash then
    v_fails := v_u.failed_attempts + 1;
    if v_fails >= sa_setting_int('security_max_attempts') then
      update users set failed_attempts = 0,
        locked_until = now() + make_interval(mins => sa_setting_int('security_lockout_minutes'))
       where id = v_u.id;
      return json_build_object('ok', false, 'error', 'locked');
    end if;
    update users set failed_attempts = v_fails where id = v_u.id;
    return json_build_object('ok', false, 'error', 'invalid_credentials');
  end if;
  update users set failed_attempts = 0, locked_until = null where id = v_u.id;
  return json_build_object('ok', true, 'token', sa_open_session(v_u.id), 'user', sa_user_json(v_u));
end $$;

create or replace function sa_request_pin_reset(p_mobile text, p_email text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_m text := sa_norm_mobile(p_mobile);
  v_e text := lower(trim(coalesce(p_email, '')));
  v_u users;
  v_b bytea;
  v_code text;
begin
  if v_m is null then return json_build_object('ok', false, 'error', 'invalid_mobile'); end if;
  if v_e !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then return json_build_object('ok', false, 'error', 'invalid_email'); end if;
  -- Always answers the same way, so the form cannot reveal which mobile/email pairs exist.
  select * into v_u from users where mobile = v_m and email = v_e;
  if v_u.id is not null then
    v_b := gen_random_bytes(4);
    v_code := lpad(((get_byte(v_b, 0)::bigint * 16777216 + get_byte(v_b, 1)::bigint * 65536
                   + get_byte(v_b, 2)::bigint * 256 + get_byte(v_b, 3)) % 1000000)::text, 6, '0');
    update users set reset_hash = crypt(v_code, gen_salt('bf', 10)),
                     reset_expires_at = now() + make_interval(mins => sa_setting_int('security_reset_minutes')),
                     reset_tries = 0
     where id = v_u.id;
    insert into outbox (channel, template, ref, to_addr, text_ta, text_en)
    values ('email', 'pin_reset', 'reset:' || encode(gen_random_bytes(8), 'hex'), v_u.email,
      'சங்கல்பம் PIN மீட்புக் குறியீடு: ' || v_code || ' (' || sa_setting_int('security_reset_minutes') || ' நிமிடங்கள்)',
      'Sankalpam PIN reset code: ' || v_code || ' (valid ' || sa_setting_int('security_reset_minutes') || ' minutes)');
  end if;
  return json_build_object('ok', true, 'sent', true);
end $$;

create or replace function sa_confirm_pin_reset(p_mobile text, p_code text, p_pin text, p_pin2 text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_m text := sa_norm_mobile(p_mobile);
  v_u users;
begin
  if v_m is null then return json_build_object('ok', false, 'error', 'invalid_mobile'); end if;
  if not sa_pin_ok(p_pin) then return json_build_object('ok', false, 'error', 'invalid_pin'); end if;
  if p_pin <> p_pin2 then return json_build_object('ok', false, 'error', 'pin_mismatch'); end if;
  select * into v_u from users where mobile = v_m;
  if v_u.id is null or v_u.reset_hash is null then
    return json_build_object('ok', false, 'error', 'reset_invalid_code');
  end if;
  if v_u.reset_expires_at < now() then return json_build_object('ok', false, 'error', 'reset_expired'); end if;
  if v_u.reset_tries >= sa_setting_int('security_reset_max_tries') then
    return json_build_object('ok', false, 'error', 'reset_too_many');
  end if;
  if crypt(trim(coalesce(p_code, '')), v_u.reset_hash) <> v_u.reset_hash then
    update users set reset_tries = reset_tries + 1 where id = v_u.id;
    return json_build_object('ok', false, 'error', 'reset_invalid_code');
  end if;
  update users set pin_hash = crypt(p_pin, gen_salt('bf', 10)), failed_attempts = 0, locked_until = null,
                   reset_hash = null, reset_expires_at = null, reset_tries = 0
   where id = v_u.id;
  return json_build_object('ok', true);
end $$;

-- ---------- partner fees: range from settings ----------
create or replace function sa_fee_range(p_role text) returns int[]
language sql stable security definer set search_path = public as $$
  select case when p_role = 'priest'
    then array[sa_setting_int('sub_priest_fee_min'), sa_setting_int('sub_priest_fee_max')]
    else array[sa_setting_int('sub_cook_fee_min'), sa_setting_int('sub_cook_fee_max')] end;
$$;

create or replace function sa_set_fee(p_token text, p_fee int) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u users;
  v_pp partner_profiles;
  v_range int[];
begin
  v_u := sa_user(p_token);
  if v_u.id is null then return json_build_object('ok', false, 'error', 'login_first'); end if;
  select * into v_pp from partner_profiles where user_id = v_u.id;
  if v_pp.id is null then return json_build_object('ok', false, 'error', 'no_profile'); end if;
  v_range := sa_fee_range(v_pp.role);
  if p_fee is null or p_fee not between v_range[1] and v_range[2] then
    return json_build_object('ok', false, 'error', 'fee_bad');
  end if;
  insert into subscriptions (partner_id, monthly_fee_inr) values (v_pp.id, p_fee)
  on conflict (partner_id) do update set monthly_fee_inr = excluded.monthly_fee_inr;
  return json_build_object('ok', true);
end $$;

create or replace function sa_mark_paid(p_partner uuid, p_role text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_st json := sa_partner_state(p_partner);
  v_bs text := v_st ->> 'billingStart';
  v_cur text := to_char((now() at time zone 'Asia/Kolkata')::date, 'YYYY-MM');
  v_paid text[];
  v_ym date;
begin
  if v_bs is null then return json_build_object('ok', true); end if;
  insert into subscriptions (partner_id, monthly_fee_inr)
  values (p_partner, sa_fee_range(p_role)[1])
  on conflict (partner_id) do nothing;
  select coalesce(paid_months, '{}') into v_paid from subscriptions where partner_id = p_partner;
  v_ym := to_date(v_bs, 'YYYY-MM');
  while to_char(v_ym, 'YYYY-MM') <= v_cur loop
    if not (to_char(v_ym, 'YYYY-MM') = any(v_paid)) then
      v_paid := array_append(v_paid, to_char(v_ym, 'YYYY-MM'));
    end if;
    v_ym := (v_ym + interval '1 month')::date;
  end loop;
  update subscriptions set paid_months = (select array_agg(m order by m) from unnest(v_paid) m)
   where partner_id = p_partner;
  return json_build_object('ok', true);
end $$;

-- New partners start unapproved unless the admin turned on auto-approval.
create or replace function sa_save_profile(p_token text, p_pin text, p_spec text, p_years int, p_langs text[])
returns json language plpgsql security definer set search_path = public as $$
declare
  v_u users;
  v_pp partner_profiles;
  v_specs text[];
begin
  v_u := sa_user(p_token);
  if v_u.id is null then return json_build_object('ok', false, 'error', 'login_first'); end if;
  if v_u.role not in ('priest', 'cook') then return json_build_object('ok', false, 'error', 'partner_only'); end if;
  if coalesce(p_pin, '') !~ '^[0-9]{6}$' then return json_build_object('ok', false, 'error', 'pin_bad'); end if;
  if p_langs is null or cardinality(p_langs) = 0 then return json_build_object('ok', false, 'error', 'lang_bad'); end if;
  v_specs := case when v_u.role = 'priest' then array['Vadagalai', 'Thenkalai', 'Smartha', 'Madhva']
                  else array['iyer_veg', 'iyengar_veg', 'festival_sweets'] end;
  if p_spec is null or not (p_spec = any(v_specs)) then return json_build_object('ok', false, 'error', 'fail'); end if;

  select * into v_pp from partner_profiles where user_id = v_u.id;
  if v_pp.id is null then
    insert into partner_profiles (user_id, role, name_en, phone, pin_code, sampradayam, cook_specialty,
                                  languages, experience_years, is_approved)
    values (v_u.id, v_u.role, v_u.name, v_u.mobile, p_pin,
            case when v_u.role = 'priest' then p_spec end,
            case when v_u.role = 'cook' then p_spec end,
            p_langs, coalesce(p_years, 0), sa_setting_bool('partner_auto_approve'));
  else
    update partner_profiles set pin_code = p_pin, languages = p_langs, experience_years = coalesce(p_years, 0),
      sampradayam = case when v_pp.role = 'priest' then p_spec else null end,
      cook_specialty = case when v_pp.role = 'cook' then p_spec else null end
    where id = v_pp.id;
  end if;
  return json_build_object('ok', true);
end $$;

-- ---------- directory: approved, not hidden, not placeholder; phone only when masking is off ----------
create or replace function sa_list_partners(p_role text, p_lang text, p_pin text) returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(x order by x.experience_years desc), '[]'::json) from (
    select pp.id, pp.role, pp.name_ta, pp.name_en, pp.sampradayam, pp.cook_specialty,
           pp.languages, pp.experience_years, pp.pin_code,
           case when sa_setting_bool('mask_phone_numbers') then null else pp.phone end as phone
    from partner_profiles pp
    where not pp.is_sample and pp.is_approved and not pp.is_hidden
      and (p_role is null or p_role = '' or pp.role = p_role)
      and (p_lang is null or p_lang = '' or pp.languages @> array[p_lang] or pp.sampradayam = p_lang)
      and (p_pin is null or p_pin = '' or left(pp.pin_code, length(p_pin)) = p_pin)
      and sa_partner_state(pp.id) ->> 'visible' = 'true'
  ) x;
$$;

create or replace function sa_partner_public(p_id uuid) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object('id', pp.id, 'role', pp.role, 'name_ta', pp.name_ta, 'name_en', pp.name_en,
         'sampradayam', pp.sampradayam, 'cook_specialty', pp.cook_specialty, 'languages', pp.languages,
         'experience_years', pp.experience_years, 'pin_code', pp.pin_code)
  from partner_profiles pp
  where pp.id = p_id and not pp.is_sample and pp.is_approved and not pp.is_hidden
    and sa_partner_state(pp.id) ->> 'visible' = 'true';
$$;

create or replace function sa_create_booking(p_token text, p_partner uuid, p_pooja_slug text,
  p_event_date date, p_pin text, p_cook_addon boolean) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u users;
  v_pp partner_profiles;
  v_pooja uuid;
begin
  v_u := sa_user(p_token);
  if v_u.id is null then return json_build_object('ok', false, 'error', 'login_first'); end if;
  if p_event_date is null or p_event_date < (now() at time zone 'Asia/Kolkata')::date then
    return json_build_object('ok', false, 'error', 'date_bad');
  end if;
  if coalesce(p_pin, '') !~ '^[0-9]{6}$' then return json_build_object('ok', false, 'error', 'pin_bad'); end if;
  select id into v_pooja from poojas where slug = p_pooja_slug and is_visible;
  if v_pooja is null then return json_build_object('ok', false, 'error', 'pooja_bad'); end if;
  select * into v_pp from partner_profiles where id = p_partner;
  if v_pp.id is null or v_pp.is_sample or not v_pp.is_approved or v_pp.is_hidden
     or sa_partner_state(v_pp.id) ->> 'visible' <> 'true' then
    return json_build_object('ok', false, 'error', 'unavailable');
  end if;
  insert into service_bookings (customer_id, customer_name, provider_id, service_type, pooja_id,
                                event_date, pin_code, cook_addon)
  values (v_u.id, v_u.name, v_pp.id, v_pp.role, v_pooja, p_event_date, p_pin, coalesce(p_cook_addon, false));
  return json_build_object('ok', true);
end $$;

-- ---------- customer: my bookings (phone masking from settings) ----------
create or replace function sa_my_bookings(p_token text) returns json
language plpgsql security definer set search_path = public as $$
declare v_u users;
begin
  v_u := sa_user(p_token);
  if v_u.id is null then return json_build_object('ok', false, 'error', 'login_first'); end if;
  return json_build_object('ok', true, 'bookings', (
    select coalesce(json_agg(x order by x.event_date desc), '[]'::json) from (
      select b.id, b.service_type, b.event_date, b.pin_code, b.cook_addon, b.status,
             pl.name_ta as pooja_ta, pl.name_en as pooja_en,
             pp.name_ta, pp.name_en,
             case when b.status in ('accepted', 'completed') or not sa_setting_bool('mask_phone_numbers')
                  then pp.phone end as partner_phone
      from service_bookings b
      join partner_profiles pp on pp.id = b.provider_id
      left join poojas pl on pl.id = b.pooja_id
      where b.customer_id = v_u.id) x));
end $$;

-- ---------- admin dashboard: everything the Admin screens need, masking from settings ----------
create or replace function sa_admin_dashboard(p_token text) returns json
language plpgsql security definer set search_path = public as $$
declare v_u users := sa_admin(p_token);
begin
  if v_u.id is null then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  return json_build_object(
    'ok', true,
    'counts', json_build_object(
      'customers', (select count(*) from users where role = 'customer'),
      'priests', (select count(*) from partner_profiles where role = 'priest'),
      'cooks', (select count(*) from partner_profiles where role = 'cook'),
      'stores', (select count(*) from vendors)),
    'partners', (select coalesce(json_agg(json_build_object('id', pp.id, 'role', pp.role,
        'name_ta', pp.name_ta, 'name_en', pp.name_en, 'status', sa_partner_state(pp.id) ->> 'status',
        'is_sample', pp.is_sample, 'is_approved', pp.is_approved, 'is_hidden', pp.is_hidden,
        'phone', pp.phone) order by pp.created_at), '[]'::json) from partner_profiles pp),
    'vendors', (select coalesce(json_agg(json_build_object('id', v.id, 'name', v.name, 'phone', v.phone,
        'pin_code', v.pin_code, 'is_active', v.is_active) order by v.name), '[]'::json) from vendors v),
    'poojas', (select coalesce(json_agg(json_build_object('id', pl.id, 'slug', pl.slug, 'name_ta', pl.name_ta,
        'name_en', pl.name_en, 'category', pl.category, 'is_visible', pl.is_visible) order by pl.slug), '[]'::json)
        from poojas pl),
    'orders', (select coalesce(json_agg(x order by x.created_at desc), '[]'::json) from (
        select o.id, o.created_at, o.pin_code, o.status,
               pl.name_ta as pooja_ta, pl.name_en as pooja_en,
               u.name as customer_name,
               case when o.status = 'confirmed_dispatched' or not sa_setting_bool('mask_phone_numbers')
                    then u.mobile end as customer_mobile,
               v.name as vendor_name,
               case when o.status = 'confirmed_dispatched' or not sa_setting_bool('mask_phone_numbers')
                    then v.phone end as vendor_phone
        from samagri_orders o
        join users u on u.id = o.customer_id
        join poojas pl on pl.id = o.pooja_id
        left join vendors v on v.id = o.vendor_id) x),
    'bookings', (select coalesce(json_agg(x order by x.event_date desc), '[]'::json) from (
        select b.id, b.event_date, b.pin_code, b.status, b.service_type, b.customer_name,
               pp.name_ta, pp.name_en, pl.name_ta as pooja_ta, pl.name_en as pooja_en
        from service_bookings b
        join partner_profiles pp on pp.id = b.provider_id
        left join poojas pl on pl.id = b.pooja_id) x),
    'wa', (select coalesce(json_agg(x order by x.created_at desc), '[]'::json) from (
        select created_at, template, to_addr, status from outbox
        where channel = 'whatsapp' order by created_at desc limit 15) x));
end $$;

-- ---------- admin: test messages use the live templates and sample values ----------
create or replace function sa_admin_queue_test(p_token text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u users := sa_admin(p_token);
  v_stamp text := extract(epoch from now())::bigint::text;
  v_data jsonb := (select value from app_settings where key = 'wa_sample');
  r record;
begin
  if v_u.id is null then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  for r in select substr(key, length('wa_tpl_') + 1) as template from app_settings where key like 'wa_tpl_%' loop
    perform sa_queue_wa(r.template, v_u.mobile, 'test:' || r.template || ':' || v_stamp, v_data);
  end loop;
  return json_build_object('ok', true);
end $$;

-- ---------- catalog and partner management ----------
-- Public: slugs of poojas the admin has left visible.
create or replace function sa_list_visible_poojas() returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(slug order by slug), '[]'::json) from poojas where is_visible;
$$;

create or replace function sa_admin_set_pooja_visible(p_token text, p_pooja uuid, p_visible boolean) returns json
language plpgsql security definer set search_path = public as $$
declare v_u users := sa_admin(p_token);
begin
  if v_u.id is null then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  update poojas set is_visible = p_visible where id = p_pooja;
  return json_build_object('ok', true);
end $$;

-- Approve (listed in search) and hide (removed from search, kept on record) a priest or cook.
create or replace function sa_admin_set_partner_flags(p_token text, p_partner uuid, p_approved boolean, p_hidden boolean)
returns json language plpgsql security definer set search_path = public as $$
declare v_u users := sa_admin(p_token);
begin
  if v_u.id is null then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  update partner_profiles set is_approved = p_approved, is_hidden = p_hidden where id = p_partner;
  if not found then return json_build_object('ok', false, 'error', 'not_found'); end if;
  return json_build_object('ok', true);
end $$;

-- ---------- samagri order: hidden poojas cannot be ordered ----------
create or replace function sa_place_order(p_token text, p_pooja_slug text, p_pin text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u users;
  v_pool poojas;
begin
  v_u := sa_user(p_token);
  if v_u.id is null then return json_build_object('ok', false, 'error', 'login_first'); end if;
  if coalesce(p_pin, '') !~ '^[0-9]{6}$' then return json_build_object('ok', false, 'error', 'pin_bad'); end if;
  select * into v_pool from poojas where slug = p_pooja_slug and is_visible;
  if v_pool.id is null then return json_build_object('ok', false, 'error', 'not_found'); end if;
  if not exists (select 1 from vendors where pin_code = p_pin and is_active) then
    return json_build_object('ok', false, 'error', 'store_none');
  end if;
  perform sa_place_order_insert(v_u, v_pool, p_pin);
  return json_build_object('ok', true);
end $$;

create or replace function sa_place_order_insert(v_u users, v_pool poojas, p_pin text) returns void
language plpgsql security definer set search_path = public as $$
declare v_oid uuid;
begin
  insert into samagri_orders (customer_id, pooja_id, pin_code, status)
  values (v_u.id, v_pool.id, p_pin, 'waiting_for_confirmation')
  returning id into v_oid;
  perform sa_queue_wa('order_received', v_u.mobile, 'order_received:' || v_oid,
    jsonb_build_object('pooja', jsonb_build_array(v_pool.name_ta, v_pool.name_en)));
end $$;

-- ---------- access: keep helpers internal; expose only the new public functions ----------
revoke execute on function
  sa_setting(text), sa_setting_int(text), sa_setting_bool(text), sa_fee_range(text),
  sa_place_order_insert(users, poojas, text)
from public, anon, authenticated;

grant execute on function
  sa_get_settings(),
  sa_list_visible_poojas(),
  sa_admin_update_settings(text, jsonb),
  sa_admin_set_pooja_visible(text, uuid, boolean),
  sa_admin_set_partner_flags(text, uuid, boolean, boolean)
to anon, authenticated;

-- Re-apply the grants that depend on redefined functions (signatures are unchanged).
grant execute on function
  sa_login(text, text), sa_request_pin_reset(text, text), sa_confirm_pin_reset(text, text, text, text),
  sa_list_partners(text, text, text), sa_partner_public(uuid), sa_create_booking(text, uuid, text, date, text, boolean),
  sa_my_bookings(text), sa_save_profile(text, text, text, int, text[]), sa_set_fee(text, int),
  sa_admin_dashboard(text), sa_admin_queue_test(text)
to anon, authenticated;

-- Confirm the migration ran (should return the number of settings).
select count(*) as settings_created from app_settings;
