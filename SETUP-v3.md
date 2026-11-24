# Subham Asthu v3 – setup (do in this order)

1. Supabase → SQL Editor → paste all of `migration_v3_launch.sql` → Run. Then paste all of `migration_v3b_calendar.sql` → Run (pooja dates calendar).
2. Upload the folder contents (index.html, sw.js, manifest.json, js/, css/) to your hosting, replacing old files. Press Ctrl+F5.
3. Register your admin account again if needed, then set a 6-digit PIN (Account → Change my PIN).
4. Admin → Settings: fill UPI ID, offer footer (e.g. "Reply STOP to stop offers").
5. Emails (optional but needed for Forgot PIN):
   - Create a free Brevo account, verify a sender email, create an API key.
   - Supabase CLI: `supabase functions deploy send-outbox --no-verify-jwt`
   - `supabase secrets set BREVO_API_KEY=xxxx SENDER_EMAIL=you@yourdomain`
6. Have a priest check the Tamil mantras in js/self-poojas.js before going live.
7. Delete old files in the parent folder: index-1.html, subham-asthu-phase1.zip.
8. Supabase → enable daily backups; add a free uptime monitor for your site.
9. Test the PDF download on an Android phone and an iPhone.

10. Admin → Pooja dates: confirm the pre-filled dates in your panchangam and add the next months (Pradosham, Ekadashi, Pournami, Sankatahara, Krithigai, festivals).
