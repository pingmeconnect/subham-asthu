-- Subham Astu v11: one uniform plan for priests and cooks, customer-confirmed completion,
-- cancel reason, and plan details for the admin.
-- Run once in Supabase SQL Editor, after migration_v9_contact.sql (and the earlier migrations).

-- 1) Plan settings. Priest and cook use the same plan.
insert into app_settings (key, value, label, group_name) values
  ('sub_trial_days',      '60',  'Free trial: days after registration', 'subscription'),
  ('sub_trial_orders',    '1',   'Free trial: completed orders needed', 'subscription'),
  ('sub_starter_fee',     '299', 'Starter plan: fee per month (INR)', 'subscription'),
  ('sub_standard_fee',    '499', 'Standard plan: fee per month (INR)', 'subscription'),
  ('sub_standard_after',  '5',   'Completed orders up to this number stay on Starter', 'subscription')
on conflict (key) do update set value = excluded.value, label = excluded.label, group_name = excluded.group_name;

-- 2) Booking statuses: a booking is 'completed' only after the customer confirms it. 'not_completed' = customer said no.
alter table service_bookings add column if not exists cancel_reason text;
alter table service_bookings add column if not exists completed_at timestamptz;
alter table service_bookings drop constraint if exists service_bookings_status_check;
alter table service_bookings add constraint service_bookings_status_check check (status in (
  'requested', 'accepted', 'declined', 'cancelled', 'completed', 'not_completed'));

-- 3) Plan state: free trial until (1 completed order AND 60 days from registration); then Starter (1-5 completed) or Standard (6+).
create or replace function sa_partner_state(p_partner uuid) returns json
language plpgsql stable security definer set search_path = public as $$
declare
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
  v_cur text := to_char(v_today, 'YYYY-MM');
  v_pp partner_profiles;
  v_done date[];
  v_paid text[];
  v_completed int;
  v_trial_orders int := sa_setting_int('sub_trial_orders');
  v_trial_days int := sa_setting_int('sub_trial_days');
  v_after int := sa_setting_int('sub_standard_after');
  v_trial_end date;
  v_over_on date;
  v_bs text;
  v_ym date;
  v_overdue boolean := false;
  v_st text;
  v_tier text;
  v_fee int;
begin
  select * into v_pp from partner_profiles where id = p_partner;
  if v_pp.id is null then return json_build_object('status', 'none', 'visible', false); end if;
  select coalesce(array_agg(event_date order by event_date), '{}') into v_done
    from service_bookings where provider_id = p_partner and status = 'completed';
  v_completed := coalesce(array_length(v_done, 1), 0);
  select s.paid_months into v_paid from subscriptions s where s.partner_id = p_partner;
  v_paid := coalesce(v_paid, '{}');
  v_trial_end := (v_pp.created_at at time zone 'Asia/Kolkata')::date + v_trial_days;

  -- Still in the free trial: needs BOTH the first completed order AND the 60 days to pass.
  if not (v_completed >= v_trial_orders and v_today > v_trial_end) then
    return json_build_object('status', 'free', 'visible', true, 'completed', v_completed, 'tier', 'trial',
      'fee', 0, 'trialEnd', to_char(v_trial_end, 'YYYY-MM-DD'), 'freeUntil', to_char(v_trial_end, 'YYYY-MM-DD'),
      'billingStart', null, 'standardAfter', v_after);
  end if;

  -- Trial is over. Billing starts from the 1st of the month after the day the trial ended.
  v_over_on := greatest(v_trial_end + 1, v_done[v_trial_orders]);
  v_bs := to_char(date_trunc('month', v_over_on) + interval '1 month', 'YYYY-MM');
  v_tier := case when v_completed > v_after then 'standard' else 'starter' end;
  v_fee := case when v_tier = 'standard' then sa_setting_int('sub_standard_fee') else sa_setting_int('sub_starter_fee') end;

  v_ym := to_date(v_bs, 'YYYY-MM');
  while to_char(v_ym, 'YYYY-MM') <= v_cur loop
    if not (to_char(v_ym, 'YYYY-MM') = any(v_paid))
       and (to_char(v_ym, 'YYYY-MM') < v_cur or extract(day from v_today) > sa_setting_int('sub_grace_day')) then
      v_overdue := true;
    end if;
    v_ym := (v_ym + interval '1 month')::date;
  end loop;

  if v_overdue then v_st := 'hidden';
  elsif v_cur = any(v_paid) then v_st := 'paid';
  else v_st := 'due';
  end if;

  return json_build_object('status', v_st, 'visible', v_st <> 'hidden', 'completed', v_completed,
    'tier', v_tier, 'fee', v_fee, 'trialEnd', to_char(v_trial_end, 'YYYY-MM-DD'),
    'freeUntil', null, 'billingStart', v_bs, 'standardAfter', v_after);
end $$;

-- 4) Fees are fixed now (set by the plan), so the old fee chooser does nothing.
create or replace function sa_set_fee(p_token text, p_fee int) returns json
language plpgsql security definer set search_path = public as $$
begin
  return json_build_object('ok', false, 'error', 'fee_fixed');
end $$;

-- 5) Admin marks paid. Records the fee of the current plan.
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
  values (p_partner, coalesce((v_st ->> 'fee')::int, 299))
  on conflict (partner_id) do update set monthly_fee_inr = excluded.monthly_fee_inr;
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

-- 6) Provider: accept, decline, or cancel (cancel needs a reason). Provider can no longer mark 'completed'.
drop function if exists sa_set_booking_status(text, uuid, text);
create or replace function sa_set_booking_status(p_token text, p_booking uuid, p_status text, p_reason text default null) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u users;
  v_pp partner_profiles;
  v_b service_bookings;
  v_cust users;
  v_pool poojas;
  v_reason text := btrim(coalesce(p_reason, ''));
begin
  v_u := sa_user(p_token);
  if v_u.id is null then return json_build_object('ok', false, 'error', 'login_first'); end if;
  select * into v_pp from partner_profiles where user_id = v_u.id;
  if v_pp.id is null then return json_build_object('ok', false, 'error', 'no_profile'); end if;
  select * into v_b from service_bookings where id = p_booking and provider_id = v_pp.id;
  if v_b.id is null then return json_build_object('ok', false, 'error', 'not_found'); end if;
  if not ((v_b.status = 'requested' and p_status in ('accepted', 'declined'))
       or (v_b.status = 'accepted' and p_status = 'cancelled')) then
    return json_build_object('ok', false, 'error', 'bad_state');
  end if;
  if p_status = 'cancelled' and char_length(v_reason) not between 3 and 200 then
    return json_build_object('ok', false, 'error', 'reason_bad');
  end if;
  update service_bookings
    set status = p_status, cancel_reason = case when p_status = 'cancelled' then v_reason else cancel_reason end,
        updated_at = now()
    where id = v_b.id;
  if p_status = 'accepted' then
    select * into v_cust from users where id = v_b.customer_id;
    select * into v_pool from poojas where id = v_b.pooja_id;
    perform sa_queue_wa('booking_confirmed', v_cust.mobile, 'booking:' || v_b.id,
      sa_booking_data(v_pp.name_ta, v_pp.name_en, v_pp.phone, v_pool.name_ta, v_pool.name_en, v_b.event_date));
  end if;
  return json_build_object('ok', true);
end $$;

-- 7) Customer confirms after the event date: Yes = completed (counts for the plan), No = not completed.
create or replace function sa_confirm_completion(p_token text, p_booking uuid, p_done boolean) returns json
language plpgsql security definer set search_path = public as $$
declare
  v_u users := sa_user(p_token);
  v_b service_bookings;
begin
  if v_u.id is null then return json_build_object('ok', false, 'error', 'login_first'); end if;
  select * into v_b from service_bookings where id = p_booking and customer_id = v_u.id;
  if v_b.id is null then return json_build_object('ok', false, 'error', 'not_found'); end if;
  if v_b.status <> 'accepted' then return json_build_object('ok', false, 'error', 'bad_state'); end if;
  if v_b.event_date > (now() at time zone 'Asia/Kolkata')::date then
    return json_build_object('ok', false, 'error', 'too_early');
  end if;
  update service_bookings
    set status = case when p_done then 'completed' else 'not_completed' end,
        completed_at = case when p_done then now() end, updated_at = now()
    where id = v_b.id;
  return json_build_object('ok', true);
end $$;

-- 8) Customer's bookings: adds the Yes/No prompt flag and the provider's cancel reason.
create or replace function sa_my_bookings(p_token text) returns json
language plpgsql security definer set search_path = public as $$
declare v_u users;
begin
  v_u := sa_user(p_token);
  if v_u.id is null then return json_build_object('ok', false, 'error', 'login_first'); end if;
  return json_build_object('ok', true, 'bookings', (
    select coalesce(json_agg(x order by x.event_date desc), '[]'::json) from (
      select b.id, b.service_type, b.event_date, b.event_time, b.venue_address, b.notes, b.pin_code, b.cook_addon, b.status,
             pl.name_ta as pooja_ta, pl.name_en as pooja_en,
             pp.name_ta, pp.name_en, pp.verify_level, b.prefs, fb.rating as feedback,
             b.cancel_reason,
             (b.status = 'accepted' and b.event_date <= (now() at time zone 'Asia/Kolkata')::date) as can_confirm,
             case when b.status in ('accepted', 'completed') or not sa_setting_bool('mask_phone_numbers')
                  then pp.phone end as partner_phone
      from service_bookings b
      join partner_profiles pp on pp.id = b.provider_id
      left join poojas pl on pl.id = b.pooja_id
      left join feedback fb on fb.kind = 'booking' and fb.ref_id = b.id
      where b.customer_id = v_u.id) x));
end $$;

-- 9) Admin partner list: adds each provider's plan, so admin can see trial, tier and completed count.
create or replace function sa_admin_list_partners_full(p_token text) returns json
language plpgsql security definer set search_path = public as $$
declare v_u users := sa_admin(p_token);
begin
  if v_u.id is null then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  return json_build_object('ok', true, 'partners', (
    select coalesce(json_agg(json_build_object('id', pp.id, 'role', pp.role, 'phone', pp.phone, 'phone2', pp.phone2,
        'areas', pp.service_areas, 'has_photo', pp.photo_url is not null, 'added_by_admin', pp.added_by_admin,
        'verify_level', pp.verify_level,
        'plan', sa_partner_state(pp.id),
        'traditions', case when cardinality(pp.traditions) > 0 then to_jsonb(pp.traditions)
                           when pp.sampradayam is null then '[]'::jsonb else jsonb_build_array(pp.sampradayam) end)
        order by pp.created_at), '[]'::json)
    from partner_profiles pp where not pp.is_sample));
end $$;

-- Grants for the functions that the site calls.
grant execute on function sa_set_booking_status(text, uuid, text, text) to anon, authenticated;
grant execute on function sa_confirm_completion(text, uuid, boolean) to anon, authenticated;
grant execute on function sa_my_bookings(text) to anon, authenticated;
grant execute on function sa_admin_list_partners_full(text) to anon, authenticated;

-- Confirm: should return the 5 plan settings.
select count(*) as plan_settings from app_settings where key in ('sub_trial_days','sub_trial_orders','sub_starter_fee','sub_standard_fee','sub_standard_after');
