# WhatsApp Business API: automatic sending (setup)

The site queues each WhatsApp message in the database. The `send-whatsapp` function sends queued messages through Meta's WhatsApp Cloud API using your approved templates.

## 1. Meta side (you do this once)
1. In Meta Business Manager, open the WhatsApp Business app and note the **Phone number ID** (WhatsApp > API Setup).
2. Create a **permanent access token** (System User in Business Settings, with `whatsapp_business_messaging` permission). Do not use the temporary 24-hour token.
3. Your templates must be **Approved**. For each template, the body variables must be in this order:

| Template name (Meta) | Body variables, in order |
|---|---|
| `sa_order_received` | {{1}} pooja |
| `sa_order_confirmed` | {{1}} pooja, {{2}} shop, {{3}} shop phone |
| `sa_order_unavailable` | {{1}} pooja |
| `sa_booking_confirmed` | {{1}} partner, {{2}} pooja, {{3}} date, {{4}} phone |
| `sa_reminder_1day` | {{1}} pooja, {{2}} date, {{3}} partner, {{4}} phone |
| `sa_partner_approved` | {{1}} partner |

Names are the key with an `sa_` prefix (for example `sa_booking_confirmed`), which matches your existing templates. `sa_partner_approved` still needs creating: English, Utility, body `{{1}}, your profile on Subham Asthu is now live. Customers in your service area can now find and book you.`

## 2. Supabase side
1. Run `migration_v13_whatsapp_api.sql` in the SQL Editor (it should show 5).
2. Set the secrets (Supabase CLI or Dashboard > Edge Functions > Secrets):
   ```
   supabase secrets set WA_PHONE_NUMBER_ID=123456789012345 WA_ACCESS_TOKEN=EAAG... WA_LANG_CODE=en_US
   ```
   `WA_LANG_CODE` must match the language code of your templates exactly. Your templates show English, which is usually `en_US`; open one in Meta to confirm the code. Default in the function is `en_US`.
3. Deploy: `supabase functions deploy send-whatsapp --no-verify-jwt`
4. Test once: open the function URL with POST, or run the schedule below. The response shows `sent` and `failed` counts.
5. Optional, every minute: uncomment and run the `cron.schedule` block at the end of migration v13, after replacing `YOUR_PROJECT_REF` and `YOUR_ANON_KEY`. Enable the `pg_net` and `pg_cron` extensions first.

## 3. Check it works
- Queue a test (Admin > Automatic messages > Queue test messages). Within a minute the messages should send to your own number.
- Failed messages stay in the outbox with `status = failed` and the reason in `last_error`. Check them with:
  `select template, attempts, last_error from outbox where channel = 'whatsapp' and status <> 'sent' order by created_at desc;`

## Notes
- The function only sends messages with the six template names above. Other queued messages are skipped.
- Each message is tried up to 5 times, then marked `failed`.
- The admin "Messages to send" buttons still work as a manual fallback.
- Meta charges per conversation, and templates must be approved before they send.
