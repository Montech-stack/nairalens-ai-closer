export const config = { runtime: "edge" };

// ─────────────────────────────────────────────────────────────────
// PERSONAS
// ─────────────────────────────────────────────────────────────────
const PERSONAS: Record<string, string> = {
  apex_closer: `You are ARIA — the AI sales advisor for this real estate company. You are trained in the world's most effective sales methodologies: SPIN Selling (Neil Rackham), Straight Line Persuasion (Jordan Belfort), the Sandler Pain Funnel, and Cialdini's six principles of influence.

You are NOT a listing bot. You are the buyer's most trusted advisor — someone who listens first, understands deeply, then guides them to the right decision. You close deals by earning trust, not by pitching.

YOUR CHARACTER:
- Warm, sharp, never desperate. You sound like a brilliant friend who knows the market and genuinely wants this buyer to win.
- You match the lead's energy: Pidgin for casual leads, professional English for executives, gentle patience for first-timers.
- You ask ONE question at a time. You never overwhelm.
- You NEVER reveal price before you understand what the buyer needs and what they can spend. Revealing price too early is the #1 deal killer.
- You NEVER ignore a positive signal. If the lead says "yes", "sure", "interested", "okay", "I like that", "tell me more", or any affirmative — you ADVANCE. You do not ask another qualifying question. You move to the next stage immediately.`,

  diaspora_whisperer: `You are ARIA — the trusted real estate advisor for Nigerians in the diaspora. You know they have likely been burned before — by dubious titles, ghost developers, FX volatility, and the difficulty of managing a remote purchase. Your job is to earn their trust with facts, dissolve their fears proactively, then make every step toward purchase feel safe and frictionless.

YOUR APPROACH:
  1. Understand their goal and concern first — do not pitch immediately.
  2. Address their fears before they ask: title integrity, remote purchase process, FX risk, developer credibility, exit strategy.
  3. Lead with hard data: appreciation percentages, rental yield, title type, comparable sales.
  4. Make next steps frictionless: "I can send the title document and survey right now so you can verify from wherever you are."
  5. Close by making inaction feel riskier than action — never use pressure.
  6. NEVER ignore a "yes" or positive signal. Advance immediately when they show interest.`,

  hni_concierge: `You are ARIA — the private acquisition advisor for ultra-high-net-worth buyers. They have seen every sales approach. The moment you pitch, you've lost them.

YOUR APPROACH:
  - Peer-to-peer always. You advise, you don't sell.
  - Two questions max to understand their thesis before presenting anything.
  - Present as curation, not listing: "We have two off-market assets that match this profile. May I share a brief?"
  - Close toward a private viewing or call, not a payment discussion over WhatsApp.
  - Never negotiate pricing over chat.
  - NEVER ignore a "yes" or any signal of interest. Move forward immediately.`,
};

// ─────────────────────────────────────────────────────────────────
// CORE SALES FRAMEWORK
// ─────────────────────────────────────────────────────────────────
const SALES_FRAMEWORK = `
## CONVERSATION STAGES

### STAGE 1 — FIRST CONTACT
Triggered when: history is empty or lead just said hello/hi.
Actions:
  1. Welcome them warmly using the company name.
  2. One sentence on what you help buyers achieve.
  3. Ask ONE question about purpose: "Are you looking for a personal home, an investment to hold or flip, or land to develop?"
  Do NOT mention any property name or price yet.

### STAGE 2 — QUALIFY
Triggered when: you know their purpose but not budget and timeline.
Ask SPIN questions ONE at a time — never stack them:
  - Situation: "Have you been searching a while, or just starting?"
  - Problem: "What's made it hard to find the right property so far?"
  - Budget: "To match you to the right opportunity, what range are you working with?" If vague: "Are we talking ₦5M–₦50M, or higher?"
  - Timeline: "When are you hoping to move on this?"
  Stop asking questions the moment you have purpose + budget. Move to Stage 3.

### STAGE 3 — PRESENT
Triggered when: you know purpose AND budget, OR the lead has said yes/interested/tell me more to something you've mentioned.
Actions:
  - Present ONE property from the inventory that best fits their stated needs and budget.
  - Reference their exact words: "Since you said you want high returns and your budget is ₦10M, [Property X] is exactly built for that — here's why..."
  - Frame price with context: ROI, appreciation corridor, cost of waiting.
  - End with: "Does this feel like the right fit, or would you like to see the next option?"
  - If no inventory is available: collect their details for when stock opens.

### STAGE 4 — CLOSE
Triggered when: lead expressed interest in a specific property, said yes to a presentation, or asked how to proceed.
Actions:
  - Trial close: "Based on what you've told me, does this feel right for you?"
  - If YES → "Perfect. Let's get you in to see it. Which works — [Day] at [Time] or [Day] at [Time]?" Always give exactly 2 options.
  - If hesitation → surface the real objection with: "Just so I can help better — is it the price, the location, or the timing giving you pause?" Then handle it and close again.
  - Never end a message without a clear next step.

## ⚡ SIGNAL OVERRIDE RULE — HIGHEST PRIORITY
This rule overrides everything else.

When the lead says ANY of the following — "yes", "okay", "sure", "I like that", "sounds good", "tell me more", "I'm interested", "that works", "go ahead", "let's do it" — or any affirmative response to something you've presented:

→ DO NOT ask another qualifying question.
→ DO NOT reopen pain discovery.
→ ADVANCE IMMEDIATELY to the next stage.
→ If you're in Stage 2: jump to Stage 3 and present the best matching property now.
→ If you're in Stage 3: jump to Stage 4 and close toward a site visit or deposit.

Ignoring a "yes" is the single biggest sales mistake an AI can make. It kills momentum and destroys trust.

## OBJECTION HANDLING
"I'll think about it" → "Totally fair. Just so I understand — is it the price, the location, or the timing giving you pause?"
"Too expensive" → Use the PRICE OBJECTION SCRIPT if provided. If not: "I hear you. Let me show you the investment angle — buyers who got in six months ago in this corridor are already up. Would it help to see the numbers?"
"Need to see it first" → "Absolutely — that's the right call. I can book you in for Thursday or Saturday morning. Which works?"
"Need to ask my partner" → "Smart move. What matters most to them? I'll make sure you have exactly what they need to feel confident."
"Seeing other options" → "Good — comparing is smart. What are you comparing this to? I'll tell you exactly how it stacks up."

## PSYCHOLOGICAL TOOLS (use naturally, never mechanically)
- Loss aversion: "Every month you wait, this corridor appreciates — the delay costs more than the deposit."
- Social proof: "We've had strong uptake in this location. Buyers who got in early are already seeing gains."
- Scarcity (ONLY when true): "There are two other buyers currently evaluating this plot."
- Urgency (ONLY when true): "This price holds for 48 hours — after that it reverts to market rate."

## ABSOLUTE RULES
1. ONE question per message. Never stack two questions.
2. Never repeat a question already answered in the history.
3. Never invent property names, prices, locations, or titles — use only what's in the inventory.
4. Never apologize for price. Frame it with context instead.
5. Never be generic. Always reference what the lead told you.
6. Keep replies to 2-4 sentences unless presenting a property.
7. Match the lead's energy and language throughout.
8. NEVER use filler openers: "Certainly!", "Absolutely!", "Great question!", "Of course!"
9. If a lead gives a one-word answer, don't over-celebrate it — acknowledge briefly and advance.
10. A "yes" always means: stop qualifying, start presenting or closing.
`;

// ─────────────────────────────────────────────────────────────────
// SIGNAL DETECTOR — reads the latest message for buying signals
// ─────────────────────────────────────────────────────────────────
function detectBuyingSignal(msg: string): "strong_yes" | "interest" | "objection" | "neutral" {
  const lower = msg.toLowerCase().trim();

  const strongYes = [
    "yes", "yeah", "yep", "yh", "sure", "okay", "ok", "alright",
    "let's do it", "let's go", "go ahead", "sounds good", "that works",
    "i'm in", "im in", "i want it", "i'll take it", "book me",
    "send details", "tell me more", "i'm interested", "im interested",
    "interested", "i like that", "perfect", "great", "proceed",
  ];

  const interestSignals = [
    "how much", "what's the price", "price", "when can i see",
    "site visit", "inspection", "deposit", "payment plan",
    "how do i pay", "send account", "reserve", "reservation",
    "what's included", "location", "title", "document",
  ];

  const objectionSignals = [
    "expensive", "too much", "can't afford", "think about",
    "not sure", "maybe", "later", "partner", "spouse", "wife", "husband",
  ];

  if (strongYes.some((s) => lower === s || lower.startsWith(s + " ") || lower.endsWith(" " + s))) {
    return "strong_yes";
  }
  if (interestSignals.some((s) => lower.includes(s))) return "interest";
  if (objectionSignals.some((s) => lower.includes(s))) return "objection";
  return "neutral";
}

// ─────────────────────────────────────────────────────────────────
// STAGE DETECTOR — reads history length + last signal
// ─────────────────────────────────────────────────────────────────
function detectStage(
  history: { role: string; message_text: string }[],
  latestSignal: ReturnType<typeof detectBuyingSignal>
): string {
  const msgCount = history.length;

  if (msgCount === 0) {
    return "STAGE 1 — FIRST CONTACT: Welcome the lead warmly. Ask about their purpose only. Do NOT mention any property or price.";
  }

  // Check if we've already collected budget from history
  const fullText = history.map((h) => h.message_text).join(" ").toLowerCase();
  const hasBudget = /₦|naira|million|budget|range|[0-9]+m\b|[0-9]+k\b/.test(fullText);
  const hasPurpose = /home|invest|flip|develop|land|apartment|house/.test(fullText);

  // Signal override — highest priority
  if (latestSignal === "strong_yes") {
    if (hasBudget) {
      return `STAGE 4 — CLOSE: The lead just said YES. They have already given you their budget and intent. Do NOT ask any more questions. Present the single best matching property from inventory right now, then ask for a site visit. Use 2 specific day/time options.`;
    }
    return `STAGE 3 — PRESENT: The lead just said YES to something you mentioned. Stop qualifying. Present the best matching property from inventory now. If you don't have enough budget info, ask ONLY for budget — nothing else.`;
  }

  if (latestSignal === "interest") {
    return `STAGE 3/4 — ADVANCING: The lead is showing buying intent. If you have budget + purpose, present the best matching property. If not, ask only for the missing piece (budget or purpose), then present immediately.`;
  }

  if (!hasPurpose) {
    return "STAGE 1 — QUALIFY PURPOSE: You don't know their intent yet. Ask what they're looking for: personal home, investment, or land to flip/develop.";
  }

  if (!hasBudget) {
    return "STAGE 2 — QUALIFY BUDGET: You know their purpose. Now ask for their budget range. Keep it warm and direct.";
  }

  if (msgCount >= 8) {
    return "STAGE 4 — CLOSE: You have enough information. Stop qualifying. Move toward site visit or deposit. Give exactly 2 day/time options for viewing.";
  }

  return "STAGE 3 — PRESENT: You have purpose and budget. Present one property from inventory that fits. Reference their exact words.";
}

// ─────────────────────────────────────────────────────────────────
// INTENT SCORE CALCULATOR
// ─────────────────────────────────────────────────────────────────
function calculateIntentScore(
  history: { role: string; message_text: string }[],
  latestMsg: string
): number {
  const allText = [...history.map((m) => m.message_text), latestMsg].join(" ").toLowerCase();
  let score = 50;

  const high = ["ready", "reserve", "deposit", "book", "site visit", "inspection", "how do i pay", "send account", "i want", "let's proceed", "go ahead"];
  const mid = ["budget", "afford", "interested", "considering", "price", "location", "tell me more", "yes", "okay", "sure"];
  const low = ["maybe", "not sure", "just browsing", "not ready", "later", "thinking about it"];
  const negative = ["lose money", "lost money", "losing money", "too expensive", "can't afford"];

  high.forEach((s) => { if (allText.includes(s)) score += 12; });
  mid.forEach((s) => { if (allText.includes(s)) score += 6; });
  low.forEach((s) => { if (allText.includes(s)) score -= 8; });

  // Penalise loops
  const loopCount = negative.reduce((acc, phrase) => acc + (allText.split(phrase).length - 1), 0);
  if (loopCount > 2) score -= 12;

  return Math.min(100, Math.max(0, score));
}

// ─────────────────────────────────────────────────────────────────
// SYSTEM PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────
function buildSystemPrompt(opts: {
  persona: string;
  companyName: string;
  language: string;
  stageInstruction: string;
  properties: { name: string; location: string; size_sqm: number | null; price: number | null; title_type: string }[];
  marketTags: string[];
  triggers?: string;
  cta?: string;
  priceObj?: string;
}): string {
  const langMap: Record<string, string> = {
    english_ng: "clear Nigerian English",
    pidgin: "Nigerian Pidgin English",
    yoruba: "Yoruba mixed with English",
    hausa: "Hausa mixed with English",
  };

  const inventoryBlock = opts.properties.length
    ? `YOUR LIVE PROPERTY INVENTORY — present ONLY from this list, never invent others:\n` +
      opts.properties
        .map((p) =>
          `• ${p.name}${p.location ? `, ${p.location}` : ""}` +
          `${p.size_sqm ? ` — ${p.size_sqm} sqm` : ""}` +
          `${p.price ? `, ₦${Number(p.price).toLocaleString()}` : " — price on request"}` +
          ` | Title: ${p.title_type}`
        )
        .join("\n")
    : `NO INVENTORY LOADED: Do not mention or invent any specific property names, prices, or locations. Stay in STAGE 1 or STAGE 2. Collect the lead's needs so you can match them when inventory is available.`;

  return [
    PERSONAS[opts.persona] ?? PERSONAS.apex_closer,
    SALES_FRAMEWORK,
    `## ACTIVE CONTEXT`,
    `Company you represent: ${opts.companyName}`,
    `Language: Reply in ${langMap[opts.language] ?? "clear Nigerian English"}`,
    `Current stage instruction: ${opts.stageInstruction}`,
    inventoryBlock,
    opts.marketTags.length
      ? `MARKET INTELLIGENCE (weave naturally as evidence — never quote verbatim):\n${opts.marketTags.join("\n")}`
      : "",
    opts.priceObj
      ? `PRICE OBJECTION SCRIPT (use when lead pushes back on price): ${opts.priceObj}`
      : "",
    opts.cta
      ? `SITE VISIT CTA (use when closing): ${opts.cta}`
      : "",
    opts.triggers
      ? `CLOSING TRIGGERS — if the lead says any of these, close immediately: ${opts.triggers}`
      : "",
    `## CONVERSATION HISTORY REMINDER
Before you write your reply, scan the full history above and confirm:
✓ What is their stated purpose?
✓ What budget have they given?
✓ What pain or concern have they expressed?
✓ Have they said yes or shown interest in anything?
✓ What stage are you in?
Your reply must build on what you already know. Never re-ask anything already answered.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

// ─────────────────────────────────────────────────────────────────
// PROVIDER CASCADE — Groq primary, Gemini fallback
// ─────────────────────────────────────────────────────────────────
interface ProviderConfig {
  name: string;
  url: string;
  key: string;
  model: string;
  maxTokens: number;
}

async function callLLM(provider: ProviderConfig, messages: any[]): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000); // 9s per provider

  try {
    const res = await fetch(provider.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${provider.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        max_tokens: provider.maxTokens,
        temperature: 0.72, // natural but consistent
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`${provider.name} HTTP ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error(`${provider.name}: empty response`);
    return reply;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateAIReply(opts: {
  geminiKey: string;
  groqKey?: string;
  model: string;
  persona: string;
  language: string;
  history: { role: string; message_text: string }[];
  userMsg: string;
  marketTags: string[];
  companyName: string;
  properties: { name: string; location: string; size_sqm: number | null; price: number | null; title_type: string }[];
  triggers?: string;
  cta?: string;
  priceObj?: string;
}): Promise<string> {

  // Detect signal and stage BEFORE building the prompt
  const signal = detectBuyingSignal(opts.userMsg);
  const stageInstruction = detectStage(opts.history, signal);

  const systemPrompt = buildSystemPrompt({
    persona: opts.persona,
    companyName: opts.companyName,
    language: opts.language,
    stageInstruction,
    properties: opts.properties,
    marketTags: opts.marketTags,
    triggers: opts.triggers,
    cta: opts.cta,
    priceObj: opts.priceObj,
  });

  // Build message array — last 20 messages for full context
  const messages = [
    { role: "system", content: systemPrompt },
    ...opts.history.slice(-20).map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.message_text,
    })),
    { role: "user", content: opts.userMsg },
  ];

  // Resolve model — strip provider prefix
  const rawModel = (opts.model || "llama-3.3-70b-versatile")
    .replace(/^google\//, "")
    .replace(/^groq\//, "");

  const isGroqModel =
    rawModel.includes("llama") ||
    rawModel.includes("mixtral") ||
    rawModel.includes("gemma") ||
    rawModel.includes("qwen");

  // Build provider cascade
  const providers: ProviderConfig[] = [];

  if (isGroqModel && opts.groqKey) {
    // Groq primary → Gemini fallback
    providers.push({
      name: "Groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: opts.groqKey,
      model: rawModel,
      maxTokens: 300,
    });
    providers.push({
      name: "Gemini",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      key: opts.geminiKey,
      model: "gemini-2.5-flash",
      maxTokens: 300,
    });
  } else {
    // Gemini primary → Groq Llama fallback → Groq Gemma last resort
    providers.push({
      name: "Gemini",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      key: opts.geminiKey,
      model: rawModel.includes("gemini") ? rawModel : "gemini-2.5-flash",
      maxTokens: 300,
    });
    if (opts.groqKey) {
      providers.push({
        name: "Groq/Llama",
        url: "https://api.groq.com/openai/v1/chat/completions",
        key: opts.groqKey,
        model: "llama-3.3-70b-versatile",
        maxTokens: 300,
      });
      providers.push({
        name: "Groq/Gemma",
        url: "https://api.groq.com/openai/v1/chat/completions",
        key: opts.groqKey,
        model: "gemma2-9b-it",
        maxTokens: 300,
      });
    }
  }

  // Try each provider in order
  for (const provider of providers) {
    try {
      console.log(`[ai-cascade] Trying: ${provider.name} — ${provider.model}`);
      const reply = await callLLM(provider, messages);
      console.log(`[ai-cascade] ✓ Success via ${provider.name}`);
      return reply;
    } catch (e: any) {
      console.warn(`[ai-cascade] ✗ ${provider.name} failed: ${e.message}`);
    }
  }

  // All providers exhausted — human-sounding fallback, rotates to avoid repetition
  const fallbacks = [
    "Bear with me one moment — I want to make sure I give you the right details. 🙏",
    "Just pulling something up for you, I'll be right back.",
    "One second — I want to confirm the latest info before I respond.",
    "Give me a moment, I want to make sure this is accurate for you.",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// ─────────────────────────────────────────────────────────────────
// TWILIO TWIML RESPONSE HELPER
// ─────────────────────────────────────────────────────────────────
function twiml(message: string): Response {
  const safe = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`,
    { status: 200, headers: { "Content-Type": "text/xml" } }
  );
}

// ─────────────────────────────────────────────────────────────────
// SUPABASE FETCH HELPER
// ─────────────────────────────────────────────────────────────────
async function sbFetch(
  supabaseUrl: string,
  serviceKey: string,
  path: string,
  opts: RequestInit = {}
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

// ─────────────────────────────────────────────────────────────────
// MAIN EDGE FUNCTION HANDLER
// ─────────────────────────────────────────────────────────────────
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const geminiKey = process.env.GEMINI_API_KEY!;
  const groqKey = process.env.GROQ_API_KEY;

  // ── Parse Twilio payload ──────────────────────
  let from = "", body = "", to = "", msgSid = "", profileName = "";
  try {
    const text = await request.text();
    const params = new URLSearchParams(text);
    from = (params.get("From") ?? "").replace("whatsapp:", "");
    body = (params.get("Body") ?? "").trim();
    to = (params.get("To") ?? "").replace("whatsapp:", "");
    msgSid = params.get("MessageSid") ?? "";
    profileName = params.get("ProfileName") ?? "";
  } catch {
    return twiml("Sorry, something went wrong processing your message.");
  }

  if (!from || !body) return new Response("", { status: 200 });

  console.log("[twilio-edge] from:", from, "to:", to, "body:", body.slice(0, 80));

  try {
    // ── Look up WhatsApp integration ──────────────
    const integRows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/whatsapp_integrations?business_phone=eq.${encodeURIComponent(to)}&limit=1`
    );
    const integ = Array.isArray(integRows) ? integRows[0] : null;

    console.log("[twilio-edge] integration:", integ ? `found (user: ${integ.user_id})` : "NOT FOUND");
    if (!integ) return twiml("This number is not configured. Please contact support.");

    // ── Load profile, market tags, and properties in parallel ──
    const [profileRows, tagRows, propertyRows] = await Promise.all([
      sbFetch(supabaseUrl, serviceKey, `/profiles?user_id=eq.${integ.user_id}&limit=1`),
      sbFetch(supabaseUrl, serviceKey, `/market_tags?user_id=eq.${integ.user_id}&select=tag_text&limit=10`),
      sbFetch(
        supabaseUrl,
        serviceKey,
        `/properties?user_id=eq.${integ.user_id}&status=eq.available&select=name,location,size_sqm,price,title_type&limit=10`
      ),
    ]);

    const profile = Array.isArray(profileRows) ? profileRows[0] : null;
    const marketTags = Array.isArray(tagRows) ? tagRows.map((t: any) => t.tag_text) : [];
    const properties = Array.isArray(propertyRows) ? propertyRows : [];

    // ── Find or create lead ──────────────────────
    const leadRows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/leads?user_id=eq.${integ.user_id}&phone=eq.${encodeURIComponent(from)}&limit=1`
    );
    let lead = Array.isArray(leadRows) ? leadRows[0] : null;

    if (!lead) {
      const created = await sbFetch(supabaseUrl, serviceKey, `/leads`, {
        method: "POST",
        body: JSON.stringify({
          user_id: integ.user_id,
          name: profileName || `WA ${from.slice(-4)}`,
          phone: from,
          source: "WhatsApp",
          stage: "warm",
          intent_score: 50,
          last_touch_at: new Date().toISOString(),
        }),
      });
      lead = Array.isArray(created) ? created[0] : created;
    } else if (profileName && lead.name?.startsWith("WA ")) {
      // Update placeholder name with real WhatsApp name
      await sbFetch(supabaseUrl, serviceKey, `/leads?id=eq.${lead.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: profileName }),
      });
      lead.name = profileName;
    }

    if (!lead) return twiml("Unable to create your profile. Please try again.");

    // ── Record inbound message ───────────────────
    await sbFetch(supabaseUrl, serviceKey, `/conversations`, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        user_id: integ.user_id,
        lead_id: lead.id,
        role: "lead",
        message_text: body,
        wa_message_id: msgSid || null,
      }),
    });

    await sbFetch(supabaseUrl, serviceKey, `/leads?id=eq.${lead.id}`, {
      method: "PATCH",
      body: JSON.stringify({ last_touch_at: new Date().toISOString() }),
    });

    // ── Skip if agent has paused AI ──────────────
    if (lead.ai_paused) return new Response("", { status: 200 });

    // ── Pull conversation history (20 messages) ──
    const historyRows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/conversations?lead_id=eq.${lead.id}&select=role,message_text&order=created_at.asc&limit=20`
    );
    const history = Array.isArray(historyRows) ? historyRows : [];

    // ── Generate AI reply ────────────────────────
    const reply = await generateAIReply({
      geminiKey,
      groqKey,
      model: profile?.ai_model || "groq/llama-3.3-70b-versatile",
      persona: profile?.persona || "apex_closer",
      language: profile?.language || "english_ng",
      history,
      userMsg: body,
      marketTags,
      companyName: profile?.company_name || "our company",
      properties,
      triggers: profile?.closing_triggers ?? undefined,
      cta: profile?.site_visit_cta ?? undefined,
      priceObj: profile?.price_objection_response ?? undefined,
    });

    // ── Calculate and save updated intent score ──
    const newIntentScore = calculateIntentScore(history, body);
    await sbFetch(supabaseUrl, serviceKey, `/leads?id=eq.${lead.id}`, {
      method: "PATCH",
      body: JSON.stringify({ intent_score: newIntentScore }),
    });

    // ── Save AI reply to conversations ───────────
    await sbFetch(supabaseUrl, serviceKey, `/conversations`, {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        user_id: integ.user_id,
        lead_id: lead.id,
        role: "ai",
        message_text: reply,
        annotation: "↳ AI auto-reply (Twilio edge)",
      }),
    });

    // ── Mark integration as active ───────────────
    await sbFetch(supabaseUrl, serviceKey, `/whatsapp_integrations?id=eq.${integ.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        last_event_at: new Date().toISOString(),
        status: "connected",
      }),
    });

    return twiml(reply);

  } catch (e: any) {
    console.error("[twilio-edge] Unhandled error:", e?.message);
    // Human-sounding error — never expose technical details to buyer
    return twiml("Bear with me one moment — I'll confirm the details and get right back to you. 🙏");
  }
}