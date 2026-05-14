import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  sendWhatsAppTypingIndicator,
  formatButtonMessage,
  formatListMessage,
} from "@/integrations/twilio";

// ─────────────────────────────────────────────
// PERSONA BASE IDENTITIES
// ─────────────────────────────────────────────
const PERSONAS: Record<string, string> = {
  apex_closer: `You are ARIA — the Nairalens AI Sales Agent for a Nigerian real estate company.
Your personality: confident, warm, and direct. You speak like a sharp Lagos closer who genuinely respects the buyer's intelligence.
You communicate exclusively on WhatsApp. Keep ALL replies to 2-4 short sentences max. No bullet points. No long paragraphs. Sound human, never robotic.`,

  diaspora_whisperer: `You are ARIA — the Nairalens AI Sales Agent, specialized for Nigerian diaspora buyers.
Your personality: patient, evidence-led, and deeply reassuring. You understand buyers navigating time zones and trust gaps from the UK, US, and Canada.
You communicate on WhatsApp. Keep ALL replies to 2-4 short sentences max. Reference proof points and clear next steps when relevant.`,

  hni_concierge: `You are ARIA — the Nairalens AI Sales Agent for ultra-high-net-worth buyers.
Your personality: polished, exclusive, and unhurried. You speak like a private banker advising a client — never like a salesperson chasing a commission.
You communicate on WhatsApp. Keep ALL replies to 2-4 short sentences max. Every word should feel curated.`,
};

// ─────────────────────────────────────────────
// CORE SALES FRAMEWORK (injected into every call)
// ─────────────────────────────────────────────
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
  if (messageCount <= 8)
    return "STAGE 2 — PAIN & TRUST: One pain point question max. Acknowledge and advance. Do not loop.";
  if (messageCount <= 12)
    return "STAGE 3 — PRESENT: Offer one specific property option. Be concrete.";
  return "STAGE 4 — CLOSE: Drive toward site visit or deposit. Create urgency if needed.";
}

// ─────────────────────────────────────────────
// INTENT SCORE CALCULATOR
// ─────────────────────────────────────────────
function calculateIntentScore(
  history: { role: string; message_text: string }[],
  latestMessage: string,
): number {
  const allText = [...history.map((m) => m.message_text), latestMessage].join(" ").toLowerCase();

  let score = 50; // baseline

  // Strong buying signals → push score up
  const highSignals = [
    "ready to buy",
    "let's proceed",
    "how do i pay",
    "send account",
    "i want to reserve",
    "inspection",
    "site visit",
    "when can i see",
    "i'm interested",
    "send details",
    "send me the details",
    "what's the price",
    "deposit",
    "how much",
    "payment plan",
    "i'll take it",
  ];
  const midSignals = [
    "budget",
    "afford",
    "looking for",
    "i need",
    "my budget",
    "range",
    "considering",
    "thinking about",
    "exploring",
  ];
  const lowSignals = ["maybe", "not sure", "just browsing", "not ready", "later"];

  highSignals.forEach((s) => {
    if (allText.includes(s)) score += 15;
  });
  midSignals.forEach((s) => {
    if (allText.includes(s)) score += 7;
  });
  lowSignals.forEach((s) => {
    if (allText.includes(s)) score -= 10;
  });

  // Penalise for repeated "losing money" / fear loops (sign of disengagement)
  const loopPhrases = ["lose money", "lost money", "losing money"];
  const loopCount = loopPhrases.reduce((acc, phrase) => {
    return acc + (allText.split(phrase).length - 1);
  }, 0);
  if (loopCount > 3) score -= 15;

  return Math.min(100, Math.max(0, score));
}

// ─────────────────────────────────────────────
// MAIN AI REPLY GENERATOR
// ─────────────────────────────────────────────
async function callProvider(
  provider: "groq" | "gemini",
  model: string,
  messages: { role: string; content: string }[],
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
    },
  );
  if (!response.ok) throw new Error(`Gemini ${response.status}: ${await response.text()}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

const GROQ_FALLBACK_MODEL = "llama-3.3-70b-versatile";
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
  const raw = (opts.model || "groq/llama-3.3-70b-versatile").trim();
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

// ─────────────────────────────────────────────
// WHATSAPP SENDER
// ─────────────────────────────────────────────
async function sendWhatsApp(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  content: string | Record<string, unknown>,
) {
  console.log(`[wa-send] Attempting to send message to ${to.slice(0, -4)}**** via Graph API.`);

  const payload: Record<string, unknown> = {
    messaging_product: "whatsapp",
    to,
  };

  if (typeof content === "string") {
    payload.type = "text";
    payload.text = { body: content };
  } else {
    payload.type = "interactive";
    payload.interactive = content;
  }

  const r = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const errorBody = await r.text();
    console.error(`[wa-send] FAILED with status ${r.status}:`, errorBody);
    throw new Error(`WhatsApp API Error: ${r.status} - ${errorBody}`);
  } else {
    console.log("[wa-send] Successfully sent message.");
  }
}

// ─────────────────────────────────────────────
// HUMAN-SOUNDING FALLBACK REPLIES
// Rotates so the same message doesn't repeat
// ─────────────────────────────────────────────
const FALLBACK_REPLIES = [
  "Bear with me one moment — I want to make sure I give you the right info. 🙏",
  "Just pulling something up for you — I'll be right back.",
  "One second, I'm getting the latest details on that for you.",
  "Give me just a moment — I want to make sure this is accurate before I respond.",
];
let fallbackIndex = 0;
function getHumanFallback(): string {
  const reply = FALLBACK_REPLIES[fallbackIndex % FALLBACK_REPLIES.length];
  fallbackIndex++;
  return reply;
}

// ─────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────
export const Route = createFileRoute("/api/public/whatsapp-webhook")({
  server: {
    handlers: {
      // ── Meta verification handshake ──────────
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");

        if (mode !== "subscribe" || !token) {
          return new Response("Bad request", { status: 400 });
        }

        const { data } = await supabaseAdmin
          .from("whatsapp_integrations")
          .select("user_id")
          .eq("verify_token", token)
          .maybeSingle();

        if (!data) return new Response("Forbidden", { status: 403 });
        return new Response(challenge ?? "", { status: 200 });
      },

      // ── Inbound message handler ──────────────
      POST: async ({ request }) => {
        let payload: any;
        try {
          payload = await request.json();
        } catch {
          return new Response("ok"); // malformed body — always 200 to Meta
        }

        try {
          const entries = payload?.entry ?? [];

          for (const entry of entries) {
            for (const change of entry.changes ?? []) {
              const value = change.value ?? {};
              const phoneNumberId = value.metadata?.phone_number_id;
              const messages = value.messages ?? [];

              console.log(
                "[wa-webhook] phone_number_id:",
                phoneNumberId,
                "messages:",
                messages.length,
              );

              if (!phoneNumberId || messages.length === 0) continue;

              // ── Look up WhatsApp integration ──
              const { data: integ, error: integErr } = await supabaseAdmin
                .from("whatsapp_integrations")
                .select("*")
                .eq("phone_number_id", phoneNumberId)
                .maybeSingle();

              console.log(
                "[wa-webhook] integration:",
                integ ? `found (user: ${integ.user_id})` : "NOT FOUND",
                integErr?.message ?? "",
              );
              if (!integ) continue;

              // ── Load agent profile & market tags ──
              const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("*")
                .eq("user_id", integ.user_id)
                .maybeSingle();

              const { data: tagRows } = await supabaseAdmin
                .from("market_tags")
                .select("tag_text")
                .eq("user_id", integ.user_id)
                .limit(10);

              const marketTags = (tagRows ?? []).map((t: any) => t.tag_text);

              // ── Process each inbound message ──
              for (const msg of messages) {
                const fromPhone = msg.from as string;
                const waMsgId = msg.id as string;
                let text = "";

                if (msg.type === "text") {
                  text = (msg.text?.body as string)?.trim();
                } else if (msg.type === "interactive") {
                  const interactive = msg.interactive;
                  if (interactive.type === "button_reply") {
                    text = interactive.button_reply.title;
                  } else if (interactive.type === "list_reply") {
                    text = interactive.list_reply.title;
                  }
                }

                if (!text) continue;

                // ── Find or create lead ──
                let { data: lead } = await supabaseAdmin
                  .from("leads")
                  .select("*")
                  .eq("user_id", integ.user_id)
                  .eq("phone", fromPhone)
                  .maybeSingle();

                if (!lead) {
                  const contactName =
                    value.contacts?.[0]?.profile?.name || `WA ${fromPhone.slice(-4)}`;

                  const { data: created } = await supabaseAdmin
                    .from("leads")
                    .insert({
                      user_id: integ.user_id,
                      name: contactName,
                      phone: fromPhone,
                      source: "WhatsApp",
                      stage: "warm",
                      intent_score: 50,
                      last_touch_at: new Date().toISOString(),
                    })
                    .select()
                    .single();

                  lead = created;
                }
                if (!lead) continue;

                // ── Dedupe: skip already-processed message IDs ──
                const { error: insErr } = await supabaseAdmin.from("conversations").insert({
                  user_id: integ.user_id,
                  lead_id: lead.id,
                  role: "lead",
                  message_text: text,
                  wa_message_id: waMsgId,
                });

                if (insErr?.code === "23505") continue; // duplicate — skip

                // ── Send typing indicator ──
                if (integ.access_token && integ.phone_number_id) {
                  await sendWhatsAppTypingIndicator(
                    integ.access_token,
                    integ.phone_number_id,
                    fromPhone,
                  );
                }

                // ── Update lead last touch ──
                await supabaseAdmin
                  .from("leads")
                  .update({ last_touch_at: new Date().toISOString() })
                  .eq("id", lead.id);

                // ── Skip if agent has paused AI for this lead ──
                if (lead.ai_paused) continue;

                // ── Pull full conversation history (up to 30 messages) ──
                const { data: history } = await supabaseAdmin
                  .from("conversations")
                  .select("role, message_text")
                  .eq("lead_id", lead.id)
                  .order("created_at", { ascending: true })
                  .limit(30);

                const conversationHistory = history ?? [];

                // ── Generate AI reply ──
                let reply = "";
                try {
                  const aiReply = await generateAIReply({
                    model: profile?.ai_model || "google/gemini-2.5-flash",
                    persona: profile?.persona || "apex_closer",
                    language: profile?.language || "english_ng",
                    history: conversationHistory,
                    userMsg: text,
                    marketTags,
                    triggers: profile?.closing_triggers ?? undefined,
                    cta: profile?.site_visit_cta ?? undefined,
                    priceObj: profile?.price_objection_response ?? undefined,
                  });

                  reply = aiReply ?? getHumanFallback();
                } catch (e: any) {
                  console.error("[wa-ai] Error:", e.message);
                  reply = getHumanFallback(); // never silence the buyer
                }

                // ── Send reply via WhatsApp Cloud API ──
                if (integ.access_token && integ.phone_number_id) {
                  await sendWhatsApp(integ.phone_number_id, integ.access_token, fromPhone, reply);
                }

                // ── Log AI reply to conversations ──
                await supabaseAdmin.from("conversations").insert({
                  user_id: integ.user_id,
                  lead_id: lead.id,
                  role: "ai",
                  message_text: reply,
                  annotation: "↳ AI auto-reply (WhatsApp Cloud API)",
                });

                // ── Update intent score based on conversation signals ──
                const newIntentScore = calculateIntentScore(conversationHistory, text);
                await supabaseAdmin
                  .from("leads")
                  .update({ intent_score: newIntentScore })
                  .eq("id", lead.id);
              }

              // ── Mark integration as active ──
              await supabaseAdmin
                .from("whatsapp_integrations")
                .update({
                  last_event_at: new Date().toISOString(),
                  status: "connected",
                })
                .eq("id", integ.id);
            }
          }
        } catch (e: any) {
          console.error("[wa-webhook] Unhandled error:", e?.message);
        }

        // Always return 200 — prevents Meta retry storms
        return new Response("ok", { status: 200 });
      },
    },
  },
});
