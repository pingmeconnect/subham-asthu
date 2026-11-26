-- Subham Astu v12: WhatsApp confirmation to a priest/cook when the admin approves their profile.
-- Run once in Supabase SQL Editor, after migration_v11_uniform_plan.sql.

-- 1) Editable Tamil + English text (admin can change it in the WhatsApp template settings).
insert into app_settings (key, value, label, group_name) values
  ('wa_tpl_partner_approved',
   jsonb_build_object(
     'ta', '{partner}, உங்கள் சுயவிவரம் சுபம் அஸ்து தளத்தில் இப்போது நேரலையில் உள்ளது. உங்கள் பகுதி வாடிக்கையாளர்கள் இப்போது உங்களைக் கண்டு பதிவு செய்யலாம்.',
     'en', '{partner}, your profile on Subham Asthu is now live. Customers in your service area can now find and book you.'),
   'WhatsApp 0 · Profile approved and live (Tamil & English)', 'whatsapp'),
  ('wa_trigger_partner_approved', 'true', 'WhatsApp 0 · Send when a priest/cook profile is approved', 'whatsapp')
on conflict (key) do nothing;

-- 2) Approving sends the message once (only when the profile changes from not-approved to approved).
create or replace function sa_admin_set_partner_flags(p_token text, p_partner uuid, p_approved boolean, p_hidden boolean)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_u users := sa_admin(p_token);
  v_pp partner_profiles;
  v_mobile text;
begin
  if v_u.id is null then return json_build_object('ok', false, 'error', 'forbidden'); end if;
  select * into v_pp from partner_profiles where id = p_partner;
  if v_pp.id is null then return json_build_object('ok', false, 'error', 'not_found'); end if;

  update partner_profiles set is_approved = p_approved, is_hidden = p_hidden where id = p_partner;

  if p_approved and not v_pp.is_approved and sa_setting_bool('wa_trigger_partner_approved') then
    select coalesce(
      (select u.mobile from users u where u.id = v_pp.user_id), v_pp.phone) into v_mobile;
    if v_mobile is not null and v_mobile ~ '^[0-9]{10}$' then
      perform sa_queue_wa('partner_approved', v_mobile, 'partner_approved:' || v_pp.id,
        jsonb_build_object('partner', jsonb_build_array(coalesce(v_pp.name_ta, ''), coalesce(v_pp.name_en, ''))));
    end if;
  end if;
  return json_build_object('ok', true);
end $$;

grant execute on function sa_admin_set_partner_flags(text, uuid, boolean, boolean) to anon, authenticated;

-- Confirm: should return 2.
select count(*) as partner_approved_settings from app_settings where key in ('wa_tpl_partner_approved','wa_trigger_partner_approved');
