// Subham Astu: sends queued WhatsApp messages through the WhatsApp Business Cloud API (approved templates).
// Deploy: supabase functions deploy send-whatsapp --no-verify-jwt
// Secrets: supabase secrets set WA_PHONE_NUMBER_ID=... WA_ACCESS_TOKEN=... [WA_LANG_CODE=en] [WA_API_VERSION=v21.0]
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically to Edge Functions.
//
// Each Meta template must have its body variables {{1}}, {{2}}... in EXACTLY the order listed below.
// Template name in Meta = WA_TEMPLATE_PREFIX (default "sa_") + the template key, e.g. sa_booking_confirmed.

import { createClient } from "npm:@supabase/supabase-js@2";

const VARS: Record<string, string[]> = {
  order_received:    ["pooja"],
  order_confirmed:   ["pooja", "shop", "shop_phone"],
  order_unavailable: ["pooja"],
  booking_confirmed: ["partner", "pooja", "date", "phone"],
  reminder_1day:     ["pooja", "date", "partner", "phone"],
  partner_approved:  ["partner"],
};
const MAX_ATTEMPTS = 5;

function valueFor(data: Record<string, unknown>, key: string, langIndex: number): string {
  const v = data?.[key];
  if (Array.isArray(v)) return String(v[langIndex] ?? v[1] ?? v[0] ?? "");
  return v == null ? "" : String(v);
}

function toMetaNumber(to: string): string {
  // Outbox stores "+91 9876543210" style; Meta wants digits with country code, no plus.
  const digits = to.replace(/\D/g, "");
  return digits.length === 10 ? "91" + digits : digits;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 });

  const phoneId = Deno.env.get("WA_PHONE_NUMBER_ID");
  const token = Deno.env.get("WA_ACCESS_TOKEN");
  const apiVersion = Deno.env.get("WA_API_VERSION") ?? "v21.0";
  const langCode = Deno.env.get("WA_LANG_CODE") ?? "en_US";
  const namePrefix = Deno.env.get("WA_TEMPLATE_PREFIX") ?? "sa_";
  if (!phoneId || !token) {
    return Response.json({ ok: false, error: "whatsapp_not_configured" }, { status: 500 });
  }
  const langIndex = langCode.startsWith("ta") ? 0 : 1;

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: rows, error } = await db
    .from("outbox")
    .select("id, template, to_addr, params, attempts")
    .eq("channel", "whatsapp")
    .eq("status", "queued")
    .lt("attempts", MAX_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(25);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  let sent = 0, failed = 0, skipped = 0;
  for (const row of rows ?? []) {
    const vars = VARS[row.template];
    if (!vars) { skipped++; continue; } // not a template we send through the API

    const parameters = vars.map((k) => ({ type: "text", text: valueFor(row.params ?? {}, k, langIndex) }));
    const body = {
      messaging_product: "whatsapp",
      to: toMetaNumber(row.to_addr),
      type: "template",
      template: {
        name: namePrefix + row.template,
        language: { code: langCode },
        components: parameters.length ? [{ type: "body", parameters }] : [],
      },
    };

    try {
      const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneId}/messages`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.messages?.[0]?.id) {
        await db.from("outbox").update({
          status: "sent", sent_at: new Date().toISOString(),
          provider_id: json.messages[0].id, last_error: null,
        }).eq("id", row.id);
        sent++;
      } else {
        const attempts = (row.attempts ?? 0) + 1;
        const msg = json?.error?.message ?? `http_${res.status}`;
        await db.from("outbox").update({
          attempts, last_error: msg.slice(0, 500),
          status: attempts >= MAX_ATTEMPTS ? "failed" : "queued",
        }).eq("id", row.id);
        failed++;
      }
    } catch (e) {
      const attempts = (row.attempts ?? 0) + 1;
      await db.from("outbox").update({
        attempts, last_error: String(e).slice(0, 500),
        status: attempts >= MAX_ATTEMPTS ? "failed" : "queued",
      }).eq("id", row.id);
      failed++;
    }
  }
  return Response.json({ ok: true, sent, failed, skipped, checked: rows?.length ?? 0 });
});
