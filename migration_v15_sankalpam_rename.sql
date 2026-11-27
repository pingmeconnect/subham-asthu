-- Sankalpam rebrand (v15): renames the live database texts from "Subham Asthu" / "சுபம் அஸ்து" to "Sankalpam" / "சங்கல்பம்".
-- Run ONCE in the Supabase SQL editor, after deploying the new app files.
-- Safe to re-run: it only changes text that still has the old name.

-- 1) Saved app texts and WhatsApp/email templates (stored as JSON in app_settings).
update app_settings
set value = (
  replace(replace(replace(replace(replace(replace(replace(
    value::text,
    'சுபம் அஸ்து:', 'Sankalpam:'),
    'சுபம் அஸ்துவின்', 'சங்கல்பத்தின்'),
    'சுபம் அஸ்து', 'சங்கல்பம்'),
    'SUBHAM ASTHU', 'SANKALPAM'),
    'SUBHAM ASTU', 'SANKALPAM'),
    'Subham Asthu', 'Sankalpam'),
    'Subham Astu', 'Sankalpam')
)::jsonb
where value::text ~* 'subham|சுபம் அஸ்து';

-- 2) Stored functions (PIN reset emails, WhatsApp queue, admin texts): rewrite each one with the new text.
do $$
declare r record; d text;
begin
  for r in
    select oid from pg_proc
    where pronamespace = 'public'::regnamespace
      and (prosrc ~* 'subham|சுபம் அஸ்து')
  loop
    d := pg_get_functiondef(r.oid);
    d := replace(replace(replace(replace(replace(replace(
           d, 'சுபம் அஸ்து:', 'Sankalpam:'),
           'சுபம் அஸ்துவின்', 'சங்கல்பத்தின்'),
           'சுபம் அஸ்து', 'சங்கல்பம்'),
           'Subham Asthu', 'Sankalpam'),
           'Subham Astu', 'Sankalpam'),
           'SUBHAM ASTU', 'SANKALPAM');
    execute d;
  end loop;
end $$;

-- 3) Check: this should return no rows (apart from the old setting keys, which are not texts).
select key from app_settings where value::text ~* 'subham|சுபம் அஸ்து';
