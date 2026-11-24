-- =====================================================================
-- Subham Asthu — live Supabase database.
-- Run once in the SQL editor on an empty project (drop old tables first if any exist).
-- The browser holds only the publishable key. Every table is locked (RLS on, no policies,
-- no grants to anon). The app reaches data only through the sa_* functions below, which
-- check the session token (or the admin role) themselves.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- tables ----------
create table users (
  id               uuid primary key default gen_random_uuid(),
  name             text not null check (length(trim(name)) > 0),
  mobile           char(10) not null unique check (mobile ~ '^[6-9][0-9]{9}$'),
  email            text not null unique check (email = lower(email)),
  role             text not null check (role in ('customer', 'priest', 'cook', 'admin')),
  pin_hash         text not null,
  failed_attempts  int not null default 0 check (failed_attempts >= 0),
  locked_until     timestamptz,
  reset_hash       text,
  reset_expires_at timestamptz,
  reset_tries      int not null default 0 check (reset_tries >= 0),
  created_at       timestamptz not null default now()
);

create table sessions (
  token       text primary key default encode(extensions.gen_random_bytes(32), 'hex'),
  user_id     uuid not null references users (id) on delete cascade,
  expires_at  timestamptz not null default now() + interval '30 days',
  created_at  timestamptz not null default now()
);

create table poojas (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name_ta          text not null,
  name_en          text not null,
  category         text not null check (category in (
                     'daily_monthly', 'annual_vratam', 'home_subha_homa', 'samskara_pitru')),
  has_cook_option  boolean not null default false,
  is_self_pooja    boolean not null default false
);

-- Blind tie-up pooja stores (no login; contact shown only when an order is confirmed/dispatched).
create table vendors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       char(10) not null check (phone ~ '^[6-9][0-9]{9}$'),
  pin_code    char(6) not null check (pin_code ~ '^[0-9]{6}$'),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table samagri_orders (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references users (id) on delete restrict,
  vendor_id    uuid references vendors (id) on delete restrict,
  pooja_id     uuid not null references poojas (id) on delete restrict,
  pin_code     char(6) not null check (pin_code ~ '^[0-9]{6}$'),
  status       text not null default 'waiting_for_confirmation' check (status in (
                 'waiting_for_confirmation', 'confirmed_dispatched', 'unavailable')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Priest/cook listings. is_sample rows are placeholders and are never shown to customers.
create table partner_profiles (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid unique references users (id) on delete cascade,
  role              text not null check (role in ('priest', 'cook')),
  name_ta           text,
  name_en           text,
  phone             char(10) not null check (phone ~ '^[6-9][0-9]{9}$'),
  pin_code          char(6) not null check (pin_code ~ '^[0-9]{6}$'),
  sampradayam       text,
  cook_specialty    text,
  languages         text[] not null default '{}',
  experience_years  int not null default 0 check (experience_years >= 0),
  is_sample         boolean not null default false,
  created_at        timestamptz not null default now(),
  check (coalesce(name_ta, name_en) is not null)
);

create table service_bookings (
  id             uuid primary key default gen_random_uuid(),
  customer_id    uuid not null references users (id) on delete restrict,
  customer_name  text not null,
  provider_id    uuid not null references partner_profiles (id) on delete restrict,
  service_type   text not null check (service_type in ('priest', 'cook')),
  pooja_id       uuid references poojas (id) on delete set null,
  event_date     date not null,
  pin_code       char(6) not null check (pin_code ~ '^[0-9]{6}$'),
  cook_addon     boolean not null default false,
  status         text not null default 'requested' check (status in (
                   'requested', 'accepted', 'declined', 'cancelled', 'completed')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Partner Portal only. paid_months holds 'YYYY-MM' values.
create table subscriptions (
  id               uuid primary key default gen_random_uuid(),
  partner_id       uuid not null unique references partner_profiles (id) on delete cascade,
  monthly_fee_inr  int not null check (monthly_fee_inr between 299 and 799),
  paid_months      text[] not null default '{}',
  created_at       timestamptz not null default now()
);

-- WhatsApp message text, in Tamil (ta) and English (en). {placeholders} are filled per message.
create table wa_templates (
  template  text primary key,
  ta        text not null,
  en        text not null
);

-- Message queue. WhatsApp rows are the send log until a WhatsApp Business provider is connected.
-- Email rows hold PIN reset codes until an email sender is connected.
create table outbox (
  id          uuid primary key default gen_random_uuid(),
  channel     text not null check (channel in ('whatsapp', 'email')),
  template    text not null,
  ref         text not null,
  to_addr     text not null,
  text_ta     text not null,
  text_en     text not null,
  status      text not null default 'queued',
  created_at  timestamptz not null default now(),
  unique (channel, ref)
);

-- ---------- row level security: locked for the public key ----------
alter table users enable row level security;
alter table sessions enable row level security;
alter table poojas enable row level security;
alter table vendors enable row level security;
alter table samagri_orders enable row level security;
alter table partner_profiles enable row level security;
alter table service_bookings enable row level security;
alter table subscriptions enable row level security;
alter table wa_templates enable row level security;
alter table outbox enable row level security;

revoke all on all tables in schema public from anon, authenticated;

-- ---------- helpers ----------
create or replace function sa_norm_mobile(p text) returns text
language plpgsql immutable as $$
declare d text := regexp_replace(coalesce(p, ''), '[^0-9]', '', 'g');
begin
  if length(d) = 12 and left(d, 2) = '91' then d := substr(d, 3); end if;
  if length(d) = 11 and left(d, 1) = '0' then d := substr(d, 2); end if;
  if d ~ '^[6-9][0-9]{9}$' then return d; end if;
  return null;
end $$;

create or replace function sa_pin_ok(p text) returns boolean
language sql immutable as $$
  select coalesce(p, '') ~ '^([0-9]{4}|[0-9]{6})$';
$$;

create or replace function sa_user(p_token text) returns users
language sql stable security definer set search_path = public as $$
  select u.* from sessions s join users u on u.id = s.user_id
  where s.token = p_token and s.expires_at > now();
$$;

create or replace function sa_admin(p_token text) returns users
language sql stable security definer set search_path = public as $$
  select u.* from sessions s join users u on u.id = s.user_id
  where s.token = p_token and s.expires_at > now() and u.role = 'admin';
$$;

create or replace function sa_user_json(u users) returns json
language sql stable as $$
  select json_build_object('id', u.id, 'name', u.name, 'role', u.role, 'mobile', u.mobile, 'email', u.email);
$$;

create or replace function sa_open_session(p_user uuid) returns text
language sql security definer set search_path = public as $$
  insert into sessions (user_id) values (p_user) returning token;
$$;

-- ---------- auth: mobile + 4/6-digit PIN, email-only PIN reset ----------
create or replace function sa_register(p_name text, p_mobile text, p_email text, p_role text, p_pin text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare
  v_m text := sa_norm_mobile(p_mobile);
  v_e text := lower(trim(coalesce(p_email, '')));
  v_u users;
begin
  if length(trim(coalesce(p_name, ''))) = 0 then return json_build_object('ok', false, 'error', 'invalid_name'); end if;
  if v_m is null then return json_build_object('ok', false, 'error', 'invalid_mobile'); end if;
  if v_e !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then return json_build_object('ok', false, 'error', 'invalid_email'); end if;
  if p_role not in ('customer', 'priest', 'cook') then return json_build_object('ok', false, 'error', 'invalid_role'); end if;
  if not sa_pin_ok(p_pin) then return json_build_object('ok', false, 'error', 'invalid_pin'); end if;
  if exists (select 1 from users where mobile = v_m) then return json_build_object('ok', false, 'error', 'mobile_taken'); end if;
  begin
    insert into users (name, mobile, email, role, pin_hash)
    values (trim(p_name), v_m, v_e, p_role, crypt(p_pin, gen_salt('bf', 10)))
    returning * into v_u;
  exception when unique_violation then
    return json_build_object('ok', false, 'error', 'email_taken');
  end;
  return json_build_object('ok', true, 'token', sa_open_session(v_u.id), 'user', sa_user_json(v_u));
end $$;

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
    if v_fails >= 5 then
      update users set failed_attempts = 0, locked_until = now() + interval '15 minutes' where id = v_u.id;
      return json_build_object('ok', false, 'error', 'locked');
    end if;
    update users set failed_attempts = v_fails where id = v_u.id;
    return json_build_object('ok', false, 'error', 'invalid_credentials');
  end if;
  update users set failed_attempts = 0, locked_until = null where id = v_u.id;
  return json_build_object('ok', true, 'token', sa_open_session(v_u.id), 'user', sa_user_json(v_u));
end $$;

create or replace function sa_logout(p_token text) returns void
language sql security definer set search_path = public as $$
  delete from sessions where token = p_token;
$$;

create or replace function sa_me(p_token text) returns json
language plpgsql stable security definer set search_path = public as $$
declare v_u users := sa_user(p_token);
begin
  if v_u.id is null then return null; end if;
  return sa_user_json(v_u);
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
                     reset_expires_at = now() + interval '15 minutes', reset_tries = 0
     where id = v_u.id;
    insert into outbox (channel, template, ref, to_addr, text_ta, text_en)
    values ('email', 'pin_reset', 'reset:' || encode(gen_random_bytes(8), 'hex'), v_u.email,
      'சுபம் அஸ்து PIN மீட்புக் குறியீடு: ' || v_code || ' (15 நிமிடங்கள் செல்லுபடியாகும்)',
      'Subham Asthu PIN reset code: ' || v_code || ' (valid 15 minutes)');
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
  if v_u.reset_tries >= 5 then return json_build_object('ok', false, 'error', 'reset_too_many'); end if;
  if crypt(trim(coalesce(p_code, '')), v_u.reset_hash) <> v_u.reset_hash then
    update users set reset_tries = reset_tries + 1 where id = v_u.id;
    return json_build_object('ok', false, 'error', 'reset_invalid_code');
  end if;
  update users set pin_hash = crypt(p_pin, gen_salt('bf', 10)), failed_attempts = 0, locked_until = null,
                   reset_hash = null, reset_expires_at = null, reset_tries = 0
   where id = v_u.id;
  return json_build_object('ok', true);
end $$;

-- ---------- partner subscription state (server-side; mirrors js/subscription.js) ----------
-- Free: first 3 completed events + rest of the 3rd event's month. Billing starts the 1st of
-- the next month. A billing month unpaid after the 5th hides the profile.
create or replace function sa_partner_state(p_partner uuid) returns json
language plpgsql stable security definer set search_path = public as $$
declare
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
  v_cur text := to_char(v_today, 'YYYY-MM');
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

  if coalesce(array_length(v_done, 1), 0) < 3 then
    return json_build_object('status', 'free', 'visible', true, 'completed', coalesce(array_length(v_done, 1), 0),
                             'freeUntil', null, 'billingStart', null);
  end if;

  v_third := v_done[3];
  v_free_until := (date_trunc('month', v_third) + interval '1 month' - interval '1 day')::date;
  if v_today <= v_free_until then
    return json_build_object('status', 'free', 'visible', true, 'completed', array_length(v_done, 1),
                             'freeUntil', to_char(v_free_until, 'YYYY-MM-DD'), 'billingStart', null);
  end if;

  v_bs := to_char(date_trunc('month', v_third) + interval '1 month', 'YYYY-MM');
  v_ym := to_date(v_bs, 'YYYY-MM');
  while to_char(v_ym, 'YYYY-MM') <= v_cur loop
    if not (to_char(v_ym, 'YYYY-MM') = any(v_paid))
       and (to_char(v_ym, 'YYYY-MM') < v_cur or extract(day from v_today) > 5) then
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

-- ---------- WhatsApp queue: exactly four triggers, each text prefixed 'சுபம் அஸ்து:' ----------
create or replace function sa_tpl(p_template text, p_i int, p_data jsonb) returns text
language plpgsql stable set search_path = public as $$
declare
  v_t text;
  v_k text;
  v_v jsonb;
begin
  select case when p_i = 0 then w.ta else w.en end into v_t from wa_templates w where w.template = p_template;
  foreach v_k in array array['pooja', 'shop', 'shop_phone', 'partner', 'phone', 'date'] loop
    v_v := p_data -> v_k;
    v_t := replace(v_t, '{' || v_k || '}',
      case when jsonb_typeof(v_v) = 'array' then coalesce(v_v ->> p_i, '')
           else coalesce(p_data ->> v_k, '') end);
  end loop;
  return v_t;
end $$;

-- Queues one message. The same ref is queued only once. Returns true when a new row was added.
create or replace function sa_queue_wa(p_template text, p_mobile text, p_ref text, p_data jsonb) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  insert into outbox (channel, template, ref, to_addr, text_ta, text_en)
  values ('whatsapp', p_template, p_ref, '+91 ' || p_mobile,
          'சுபம் அஸ்து: ' || sa_tpl(p_template, 0, p_data),
          'சுபம் அஸ்து: ' || sa_tpl(p_template, 1, p_data))
  on conflict (channel, ref) do nothing;
  return found;
end $$;

create or replace function sa_booking_data(p_name_ta text, p_name_en text, p_phone text,
  p_pooja_ta text, p_pooja_en text, p_date date) returns jsonb
language sql stable as $$
  select jsonb_build_object(
    'partner', jsonb_build_array(coalesce(p_name_ta, p_name_en, ''), coalesce(p_name_en, p_name_ta, '')),
    'phone', p_phone,
    'pooja', jsonb_build_array(coalesce(p_pooja_ta, p_pooja_en, ''), coalesce(p_pooja_en, p_pooja_ta, '')),
    'date', to_char(p_date, 'YYYY-MM-DD'));
$$;

-- ---------- customer: directory (no phone numbers), booking, my bookings, samagri order ----------
create or replace function sa_list_partners(p_role text, p_lang text, p_pin text) returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(x order by x.experience_years desc), '[]'::json) from (
    select pp.id, pp.role, pp.name_ta, pp.name_en, pp.sampradayam, pp.cook_specialty,
           pp.languages, pp.experience_years, pp.pin_code
    from partner_profiles pp
    where not pp.is_sample
      and (p_role is null or pp.role = p_role)
      and (p_lang is null or pp.languages @> array[p_lang] or pp.sampradayam = p_lang)
      and (p_pin is null or left(pp.pin_code, length(p_pin)) = p_pin)
      and sa_partner_state(pp.id) ->> 'visible' = 'true'
  ) x;
$$;

create or replace function sa_partner_public(p_id uuid) returns json
language sql stable security definer set search_path = public as $$
  select json_build_object('id', pp.id, 'role', pp.role, 'name_ta', pp.name_ta, 'name_en', pp.name_en,
         'sampradayam', pp.sampradayam, 'cook_specialty', pp.cook_specialty, 'languages', pp.languages,
         'experience_years', pp.experience_years, 'pin_code', pp.pin_code)
  from partner_profiles pp
  where pp.id = p_id and not pp.is_sample and sa_partner_state(pp.id) ->> 'visible' = 'true';
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
  select id into v_pooja from poojas where slug = p_pooja_slug;
  if v_pooja is null then return json_build_object('ok', false, 'error', 'pooja_bad'); end if;
  select * into v_pp from partner_profiles where id = p_partner;
  if v_pp.id is null or v_pp.is_sample or sa_partner_state(v_pp.id) ->> 'visible' <> 'true' then
    return json_build_object('ok', false, 'error', 'unavailable');
  end if;
  insert into service_bookings (customer_id, customer_name, provider_id, service_type, pooja_id,
                                event_date, pin_code, cook_addon)
  values (v_u.id, v_u.name, v_pp.id, v_pp.role, v_pooja, p_event_date, p_pin, coalesce(p_cook_addon, false));
  return json_build_object('ok', true);
end $$;

-- Partner's phone is revealed only on an accepted or completed booking.
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
             case when b.status in ('accepted', 'completed') then pp.phone end as partner_phone
      from service_bookings b
      join partner_profiles pp on pp.id = b.provider_id
      left join poojas pl on pl.id = b.pooja_id
      where b.customer_id = v_u.id) x));
end $$;

create or replace function sa_place_order(p_token text, p_pooja_slug text, p_pin text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u users;
  v_pool poojas;
  v_oid uuid;
begin
  v_u := sa_user(p_token);
  if v_u.id is null then return json_build_object('ok', false, 'error', 'login_first'); end if;
  if coalesce(p_pin, '') !~ '^[0-9]{6}$' then return json_build_object('ok', false, 'error', 'pin_bad'); end if;
  select * into v_pool from poojas where slug = p_pooja_slug;
  if v_pool.id is null then return json_build_object('ok', false, 'error', 'not_found'); end if;
  if not exists (select 1 from vendors where pin_code = p_pin and is_active) then
    return json_build_object('ok', false, 'error', 'store_none');
  end if;
  insert into samagri_orders (customer_id, pooja_id, pin_code, status)
  values (v_u.id, v_pool.id, p_pin, 'waiting_for_confirmation')
  returning id into v_oid;
  perform sa_queue_wa('order_received', v_u.mobile, 'order_received:' || v_oid,
    jsonb_build_object('pooja', jsonb_build_array(v_pool.name_ta, v_pool.name_en)));
  return json_build_object('ok', true);
end $$;

-- ---------- partner portal ----------
create or replace function sa_partner_portal(p_token text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u users;
  v_pp partner_profiles;
  v_sub subscriptions;
begin
  v_u := sa_user(p_token);
  if v_u.id is null then return json_build_object('ok', false, 'error', 'login_first'); end if;
  select * into v_pp from partner_profiles where user_id = v_u.id;
  if v_pp.id is null then
    return json_build_object('ok', true, 'role', v_u.role, 'profile', null);
  end if;
  select * into v_sub from subscriptions where partner_id = v_pp.id;
  return json_build_object(
    'ok', true, 'role', v_pp.role,
    'profile', json_build_object('id', v_pp.id, 'role', v_pp.role, 'name_ta', v_pp.name_ta, 'name_en', v_pp.name_en,
      'phone', v_pp.phone, 'pin_code', v_pp.pin_code, 'sampradayam', v_pp.sampradayam,
      'cook_specialty', v_pp.cook_specialty, 'languages', v_pp.languages,
      'experience_years', v_pp.experience_years),
    'state', sa_partner_state(v_pp.id),
    'subscription', case when v_sub.id is null then null
      else json_build_object('monthly_fee_inr', v_sub.monthly_fee_inr, 'paid_months', v_sub.paid_months) end,
    'bookings', (select coalesce(json_agg(x order by x.event_date), '[]'::json) from (
        select b.id, b.status, b.event_date, b.service_type, b.pin_code, b.cook_addon, b.customer_name,
               pl.name_ta as pooja_ta, pl.name_en as pooja_en
        from service_bookings b left join poojas pl on pl.id = b.pooja_id
        where b.provider_id = v_pp.id) x));
end $$;

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
                                  languages, experience_years)
    values (v_u.id, v_u.role, v_u.name, v_u.mobile, p_pin,
            case when v_u.role = 'priest' then p_spec end,
            case when v_u.role = 'cook' then p_spec end,
            p_langs, coalesce(p_years, 0));
  else
    update partner_profiles set pin_code = p_pin, languages = p_langs, experience_years = coalesce(p_years, 0),
      sampradayam = case when v_pp.role = 'priest' then p_spec else null end,
      cook_specialty = case when v_pp.role = 'cook' then p_spec else null end
    where id = v_pp.id;
  end if;
  return json_build_object('ok', true);
end $$;

create or replace function sa_set_fee(p_token text, p_fee int) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u users;
  v_pp partner_profiles;
begin
  v_u := sa_user(p_token);
  if v_u.id is null then return json_build_object('ok', false, 'error', 'login_first'); end if;
  select * into v_pp from partner_profiles where user_id = v_u.id;
  if v_pp.id is null then return json_build_object('ok', false, 'error', 'no_profile'); end if;
  if (v_pp.role = 'priest' and p_fee not between 299 and 499)
     or (v_pp.role = 'cook' and p_fee not between 499 and 799) then
    return json_build_object('ok', false, 'error', 'fee_bad');
  end if;
  insert into subscriptions (partner_id, monthly_fee_inr) values (v_pp.id, p_fee)
  on conflict (partner_id) do update set monthly_fee_inr = excluded.monthly_fee_inr;
  return json_build_object('ok', true);
end $$;

-- Marks every billing month from billing start through the current month as paid.
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
  values (p_partner, case when p_role = 'priest' then 299 else 499 end)
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

-- Partner's own status change. Accepting queues WhatsApp trigger 3 (contact shared from here on).
create or replace function sa_set_booking_status(p_token text, p_booking uuid, p_status text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u users;
  v_pp partner_profiles;
  v_b service_bookings;
  v_cust users;
  v_pool poojas;
begin
  v_u := sa_user(p_token);
  if v_u.id is null then return json_build_object('ok', false, 'error', 'login_first'); end if;
  select * into v_pp from partner_profiles where user_id = v_u.id;
  if v_pp.id is null then return json_build_object('ok', false, 'error', 'no_profile'); end if;
  select * into v_b from service_bookings where id = p_booking and provider_id = v_pp.id;
  if v_b.id is null then return json_build_object('ok', false, 'error', 'not_found'); end if;
  if not ((v_b.status = 'requested' and p_status in ('accepted', 'declined'))
       or (v_b.status = 'accepted' and p_status in ('completed', 'cancelled'))) then
    return json_build_object('ok', false, 'error', 'bad_state');
  end if;
  update service_bookings set status = p_status, updated_at = now() where id = v_b.id;
  if p_status = 'accepted' then
    select * into v_cust from users where id = v_b.customer_id;
    select * into v_pool from poojas where id = v_b.pooja_id;
    perform sa_queue_wa('booking_confirmed', v_cust.mobile, 'booking:' || v_b.id,
      sa_booking_data(v_pp.name_ta, v_pp.name_en, v_pp.phone, v_pool.name_ta, v_pool.name_en, v_b.event_date));
  end if;
  return json_build_object('ok', true);
end $$;

-- ---------- admin (admin role only) ----------
-- Customer and store phone numbers are returned only for confirmed/dispatched orders.
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
        'is_sample', pp.is_sample) order by pp.created_at), '[]'::json) from partner_profiles pp),
    'vendors', (select coalesce(json_agg(json_build_object('id', v.id, 'name', v.name, 'phone', v.phone,
        'pin_code', v.pin_code, 'is_active', v.is_active) order by v.name), '[]'::json) from vendors v),
    'orders', (select coalesce(json_agg(x order by x.created_at desc), '[]'::json) from (
        select o.id, o.created_at, o.pin_code, o.status,
               pl.name_ta as pooja_ta, pl.name_en as pooja_en,
               u.name as customer_name,
               case when o.status = 'confirmed_dispatched' then u.mobile end as customer_mobile,
               v.name as vendor_name,
               case when o.status = 'confirmed_dispatched' then v.phone end as vendor_phone
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

create or replace function sa_admin_add_vendor(p_token text, p_name text, p_phone text, p_pin text) returns json
language plpgsql security definer set search_path = public as $$
declare v_u users := sa_admin(p_token);
begin
  if v_u.id is null then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  if length(trim(coalesce(p_name, ''))) = 0 or sa_norm_mobile(p_phone) is null
     or coalesce(p_pin, '') !~ '^[0-9]{6}$' then
    return json_build_object('ok', false, 'error', 'vendor_bad');
  end if;
  insert into vendors (name, phone, pin_code) values (trim(p_name), sa_norm_mobile(p_phone), p_pin);
  return json_build_object('ok', true);
end $$;

create or replace function sa_admin_set_vendor_active(p_token text, p_vendor uuid, p_active boolean) returns json
language plpgsql security definer set search_path = public as $$
declare v_u users := sa_admin(p_token);
begin
  if v_u.id is null then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  update vendors set is_active = p_active where id = p_vendor;
  return json_build_object('ok', true);
end $$;

-- Trigger 2a: store confirms and dispatches. Store and customer numbers are shared from here on.
create or replace function sa_admin_confirm_order(p_token text, p_order uuid, p_vendor uuid) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u users := sa_admin(p_token);
  v_o samagri_orders;
  v_vd vendors;
  v_c users;
  v_pool poojas;
begin
  if v_u.id is null then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  select * into v_o from samagri_orders where id = p_order;
  if v_o.id is null or v_o.status <> 'waiting_for_confirmation' then
    return json_build_object('ok', false, 'error', 'bad_state');
  end if;
  select * into v_vd from vendors where id = p_vendor and is_active;
  if v_vd.id is null then return json_build_object('ok', false, 'error', 'pick_store'); end if;
  select * into v_c from users where id = v_o.customer_id;
  select * into v_pool from poojas where id = v_o.pooja_id;
  update samagri_orders set status = 'confirmed_dispatched', vendor_id = v_vd.id, updated_at = now()
   where id = v_o.id;
  perform sa_queue_wa('order_confirmed', v_c.mobile, 'order_final:' || v_o.id,
    jsonb_build_object('pooja', jsonb_build_array(v_pool.name_ta, v_pool.name_en),
                       'shop', jsonb_build_array(v_vd.name, v_vd.name),
                       'shop_phone', v_vd.phone));
  return json_build_object('ok', true);
end $$;

-- Trigger 2b: samagri is not available.
create or replace function sa_admin_mark_unavailable(p_token text, p_order uuid) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u users := sa_admin(p_token);
  v_o samagri_orders;
  v_c users;
  v_pool poojas;
begin
  if v_u.id is null then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  select * into v_o from samagri_orders where id = p_order;
  if v_o.id is null or v_o.status <> 'waiting_for_confirmation' then
    return json_build_object('ok', false, 'error', 'bad_state');
  end if;
  select * into v_c from users where id = v_o.customer_id;
  select * into v_pool from poojas where id = v_o.pooja_id;
  update samagri_orders set status = 'unavailable', updated_at = now() where id = v_o.id;
  perform sa_queue_wa('order_unavailable', v_c.mobile, 'order_final:' || v_o.id,
    jsonb_build_object('pooja', jsonb_build_array(v_pool.name_ta, v_pool.name_en)));
  return json_build_object('ok', true);
end $$;

-- Admin records that a partner's monthly fee was received (no payment gateway in the app).
create or replace function sa_admin_mark_paid(p_token text, p_partner uuid) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u users := sa_admin(p_token);
  v_pp partner_profiles;
begin
  if v_u.id is null then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  select * into v_pp from partner_profiles where id = p_partner;
  if v_pp.id is null then return json_build_object('ok', false, 'error', 'not_found'); end if;
  return sa_mark_paid(v_pp.id, v_pp.role);
end $$;

-- Trigger 4: one-day reminders for tomorrow's accepted bookings.
create or replace function sa_admin_queue_reminders(p_token text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u users := sa_admin(p_token);
  v_n int := 0;
  r record;
begin
  if v_u.id is null then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  for r in
    select b.id, u.mobile, pp.name_ta, pp.name_en, pp.phone, pl.name_ta as pooja_ta, pl.name_en as pooja_en, b.event_date
    from service_bookings b
    join users u on u.id = b.customer_id
    join partner_profiles pp on pp.id = b.provider_id
    left join poojas pl on pl.id = b.pooja_id
    where b.status = 'accepted' and b.event_date = (now() at time zone 'Asia/Kolkata')::date + 1
  loop
    if sa_queue_wa('reminder_1day', r.mobile, 'reminder:' || r.id,
         sa_booking_data(r.name_ta, r.name_en, r.phone, r.pooja_ta, r.pooja_en, r.event_date)) then
      v_n := v_n + 1;
    end if;
  end loop;
  return json_build_object('ok', true, 'count', v_n);
end $$;

-- Sends all five templates with sample data to the admin's own mobile.
create or replace function sa_admin_queue_test(p_token text) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u users := sa_admin(p_token);
  v_stamp text := extract(epoch from now())::bigint::text;
  v_data jsonb := jsonb_build_object(
    'pooja', jsonb_build_array('சுமங்கலி பிரார்த்தனை', 'Sumangali Prarthanai'),
    'shop', jsonb_build_array('மாதிரி பூஜைக் கடை', 'Sample Pooja Store'),
    'shop_phone', '9000000050',
    'partner', jsonb_build_array('வேதம் ராமசாமி அய்யர்', 'Vedam Ramasamy Iyer'),
    'phone', '9000000001',
    'date', '2026-12-05');
  r record;
begin
  if v_u.id is null then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  for r in select w.template from wa_templates w loop
    perform sa_queue_wa(r.template, v_u.mobile, 'test:' || r.template || ':' || v_stamp, v_data);
  end loop;
  return json_build_object('ok', true);
end $$;

-- ---------- seed: pooja catalog (slugs match js/poojas-data.js) ----------
insert into poojas (slug, name_ta, name_en, category, has_cook_option, is_self_pooja) values
('sankatahara-chaturthi', 'சங்கடஹர சதுர்த்தி', 'Sankatahara Chaturthi', 'daily_monthly', false, true),
('pradosham', 'பிரதோஷம்', 'Pradosham', 'daily_monthly', false, true),
('pournami-satyanarayana', 'பௌர்ணமி சத்யநாராயண பூஜை', 'Pournami Satyanarayana Pooja', 'daily_monthly', false, true),
('krithigai', 'கிருத்திகை', 'Krithigai', 'daily_monthly', false, true),
('ekadashi', 'ஏகாதசி', 'Ekadashi', 'daily_monthly', false, true),
('thiruvilakku-pooja', 'திருவிளக்கு பூஜை', 'Thiruvilakku Pooja', 'daily_monthly', false, true),
('weekly-home-pooja', 'வாராந்திர வெள்ளி/செவ்வாய் வீட்டு பூஜை', 'Weekly Friday/Tuesday Home Pooja', 'daily_monthly', false, true),
('varalakshmi-vratam', 'வரலட்சுமி விரதம்', 'Varalakshmi Vratam', 'annual_vratam', false, true),
('vinayagar-chaturthi', 'விநாயகர் சதுர்த்தி', 'Vinayagar Chaturthi', 'annual_vratam', false, true),
('navaratri-golu-ayudha-pooja', 'நவராத்திரி கொலு / சரஸ்வதி & ஆயுத பூஜை', 'Navaratri Golu / Saraswathi & Ayudha Pooja', 'annual_vratam', false, true),
('karthigai-deepam', 'கார்த்திகை தீபம்', 'Karthigai Deepam', 'annual_vratam', false, true),
('maha-shivaratri', 'மகா சிவராத்திரி', 'Maha Shivaratri', 'annual_vratam', false, true),
('vaikunta-ekadashi', 'வைகுண்ட ஏகாதசி', 'Vaikunta Ekadashi', 'annual_vratam', false, true),
('thai-pongal', 'தைப்பொங்கல் & மாட்டுப் பொங்கல்', 'Thai Pongal & Mattu Pongal', 'annual_vratam', false, true),
('tamil-puthandu', 'தமிழ் புத்தாண்டு', 'Tamil Puthandu', 'annual_vratam', false, true),
('aadi-velli-pooram-perukku', 'ஆடி வெள்ளி/பூரம்/பெருக்கு', 'Aadi Velli / Pooram / Perukku', 'annual_vratam', false, true),
('kedara-gauri-vratam', 'கேதார கௌரி விரதம்', 'Kedara Gauri Vratam', 'annual_vratam', false, true),
('skanda-sashti', 'கந்த சஷ்டி', 'Skanda Sashti', 'annual_vratam', false, true),
('krishna-jayanthi', 'கிருஷ்ண ஜெயந்தி', 'Krishna Jayanthi', 'annual_vratam', false, true),
('rama-navami-hanuman-jayanthi', 'ராம நவமி & அனுமன் ஜெயந்தி', 'Rama Navami & Hanuman Jayanthi', 'annual_vratam', false, true),
('sumangali-prarthanai', 'சுமங்கலி பிரார்த்தனை', 'Sumangali Prarthanai', 'annual_vratam', true, false),
('grihapravesam-vastu-shanti', 'கிரகப்பிரவேசம் & வாஸ்து சாந்தி', 'Grihapravesam & Vastu Shanti', 'home_subha_homa', true, false),
('ganapathi-homam', 'கணபதி ஹோமம்', 'Ganapathi Homam', 'home_subha_homa', true, false),
('navagraha-homam', 'நவகிரக ஹோமம்', 'Navagraha Homam', 'home_subha_homa', false, false),
('sudarshana-homam', 'சுதர்சன ஹோமம்', 'Sudarshana Homam', 'home_subha_homa', false, false),
('mrityunjaya-ayush-homam', 'மிருத்யுஞ்சய / ஆயுஷ் ஹோமம்', 'Mrityunjaya / Ayush Homam', 'home_subha_homa', true, false),
('dhanvantari-homam', 'தன்வந்திரி ஹோமம்', 'Dhanvantari Homam', 'home_subha_homa', false, false),
('chandi-homam', 'சண்டி ஹோமம்', 'Chandi Homam', 'home_subha_homa', true, false),
('new-vehicle-pooja', 'புது வாகனம்', 'New Vehicle Pooja', 'home_subha_homa', false, false),
('new-business-shop-opening', 'புதிய தொழில்/கடை திறப்பு', 'New Business/Shop Opening', 'home_subha_homa', false, false),
('bhoomi-pooja', 'பூமி பூஜை', 'Bhoomi Pooja', 'home_subha_homa', false, false),
('pumsavanam-seemantham', 'பும்சவனம் & சீமந்தம்', 'Pumsavanam & Seemantham', 'samskara_pitru', true, false),
('namakaranam', 'நாமகரணம்', 'Namakaranam', 'samskara_pitru', true, false),
('annaprashanam', 'அன்னபிராசனம்', 'Annaprashanam', 'samskara_pitru', true, false),
('karnavedham', 'கர்ணவேதம்', 'Karnavedham', 'samskara_pitru', true, false),
('aksharabhyasam', 'அட்சராப்பியாசம்', 'Aksharabhyasam', 'samskara_pitru', true, false),
('upanayanam', 'உபநயனம்', 'Upanayanam', 'samskara_pitru', true, false),
('nichayathartham', 'நிச்சயதார்த்தம்', 'Nichayathartham', 'samskara_pitru', true, false),
('thirumanam', 'திருமணம்', 'Thirumanam / Marriage', 'samskara_pitru', true, false),
('sashtiabdapoorthi-60', 'சஷ்டியப்த பூர்த்தி - 60', 'Sashtiabdapoorthi - 60th', 'samskara_pitru', true, false),
('bhimaratha-shanti-70', 'பீமரத சாந்தி - 70', 'Bhimaratha Shanti - 70th', 'samskara_pitru', true, false),
('sathabhishekam-80', 'சதாபிஷேகம் - 80', 'Sathabhishekam - 80th', 'samskara_pitru', true, false),
('amavasya-tharpanam', 'அமாவாசை தர்ப்பணம்', 'Amavasya Tharpanam', 'samskara_pitru', true, false),
('mahalaya-paksha-tharpanam', 'மகாளய பட்ச தர்ப்பணம்', 'Mahalaya Paksha Tharpanam', 'samskara_pitru', true, false),
('annual-thithi-shrardham', 'வருடாந்திர திதி / சிரார்த்தம்', 'Annual Thithi / Shrardham', 'samskara_pitru', true, false),
('padayal-vazhipadu', 'படையல் வழிபாடு', 'Padayal Vazhipadu', 'samskara_pitru', true, false),
('10th-16th-day-karyams', '10-ம் / 16-ம் நாள் காரியங்கள்', '10th / 16th Day Karyams', 'samskara_pitru', true, false);

-- ---------- seed: WhatsApp templates (the four triggers; text matches js/whatsapp.js) ----------
insert into wa_templates (template, ta, en) values
('order_received',
 'உங்கள் சாமான் ஆர்டர் பெறப்பட்டது — {pooja}. கடை உறுதிப்படுத்தும் வரை காத்திருக்கவும்.',
 'Your samagri order for {pooja} has been received. Please wait for confirmation.'),
('order_confirmed',
 'உங்கள் சாமான் ஆர்டர் உறுதி செய்யப்பட்டு அனுப்பப்பட்டது — {pooja}. கடை: {shop} · தொடர்பு: +91 {shop_phone}',
 'Your samagri order for {pooja} is confirmed and dispatched. Store: {shop} · Contact: +91 {shop_phone}'),
('order_unavailable',
 'மன்னிக்கவும், {pooja} சாமான் ஆர்டர் இப்போது கிடைக்கவில்லை.',
 'Sorry, the samagri order for {pooja} is unavailable right now.'),
('booking_confirmed',
 '{partner} உங்கள் {pooja} முன்பதிவை ({date}) ஏற்றுக்கொண்டார். நேரடித் தொடர்பு: +91 {phone}. தட்சணையை நேரடியாகப் பேசி முடிவு செய்யவும்.',
 '{partner} has accepted your {pooja} booking for {date}. Direct contact: +91 {phone}. Please agree the dakshina directly.'),
('reminder_1day',
 'நாளை ({date}) உங்கள் {pooja} நிகழ்ச்சி. {partner} · +91 {phone}',
 'Reminder: your {pooja} is tomorrow ({date}). {partner} · +91 {phone}');

-- ---------- seed: placeholder partners (hidden from customers: is_sample) ----------
-- Fictional. Replace with real partners before launch (delete the rows or set is_sample = false).
insert into partner_profiles (role, name_ta, name_en, phone, pin_code, sampradayam, cook_specialty, languages, experience_years, is_sample) values
('priest', 'வேதம் ராமசாமி அய்யர்', 'Vedam Ramasamy Iyer', '9000000001', '600126', 'Vadagalai', null, '{Tamil,Sanskrit}', 18, true),
('priest', 'கிருஷ்ண சாஸ்திரிகள்', 'Krishna Sastrigal', '9000000002', '600004', 'Thenkalai', null, '{Tamil,Sanskrit,English}', 12, true),
('priest', 'சுப்ரமணிய குருக்கள்', 'Subramania Gurukkal', '9000000003', '620001', 'Smartha', null, '{Tamil,Telugu}', 22, true),
('priest', 'நாராயணன் பட்டாச்சார்யர்', 'Narayanan Bhattacharyar', '9000000004', '641001', 'Vadagalai', null, '{Tamil}', 9, true),
('priest', 'சீனிவாச தீட்சிதர்', 'Srinivasa Dikshitar', '9000000005', '600028', 'Thenkalai', null, '{Tamil}', 15, true),
('priest', 'ஆனந்த சர்மா', 'Ananda Sharma', '9000000006', '641001', 'Smartha', null, '{Tamil,English}', 25, true),
('cook', 'லக்ஷ்மி அம்மாள்', 'Lakshmi Ammal', '9000000007', '600126', null, 'iyer_veg', '{Tamil}', 10, true),
('cook', 'மீனாட்சி சமையல்', 'Meenakshi Samayal', '9000000008', '600004', null, 'festival_sweets', '{Tamil,English}', 7, true),
('cook', 'ரங்கநாயகி', 'Ranganayaki', '9000000009', '620001', null, 'iyengar_veg', '{Tamil,Telugu}', 14, true),
('cook', 'கோமதி சமையல் குழு', 'Gomathi Cooking Team', '9000000010', '641001', null, 'iyer_veg', '{Tamil,Malayalam}', 5, true);

-- ---------- seed: placeholder store, paused so it never receives orders until real stores are added ----------
insert into vendors (name, phone, pin_code, is_active) values
('மாதிரி பூஜைக் கடை · Sample Pooja Store', '9000000050', '600126', false);

-- ---------- seed: admin account. The PIN is random; it is shown ONCE in the result below. ----------
with p as (
  select lpad((('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint % 1000000)::text, 6, '0') as pin
), ins as (
  insert into users (name, mobile, email, role, pin_hash)
  select 'Admin', '9000000099', 'admin@subhamasthu.test', 'admin', crypt(p.pin, gen_salt('bf', 10)) from p
  returning id
)
select 'Admin mobile 9000000099 · PIN: ' || p.pin || '  (save it now; it is not stored anywhere else)' as admin_login
from p;

-- ---------- grants: the public key may call the public API only ----------
-- Helpers (sa_open_session, sa_queue_wa, sa_mark_paid, sa_user, sa_admin, ...) stay internal.
revoke execute on all functions in schema public from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant execute on function
  sa_register(text, text, text, text, text),
  sa_login(text, text),
  sa_logout(text),
  sa_me(text),
  sa_request_pin_reset(text, text),
  sa_confirm_pin_reset(text, text, text, text),
  sa_list_partners(text, text, text),
  sa_partner_public(uuid),
  sa_create_booking(text, uuid, text, date, text, boolean),
  sa_my_bookings(text),
  sa_place_order(text, text, text),
  sa_partner_portal(text),
  sa_save_profile(text, text, text, int, text[]),
  sa_set_fee(text, int),
  sa_set_booking_status(text, uuid, text),
  sa_admin_dashboard(text),
  sa_admin_add_vendor(text, text, text, text),
  sa_admin_set_vendor_active(text, uuid, boolean),
  sa_admin_confirm_order(text, uuid, uuid),
  sa_admin_mark_unavailable(text, uuid),
  sa_admin_mark_paid(text, uuid),
  sa_admin_queue_reminders(text),
  sa_admin_queue_test(text)
to anon, authenticated;
