import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PERSONAS: Record<string, string> = {
  apex_closer: "You are the Apex Closer — Nigeria's sharpest real estate AI. Straight-Line persuasion, urgency engineering, zero hesitation. Reply on WhatsApp in 1-3 short, confident sentences.",
  diaspora_whisperer: "You are the Diaspora Whisperer. Patient, evidence-led, multi-timezone. Reply on WhatsApp in 1-3 sentences with proof points and clear next steps.",
  hni_concierge: "You are the HNI Concierge. White-glove tone for ultra-HNI buyers. Reply in 1-3 polished, exclusive sentences.",
};

async function generateAIReply(opts: {
  model: string;
  persona: string;
  language: string;
  history: { role: string; message_text: string }[];
  userMsg: string;
  marketTags: string[];
  triggers?: string;
  cta?: string;
  priceObj?: string;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const sys = [
    PERSONAS[opts.persona] ?? PERSONAS.apex_closer,
    `Language: ${opts.language}.`,
    opts.marketTags.length ? `Live market facts: ${opts.marketTags.join(" | ")}.` : "",
    opts.priceObj ? `When buyer raises price: ${opts.priceObj}` : "",
    opts.cta ? `Default site-visit CTA: ${opts.cta}` : "",
    opts.triggers ? `If buyer says any of [${opts.triggers}], close immediately.` : "",
    "Never invent listings, prices, or titles. Keep replies under 320 chars.",
  ].filter(Boolean).join("\n");

  const model = (opts.model || "gemini-2.5-flash").replace(/^google\//, "");

  const messages = [
    { role: "system", content: sys },
    ...opts.history.slice(-10).map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.message_text })),
    { role: "user", content: opts.userMsg },
  ];

  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages }),
  });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return data.choices?.[0]?.message?.content?.trim() || "Got it — let me confirm and come back to you shortly.";
}

function twiml(message: string) {
  const safe = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`,
    { status: 200, headers: { "Content-Type": "text/xml" } }
  );
}

export const Route = createFileRoute("/api/public/twilio-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let from = "", body = "", to = "", msgSid = "";
        try {
          const text = await request.text();
          const params = new URLSearchParams(text);
          from = (params.get("From") ?? "").replace("whatsapp:", "");
          body = params.get("Body") ?? "";
          to = (params.get("To") ?? "").replace("whatsapp:", "");
          msgSid = params.get("MessageSid") ?? "";
        } catch {
          return twiml("Sorry, something went wrong.");
        }

        if (!from || !body) return new Response("", { status: 200 });

        try {
          // Look up integration by Twilio sandbox number (stored as business_phone)
          const { data: integ } = await supabaseAdmin
            .from("whatsapp_integrations")
            .select("*")
            .eq("business_phone", to)
            .maybeSingle();

          console.log("[twilio] from:", from, "to:", to, "integ:", integ ? integ.user_id : "NOT FOUND");

          if (!integ) return twiml("This number is not configured yet.");

          const { data: profile } = await supabaseAdmin
            .from("profiles").select("*").eq("user_id", integ.user_id).maybeSingle();
          const { data: tagRows } = await supabaseAdmin
            .from("market_tags").select("tag_text").eq("user_id", integ.user_id).limit(10);
          const marketTags = (tagRows ?? []).map((t: any) => t.tag_text);

          // Find or create lead
          let { data: lead } = await supabaseAdmin
            .from("leads").select("*")
            .eq("user_id", integ.user_id).eq("phone", from).maybeSingle();
          if (!lead) {
            const { data: created } = await supabaseAdmin
              .from("leads").insert({
                user_id: integ.user_id, name: `WA ${from.slice(-4)}`, phone: from,
                source: "WhatsApp", stage: "warm", intent_score: 50,
                last_touch_at: new Date().toISOString(),
              }).select().single();
            lead = created;
          }
          if (!lead) return twiml("Unable to create lead record.");

          // Dedupe
          const { error: insErr } = await supabaseAdmin
            .from("conversations").insert({
              user_id: integ.user_id, lead_id: lead.id, role: "lead",
              message_text: body, wa_message_id: msgSid || null,
            });
          if (insErr?.code === "23505") return new Response("", { status: 200 });

          await supabaseAdmin.from("leads").update({ last_touch_at: new Date().toISOString() }).eq("id", lead.id);

          if (lead.ai_paused) return new Response("", { status: 200 });

          // Conversation history
          const { data: history } = await supabaseAdmin
            .from("conversations").select("role,message_text")
            .eq("lead_id", lead.id).order("created_at", { ascending: true }).limit(20);

          const reply = await generateAIReply({
            model: profile?.ai_model || "gemini-2.5-flash",
            persona: profile?.persona || "apex_closer",
            language: profile?.language || "english_ng",
            history: history ?? [],
            userMsg: body,
            marketTags,
            triggers: profile?.closing_triggers ?? undefined,
            cta: profile?.site_visit_cta ?? undefined,
            priceObj: profile?.price_objection_response ?? undefined,
          });

          await supabaseAdmin.from("conversations").insert({
            user_id: integ.user_id, lead_id: lead.id, role: "ai",
            message_text: reply, annotation: "↳ AI auto-reply (Twilio sandbox)",
          });

          await supabaseAdmin.from("whatsapp_integrations")
            .update({ last_event_at: new Date().toISOString(), status: "connected" })
            .eq("id", integ.id);

          return twiml(reply);
        } catch (e: any) {
          console.error("[twilio-webhook]", e?.message);
          return twiml("Our AI is warming up — please try again in a moment.");
        }
      },
    },
  },
});
