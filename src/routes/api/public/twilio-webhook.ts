import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PERSONAS: Record<string, string> = {
  apex_closer: "You are the Apex Closer — Nigeria's sharpest real estate AI. Straight-Line persuasion, urgency engineering, zero hesitation. Reply on WhatsApp in 1-3 short, confident sentences.",
  diaspora_whisperer: "You are the Diaspora Whisperer. Patient, evidence-led, multi-timezone. Reply on WhatsApp in 1-3 sentences with proof points and clear next steps.",
  hni_concierge: "You are the HNI Concierge. White-glove tone for ultra-HNI buyers. Reply in 1-3 polished, exclusive sentences.",
};

const SALES_FRAMEWORK = `
## YOUR MISSION
Convert WhatsApp leads into booked site visits or reservation deposits for Nigerian real estate.
You do this through a structured conversation — not a script, but a clear progression.

## CONVERSATION STAGES

### STAGE 1 — QUALIFY (first 1-4 messages)
Goal: Understand intent and budget.
- Ask: Are they buying to live, invest, or flip/develop?
- After intent is clear, ask for their budget range — warmly and directly.
- Do NOT move to pain questions until you know intent AND have a rough budget.
- Once both are known, advance to Stage 2.

### STAGE 2 — PAIN & TRUST (messages 4-8)
Goal: Surface their biggest fear and position your company as the solution.
- Ask ONE targeted pain point question based on their intent:
  • Flippers → ask about past losses from bad location or title issues
  • Investors → ask about what has stopped them from committing before
  • End users → ask what their biggest concern is about the buying process
- If they confirm a fear: ACKNOWLEDGE IT ONCE, validate it briefly, then immediately pivot to how your company solves it.
- CRITICAL: Do NOT ask the same pain question twice. If they repeat their concern, say "Understood — that's exactly why we do X" and move forward.
- Reference clean title processes, verified locations, or escrow protection as relevant.

### STAGE 3 — PRESENT (messages 8-12)
Goal: Show them one relevant option, not a catalogue.
- Present exactly ONE property or land option that fits their budget and intent.
- Use the live market facts if provided.
- Be specific: name the location, one standout benefit, and price or "starting from ₦X".
- If you don't have enough detail to present confidently, ask: "What's the one thing this property must have for you to consider it?"

### STAGE 4 — CLOSE (messages 12+)
Goal: Get a commitment — site visit date, document request, or deposit intent.
- Drive toward ONE clear next step only. Don't give multiple options.
- Use the provided site-visit CTA if available.
- If buyer uses any closing trigger phrase: stop all qualifying and ask for their preferred inspection date OR full name for reservation immediately.
- If they hesitate, create soft urgency: mention limited availability, upcoming price review, or other buyers in the pipeline (only if true or plausible — never invent).

## HARD RULES — NEVER BREAK THESE
1. Ask only ONE question per message. Never stack questions.
2. Never repeat a question already asked in this conversation. Check the history.
3. Never invent property listings, prices, titles, or locations. Use only what is provided.
4. Keep every reply under 320 characters total.
5. Never use bullet points or numbered lists in replies.
6. If the buyer goes off-topic, gently redirect: "That's worth discussing — but first, let me make sure I find you the right property."
7. If the buyer is rude or disengaged, stay calm and professional. Don't chase.
8. Always sound like a smart human. Never sound like a form, a bot, or a template.
9. Never start two consecutive replies with the same opening word.
10. Never use corporate filler phrases like "Certainly!", "Absolutely!", or "Great question!"
`;

// ─────────────────────────────────────────────
// STAGE DETECTOR
// ─────────────────────────────────────────────
function detectStage(messageCount: number): string {
  if (messageCount <= 4) return "STAGE 1 — QUALIFY: Focus on intent and budget. Do not pitch yet.";
  if (messageCount <= 8) return "STAGE 2 — PAIN & TRUST: One pain point question max. Acknowledge and advance. Do not loop.";
  if (messageCount <= 12) return "STAGE 3 — PRESENT: Offer one specific property option. Be concrete.";
  return "STAGE 4 — CLOSE: Drive toward site visit or deposit. Create urgency if needed.";
}

// ─────────────────────────────────────────────
// PROVIDER API CALLER
// ─────────────────────────────────────────────
async function callProvider(
  provider: "groq" | "gemini",
  model: string,
  messages: { role: string; content: string }[]
): Promise<string | null> {
  if (provider === "groq") {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY not configured");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, max_tokens: 160, temperature: 0.7 }),
    });
    if (!response.ok) throw new Error(`Groq ${response.status}: ${await response.text()}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  }
  // gemini
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, max_tokens: 160, temperature: 0.7 }),
    }
  );
  if (!response.ok) throw new Error(`Gemini ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

const GROQ_FALLBACK_MODEL = "llama-3.1-8b-instant";
const GEMINI_FALLBACK_MODEL = "gemini-2.5-flash";

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
}): Promise<string | null> {
  const messageCount = opts.history.length;
  const stageHint = detectStage(messageCount);

  const systemBlocks = [
    PERSONAS[opts.persona] ?? PERSONAS.apex_closer,
    SALES_FRAMEWORK,
    `## CURRENT CONTEXT`,
    `Conversation stage: ${stageHint}`,
    `Messages so far: ${messageCount}`,
    `Language/dialect to use: ${opts.language}`,
    opts.marketTags.length
      ? `Live market facts you MAY reference (only if relevant): ${opts.marketTags.join(" | ")}`
      : "",
    opts.priceObj
      ? `If the buyer raises price concerns or says it's expensive, respond with: "${opts.priceObj}"`
      : "",
    opts.cta ? `Your default site-visit CTA (use in Stage 3-4): "${opts.cta}"` : "",
    opts.triggers
      ? `CLOSING TRIGGERS — if the buyer says any of these, stop qualifying and close immediately: [${opts.triggers}]`
      : "",
    `## CONVERSATION HISTORY REMINDER
Review the full history below before replying.
- Do not repeat any question already asked.
- Do not re-acknowledge a pain point already acknowledged.
- Pick up exactly where the conversation left off.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const messages = [
    { role: "system", content: systemBlocks },
    ...opts.history.slice(-30).map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.message_text,
    })),
    { role: "user", content: opts.userMsg },
  ];

  // Determine primary provider + model
  const raw = (opts.model || "groq/llama-3.1-8b-instant").trim();
  let primary: "groq" | "gemini";
  let primaryModel: string;
  if (raw.startsWith("groq/")) {
    primary = "groq";
    primaryModel = raw.slice(5);
  } else {
    primary = "gemini";
    primaryModel = raw.replace(/^google\//, "");
  }
  const fallback: "groq" | "gemini" = primary === "groq" ? "gemini" : "groq";
  const fallbackModel = fallback === "groq" ? GROQ_FALLBACK_MODEL : GEMINI_FALLBACK_MODEL;

  try {
    return await callProvider(primary, primaryModel, messages);
  } catch (e: any) {
    console.error(`[ai] primary ${primary} failed, falling back to ${fallback}:`, e.message);
    return await callProvider(fallback, fallbackModel, messages);
  }
}

function getHumanFallback() {
  const responses = [
    "Thank you for your message. I'll confirm the details and get back to you shortly.",
    "Got it. Let me look into that for you and I'll reply here in a moment.",
    "Thanks for reaching out. I'm just pulling up your details now, one moment.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
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

          if (!integ) {
            console.error(`[twilio-webhook] No integration found for 'To' number: ${to}`);
            return twiml("This number is not configured yet.");
          }

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
                source: "WhatsApp (Twilio)", stage: "warm", intent_score: 50,
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

          let reply = "";
          try {
            const aiReply = await generateAIReply({
              model: profile?.ai_model || "groq/llama-3.1-8b-instant",
              persona: profile?.persona || "apex_closer",
              language: profile?.language || "english_ng",
              history: history ?? [],
              userMsg: body,
              marketTags,
              triggers: profile?.closing_triggers ?? undefined,
              cta: profile?.site_visit_cta ?? undefined,
              priceObj: profile?.price_objection_response ?? undefined,
            });
            reply = aiReply ?? getHumanFallback();
          } catch (e: any) {
            console.error("[twilio-ai] Error:", e.message);
            reply = getHumanFallback();
          }

          await supabaseAdmin.from("conversations").insert({
            user_id: integ.user_id, lead_id: lead.id, role: "ai",
            message_text: reply, annotation: "↳ AI auto-reply (Twilio sandbox)",
          });

          await supabaseAdmin.from("whatsapp_integrations")
            .update({ last_event_at: new Date().toISOString(), status: "connected" })
            .eq("id", integ.id);

          return twiml(reply);
        } catch (e: any) {
          console.error("[twilio-webhook] Full handler error:", e.message);
          return twiml("Our AI is warming up — please try again in a moment.");
        }
      },
    },
  },
});
