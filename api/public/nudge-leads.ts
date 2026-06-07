export const config = { runtime: "edge" };

// ─────────────────────────────────────────────────────────────────
// RE-ENGAGEMENT NUDGE — called by cron-job.org hourly
// URL: https://nairalens.com/api/public/nudge-leads
// Auth header: x-cron-secret: <CRON_SECRET>
//
// Targets leads where:
//   - last_touch_at > 24h ago (gone quiet)
//   - nudge_sent_at > 48h ago (not nudged recently)
//   - ai_paused = false
//   - stage not in ['deposited', 'cold']
//   - intent_score >= 40
//
// Meta Cloud API leads (24h+ silent): MUST use approved templates
// Twilio leads: can use free-form text
// ─────────────────────────────────────────────────────────────────

async function sbFetch(
  supabaseUrl: string,
  serviceKey: string,
  path: string,
  opts: RequestInit = {},
) {
  const res = await fetch(`${supabaseUrl}/rest/v1${path}`, {
    ...opts,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: opts.method === "POST" ? "return=representation" : "",
      ...(opts.headers as Record<string, string>),
    },
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ─── META CLOUD API ──────────────────────────────────────────────

// Send an approved WhatsApp template message.
// Required for leads silent 24+ hours — plain text is blocked by Meta.
async function sendMetaTemplate(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  templateName: string,
  leadFirstName: string,
): Promise<boolean> {
  const r = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: leadFirstName || "there" }],
          },
        ],
      },
    }),
  });
  if (!r.ok) {
    const err = await r.text();
    console.error("[nudge-meta-template]", r.status, err.slice(0, 200));
    return false;
  }
  return true;
}

// Send a free-form Meta Cloud API message (only valid within 24h session window).
async function sendMetaText(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  body: string,
): Promise<boolean> {
  const r = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });
  if (!r.ok) {
    console.error("[nudge-meta-text]", r.status, await r.text());
    return false;
  }
  return true;
}

// ─── TWILIO ──────────────────────────────────────────────────────

async function sendTwilioMessage(
  accountSid: string,
  authToken: string,
  from: string,
  to: string,
  body: string,
): Promise<void> {
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: `whatsapp:${from}`,
        To: `whatsapp:${to}`,
        Body: body,
      }).toString(),
    },
  );
  if (!res.ok) throw new Error(`Twilio send failed: ${res.status} — ${await res.text()}`);
}

// ─── NUDGE CONTENT ───────────────────────────────────────────────

// Template names — must match exactly what's approved in Meta Business Manager.
// Update these once templates are approved (Meta may append _01 or similar).
const META_TEMPLATES = ["reengagement_property", "followup_nudge"] as const;

// Free-form messages for Twilio leads (no 24h restriction on sandbox)
const TWILIO_NUDGES = [
  (name: string, prop: string) =>
    `Hi${name ? ` ${name}` : ""}! Just checking in — are you still thinking about that property? ${prop ? `The ${prop} slot` : "What we discussed"} is still available. Prices in this corridor have been moving — I want to make sure you don't miss out.`,

  (name: string, prop: string) =>
    `${name || "Hi"}! Two buyers asked about ${prop || "the property we discussed"} this week. I held off confirming with them because I wanted to give you first right of refusal. Still interested? Even a small reservation locks in today's price.`,

  (name: string, _prop: string) =>
    `${name || "Good day"}! Quick check-in — I've got fresh movement in this market and want to make sure you have the latest before you decide. Is now a better time to continue our conversation?`,
];

// ─── MAIN HANDLER ────────────────────────────────────────────────

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  // Auth: accept x-cron-secret header (cron-job.org) or Authorization: Bearer (dashboard)
  const cronSecret = process.env.CRON_SECRET;
  const headerSecret =
    request.headers.get("x-cron-secret") ??
    request.headers.get("Authorization")?.replace("Bearer ", "");

  if (cronSecret && headerSecret !== cronSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

  const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const cutoff48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  // Fetch warm/hot leads that have gone quiet
  const leadsRows = await sbFetch(
    supabaseUrl,
    serviceKey,
    `/leads?intent_score=gte.40&stage=neq.deposited&stage=neq.cold&ai_paused=eq.false` +
      `&last_touch_at=lt.${encodeURIComponent(cutoff24h)}` +
      `&select=id,name,phone,user_id,intent_score,stage,nudge_sent_at,followup_count` +
      `&order=intent_score.desc&limit=30`,
  );

  const candidates = Array.isArray(leadsRows)
    ? leadsRows.filter(
        (l: any) =>
          !l.nudge_sent_at || new Date(l.nudge_sent_at).getTime() < Date.now() - 48 * 60 * 60 * 1000,
      )
    : [];

  let nudged = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const lead of candidates) {
    try {
      // Get WhatsApp integration for this user
      const integRows = await sbFetch(
        supabaseUrl,
        serviceKey,
        `/whatsapp_integrations?user_id=eq.${lead.user_id}&status=eq.connected&limit=1`,
      );
      const integ = Array.isArray(integRows) ? integRows[0] : null;
      if (!integ) { skipped++; continue; }

      const firstName = (lead.name || "").split(" ")[0].trim();
      const followupCount = lead.followup_count ?? 0;

      // Get best available property for context
      const propRows = await sbFetch(
        supabaseUrl,
        serviceKey,
        `/properties?user_id=eq.${lead.user_id}&status=eq.available&select=name&order=price.asc&limit=1`,
      );
      const propName = Array.isArray(propRows) && propRows[0] ? propRows[0].name : "";

      const isTwilio = integ.phone_number_id === "twilio";
      let sent = false;
      let nudgeText = "";

      if (isTwilio) {
        // Twilio sandbox: free-form text is fine
        if (!twilioAccountSid || !twilioAuthToken || !integ.business_phone) {
          skipped++;
          continue;
        }
        const idx = followupCount % TWILIO_NUDGES.length;
        nudgeText = TWILIO_NUDGES[idx](firstName, propName);
        await sendTwilioMessage(
          twilioAccountSid,
          twilioAuthToken,
          integ.business_phone,
          lead.phone,
          nudgeText,
        );
        sent = true;
      } else {
        // Meta Cloud API lead — must use approved template (lead is 24h+ silent)
        if (!integ.phone_number_id || !integ.access_token) { skipped++; continue; }

        // Alternate between the two approved templates
        const templateName = META_TEMPLATES[followupCount % META_TEMPLATES.length];
        nudgeText = `[Template: ${templateName}] Hi ${firstName || "there"}, [re-engagement message]`;

        sent = await sendMetaTemplate(
          integ.phone_number_id,
          integ.access_token,
          lead.phone,
          templateName,
          firstName,
        );

        if (!sent) {
          // Templates not approved yet — try free-form as last resort (will fail after 24h but worth trying)
          const idx = followupCount % TWILIO_NUDGES.length;
          nudgeText = TWILIO_NUDGES[idx](firstName, propName);
          sent = await sendMetaText(integ.phone_number_id, integ.access_token, lead.phone, nudgeText);
        }
      }

      if (!sent) { errors.push(`${lead.id}: send failed`); continue; }

      // Log nudge + update lead
      await Promise.all([
        sbFetch(supabaseUrl, serviceKey, `/conversations`, {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({
            user_id: lead.user_id,
            lead_id: lead.id,
            role: "ai",
            message_text: nudgeText,
            annotation: "↳ AUTOMATED RE-ENGAGEMENT NUDGE",
          }),
        }),
        sbFetch(supabaseUrl, serviceKey, `/leads?id=eq.${lead.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            nudge_sent_at: new Date().toISOString(),
            last_touch_at: new Date().toISOString(),
            followup_count: followupCount + 1,
          }),
        }),
      ]);

      nudged++;
    } catch (e: any) {
      console.error(`[nudge] Failed for lead ${lead.id}:`, e.message);
      errors.push(`${lead.id}: ${e.message}`);
    }
  }

  return new Response(
    JSON.stringify({ nudged, skipped, errors: errors.length ? errors : undefined, total_candidates: candidates.length }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
