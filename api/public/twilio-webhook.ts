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
- You NEVER reveal price before you understand what the buyer needs and what they can spend.
- You NEVER ignore a positive signal. If the lead says "yes", "sure", "interested", "okay", "I like that", "tell me more", or any affirmative — you ADVANCE immediately. No more qualifying questions.

CRITICAL INTELLIGENCE RULES:
- When a lead sends a bare number like "10", "50", "200" in response to a budget question — always interpret it as millions of Naira. Never ask them to clarify a number you already asked for.
- When a lead gives a time like "6months", "3 months", "asap", "soon" — that IS their timeline. Accept it. Never ask for it again.
- When you (the AI) have already confirmed something in a previous message (e.g. "You're working with a budget of ₦10M") — that fact is LOCKED. Never ask for it again under any circumstances.
- Reading your own previous messages counts as memory. If you said it, you know it.`,

  diaspora_whisperer: `You are ARIA — the trusted real estate advisor for Nigerians in the diaspora. You know they have likely been burned before — by dubious titles, ghost developers, FX volatility, and the difficulty of managing a remote purchase. Your job is to earn their trust with facts, dissolve their fears proactively, then make every step toward purchase feel safe and frictionless.

YOUR APPROACH:
  1. Understand their goal and concern first — do not pitch immediately.
  2. Address their fears before they ask: title integrity, remote purchase process, FX risk, developer credibility, exit strategy.
  3. Lead with hard data: appreciation percentages, rental yield, title type, comparable sales.
  4. Make next steps frictionless: "I can send the title document and survey right now so you can verify from wherever you are."
  5. Close by making inaction feel riskier than action — never use pressure.
  6. NEVER ignore a "yes" or positive signal. Advance immediately when they show interest.
  7. When a lead gives a number in response to a budget question, interpret it as millions of Naira. Never ask them to repeat themselves.`,

  hni_concierge: `You are ARIA — the private acquisition advisor for ultra-high-net-worth buyers. They have seen every sales approach. The moment you pitch, you've lost them.

YOUR APPROACH:
  - Peer-to-peer always. You advise, you don't sell.
  - Two questions max to understand their thesis before presenting anything.
  - Present as curation, not listing: "We have two off-market assets that match this profile. May I share a brief?"
  - Close toward a private viewing or call, not a payment discussion over WhatsApp.
  - Never negotiate pricing over chat.
  - NEVER ignore a "yes" or any signal of interest. Move forward immediately.
  - When a lead gives a number in a budget context, interpret it as millions of Naira. Never ask them to repeat themselves.`,
};

// ─────────────────────────────────────────────────────────────────
// CORE SALES FRAMEWORK
// ─────────────────────────────────────────────────────────────────
const SALES_FRAMEWORK = `
## CONVERSATION STAGES

### STAGE 1 — FIRST CONTACT
Triggered when: history is empty or lead just said hello/hi/good morning etc.
Actions:
  1. Welcome them warmly using the company name.
  2. One sentence on what you help buyers achieve.
  3. Ask ONE question about purpose: "Are you looking for a personal home, an investment to hold or flip, or land to develop?"
  Do NOT mention any property name or price.

### STAGE 2 — QUALIFY
Triggered when: you know their purpose but are still missing budget OR timeline.
Rules:
  - Ask for ONE missing piece at a time. Never stack questions.
  - If you don't know budget: ask for it warmly and directly.
  - If you have budget but not timeline: ask when they want to move.
  - STOP qualifying the moment you have purpose + budget. Move to Stage 3.
  - IMPORTANT: A bare number ("5", "10", "50", "200") in response to a budget question = that many millions of Naira. Accept it. Do not ask again.
  - IMPORTANT: Any time reference ("6months", "3 months", "asap", "next quarter") = their timeline. Accept it. Do not ask again.
  - IMPORTANT: If your own previous message already confirmed a fact, that fact is known. Do not re-ask it.

### STAGE 3 — PRESENT
Triggered when: purpose + budget are both known, OR the lead said yes/interested/tell me more.
Actions:
  - Present ONE property from inventory that best matches their needs and budget.
  - Always reference their exact words: "Since you said you want to flip within 6 months with ₦10M, [Property X] is built for exactly that — here's why..."
  - Frame price with context: ROI, appreciation, cost of waiting.
  - End with: "Does this feel like the right fit?"
  - If no inventory matches: "We have something coming up that fits this profile — let me get your details so you're first to know."

### STAGE 4 — CLOSE
Triggered when: lead expressed interest in a specific property, said yes to a presentation, or asked how to proceed.
Actions:
  - Trial close: "Based on what you've told me, does this feel right for you?"
  - If YES: "Perfect. Let's get you in to see it. Which works — Thursday at 10am or Saturday at 11am?" Always give exactly 2 specific options.
  - If hesitation: "Just so I can help better — is it the price, the location, or the timing giving you pause?" Then handle and close again.
  - Never end without a clear next step.

## SIGNAL OVERRIDE RULE — HIGHEST PRIORITY
When the lead sends ANY affirmative — "yes", "okay", "sure", "sounds good", "I like that",
"tell me more", "interested", "let's go", "go ahead", "that works" — or any positive
response to something you've presented:
  - STOP qualifying immediately.
  - ADVANCE to the next stage right now.
  - If in Stage 2 with budget known: jump to Stage 3, present the best matching property.
  - If in Stage 3: jump to Stage 4, close toward site visit with 2 specific time options.
Ignoring a "yes" destroys trust and kills the deal.

## OBJECTION HANDLING
"I'll think about it" -> "Totally fair. Is it the price, the location, or the timing giving you pause?"
"Too expensive" -> Use PRICE OBJECTION SCRIPT if provided. Otherwise: "I hear you. Buyers who got in this corridor 6 months ago are already up. Want me to show you the numbers?"
"Need to see it first" -> "Absolutely — right call. I can book you Thursday or Saturday morning. Which works?"
"Need to ask my partner" -> "Smart. What matters most to them? I'll make sure you have exactly what they need."
"Seeing other options" -> "Good — comparing is smart. What are you comparing it to? I'll tell you exactly how this stacks up."

## PSYCHOLOGICAL TOOLS (use naturally, never mechanically)
- Loss aversion: "Every month you wait, this corridor appreciates — the delay costs more than the deposit."
- Social proof: "We've had strong uptake here. Early buyers are already seeing gains."
- Scarcity (ONLY when true): "Two other buyers are currently evaluating this plot."
- Urgency (ONLY when true): "This price holds for 48 hours, then it reverts to market rate."

## ABSOLUTE RULES
1. ONE question per message. Never stack two questions.
2. Never re-ask anything already answered — including things confirmed in your own previous messages.
3. Never invent property names, prices, locations, or titles. Use only what is in the inventory.
4. Never apologize for price. Frame it with context instead.
5. Always reference what the lead told you — never be generic.
6. Keep replies to 2-4 sentences unless presenting a property.
7. Match the lead's energy and language throughout.
8. Never use filler openers: "Certainly!", "Absolutely!", "Great question!", "Of course!"
9. A bare number in a budget conversation = millions of Naira. Accept it and move on.
10. A "yes" always means: stop qualifying, start presenting or closing.
`;

// ─────────────────────────────────────────────────────────────────
// BUYING SIGNAL DETECTOR
// ─────────────────────────────────────────────────────────────────
function detectBuyingSignal(
  msg: string
): "strong_yes" | "interest" | "objection" | "neutral" {
  const lower = msg.toLowerCase().trim();

  const strongYes = [
    "yes", "yeah", "yep", "yh", "y", "sure", "okay", "ok", "k",
    "alright", "aight", "lets do it", "let's do it", "lets go", "let's go",
    "go ahead", "sounds good", "that works", "i'm in", "im in",
    "i want it", "i'll take it", "book me", "send details",
    "tell me more", "i'm interested", "im interested", "interested",
    "i like that", "perfect", "great", "proceed", "continue", "yes please",
  ];

  const interestSignals = [
    "how much", "what's the price", "price", "when can i see",
    "site visit", "inspection", "deposit", "payment plan",
    "how do i pay", "send account", "reserve", "reservation",
    "what's included", "show me", "send me", "more details",
    "which location", "where is", "title", "document", "c of o",
  ];

  const objectionSignals = [
    "expensive", "too much", "can't afford", "think about it",
    "not sure", "maybe", "later", "partner", "spouse",
    "wife", "husband", "let me check",
  ];

  if (
    strongYes.includes(lower) ||
    strongYes.some(
      (s) =>
        lower === s ||
        lower.startsWith(s + " ") ||
        lower.endsWith(" " + s)
    )
  ) {
    return "strong_yes";
  }

  if (interestSignals.some((s) => lower.includes(s))) return "interest";
  if (objectionSignals.some((s) => lower.includes(s))) return "objection";
  return "neutral";
}

// ─────────────────────────────────────────────────────────────────
// CONVERSATION KNOWLEDGE EXTRACTOR
// Reads the FULL history — both lead and AI messages — to determine
// what is already confirmed. Prevents the AI from re-asking.
// ─────────────────────────────────────────────────────────────────
interface ConversationKnowledge {
  hasPurpose: boolean;
  hasBudget: boolean;
  hasTimeline: boolean;
  budgetConfirmedByAI: boolean;
  timelineConfirmedByAI: boolean;
  purposeConfirmedByAI: boolean;
}

function extractKnowledge(
  history: { role: string; message_text: string }[],
  latestMsg: string
): ConversationKnowledge {
  const allText = [...history.map((h) => h.message_text), latestMsg]
    .join(" ")
    .toLowerCase();

  const aiMessages = history
    .filter((h) => h.role === "ai")
    .map((h) => h.message_text.toLowerCase())
    .join(" ");

  const leadMessages = history
    .filter((h) => h.role === "lead" || h.role === "user")
    .map((h) => h.message_text.toLowerCase())
    .join(" " + latestMsg.toLowerCase());

  // ── Budget detection ──────────────────────────────────────────
  const budgetRegexes = [
    /₦[\d,]+/,
    /\b\d+\s*m\b/i,
    /\b\d+\s*million/i,
    /\b(naira|budget|range)\b/,
    /\b(five|ten|fifteen|twenty|thirty|forty|fifty|hundred|two hundred)\s*(million)?\b/i,
  ];

  const aiAskedForBudget =
    /budget|range|working with|how much|what range/.test(aiMessages);
  const leadHasAnyNumber = /\b[1-9]\d{0,3}\b/.test(leadMessages);

  const hasBudgetInText = budgetRegexes.some((r) => r.test(allText));
  // If AI asked for budget AND lead replied with any number -> budget is known
  const hasBudget = hasBudgetInText || (aiAskedForBudget && leadHasAnyNumber);

  // If AI's own messages already acknowledged the budget -> it's confirmed
  const budgetConfirmedByAI =
    /budget of|working with|around ₦|you mentioned.*\d|looking at.*\d|invest.*₦|₦.*invest/.test(
      aiMessages
    );

  // ── Timeline detection ────────────────────────────────────────
  const timelineRegexes = [
    /\b\d+\s*(month|week|year|day)s?\b/i,
    /\b(asap|urgent|soon|now|immediately|quickly)\b/i,
    /\b(next|this)\s*(month|quarter|year|week)\b/i,
    /\b(q1|q2|q3|q4)\b/i,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
  ];

  const hasTimeline = timelineRegexes.some((r) => r.test(allText));
  const timelineConfirmedByAI =
    /within|months|weeks|your timeline|looking to move|hoping to|6.month|3.month/.test(
      aiMessages
    );

  // ── Purpose detection ─────────────────────────────────────────
  const purposeRegexes = [
    /\b(flip|flipping|resell|resale)\b/i,
    /\b(invest|investment|hold|rental|income|buy and hold)\b/i,
    /\b(personal|own use|live|home|house|apartment|self)\b/i,
    /\b(develop|development|build|construction)\b/i,
    /\b(land)\b/i,
  ];

  const hasPurpose = purposeRegexes.some((r) => r.test(allText));
  const purposeConfirmedByAI =
    /looking to flip|investment|personal home|develop|you want to|buy and flip|buy.*flip/.test(
      aiMessages
    );

  return {
    hasPurpose,
    hasBudget,
    hasTimeline,
    budgetConfirmedByAI,
    timelineConfirmedByAI,
    purposeConfirmedByAI,
  };
}

// ─────────────────────────────────────────────────────────────────
// STAGE DETECTOR
// Uses full conversation knowledge — not just message count
// ─────────────────────────────────────────────────────────────────
function detectStage(
  history: { role: string; message_text: string }[],
  latestMsg: string,
  signal: ReturnType<typeof detectBuyingSignal>
): string {
  const msgCount = history.length;
  const k = extractKnowledge(history, latestMsg);

  const budgetKnown = k.hasBudget || k.budgetConfirmedByAI;
  const timelineKnown = k.hasTimeline || k.timelineConfirmedByAI;
  const purposeKnown = k.hasPurpose || k.purposeConfirmedByAI;

  // First message ever
  if (msgCount === 0) {
    return `STAGE 1 — FIRST CONTACT: Welcome the lead warmly. Say what you help buyers achieve in one sentence. Ask ONE question only: are they looking for a personal home, investment, or land to develop/flip? Do not mention any property or price.`;
  }

  // ⚡ Signal override — runs before everything else
  if (signal === "strong_yes") {
    if (budgetKnown && purposeKnown) {
      return `STAGE 4 — CLOSE NOW: The lead just said YES and you already have their purpose and budget confirmed. Present the single best matching property from inventory RIGHT NOW, referencing their exact budget and goal. Then immediately ask for a site visit — give exactly 2 specific day/time options. Do not ask any more questions first.`;
    }
    if (purposeKnown) {
      return `STAGE 3 — ADVANCE: The lead said YES. You know their purpose. Ask ONLY for their budget in one warm question, then present a property immediately after they reply. Nothing else.`;
    }
    return `STAGE 2 — ENGAGE: The lead is engaged and positive. Ask only the single most important missing piece: what are they looking for (purpose)? Then move straight to budget.`;
  }

  if (signal === "interest") {
    if (budgetKnown && purposeKnown) {
      return `STAGE 3 — PRESENT: The lead is showing buying intent and you have their purpose and budget. Present the best matching property from inventory now. End with a site visit ask.`;
    }
    return `STAGE 2 — QUALIFY ONE THING: The lead is interested. Ask only the single most important missing piece (budget if unknown, otherwise purpose), then present.`;
  }

  // Normal qualification flow
  if (!purposeKnown) {
    return `STAGE 1 — GET PURPOSE: You don't know their intent yet. Ask what they're looking for: personal home, investment to hold or flip, or land to develop. ONE question only.`;
  }

  if (!budgetKnown) {
    return `STAGE 2 — GET BUDGET: You know their purpose. Ask for their budget range warmly and directly. CRITICAL: If they reply with any number (e.g. "10", "50", "200"), interpret it as millions of Naira immediately — do NOT ask for clarification. Accept it and move to Stage 3.`;
  }

  if (budgetKnown && purposeKnown && !timelineKnown && msgCount < 8) {
    return `STAGE 2 — GET TIMELINE: You have purpose and budget — great. Ask just one more thing: when are they hoping to move on this? Any time reference they give is their answer — accept it and proceed to Stage 3.`;
  }

  if (budgetKnown && purposeKnown) {
    return `STAGE 3 — PRESENT: You have everything you need. Present ONE property from inventory that best matches their budget and purpose. Reference their exact words and details. End with: "Does this feel like the right fit?"`;
  }

  if (msgCount >= 10) {
    return `STAGE 4 — CLOSE: This conversation is mature. Stop qualifying. You have enough information. Drive toward a site visit or deposit. Give exactly 2 specific day/time options.`;
  }

  return `STAGE 2 — QUALIFY: Continue gathering the one most important missing detail. Ask ONE question only.`;
}

// ─────────────────────────────────────────────────────────────────
// INTENT SCORE CALCULATOR
// ─────────────────────────────────────────────────────────────────
function calculateIntentScore(
  history: { role: string; message_text: string }[],
  latestMsg: string
): number {
  const allText = [...history.map((m) => m.message_text), latestMsg]
    .join(" ")
    .toLowerCase();

  let score = 50;

  const high = [
    "ready", "reserve", "deposit", "book", "site visit", "inspection",
    "how do i pay", "send account", "i want", "let's proceed",
    "go ahead", "i'll take", "yes", "okay", "sure",
  ];
  const mid = [
    "budget", "afford", "interested", "considering", "price",
    "location", "tell me more", "details", "how much",
  ];
  const low = ["maybe", "not sure", "just browsing", "not ready", "later"];
  const negative = [
    "lose money", "lost money", "losing money",
    "too expensive", "can't afford",
  ];

  high.forEach((s) => { if (allText.includes(s)) score += 12; });
  mid.forEach((s) => { if (allText.includes(s)) score += 6; });
  low.forEach((s) => { if (allText.includes(s)) score -= 8; });

  const loopCount = negative.reduce(
    (acc, phrase) => acc + (allText.split(phrase).length - 1),
    0
  );
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
  knowledge: ConversationKnowledge;
  properties: {
    name: string;
    location: string;
    size_sqm: number | null;
    price: number | null;
    title_type: string;
  }[];
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
        .map(
          (p) =>
            `- ${p.name}${p.location ? `, ${p.location}` : ""}` +
            `${p.size_sqm ? ` | ${p.size_sqm} sqm` : ""}` +
            `${p.price ? ` | Price: ₦${Number(p.price).toLocaleString()}` : " | Price: on request"}` +
            ` | Title: ${p.title_type}`
        )
        .join("\n")
    : `NO INVENTORY LOADED: Do not mention or invent any property names, prices, or locations. Stay in STAGE 1 or STAGE 2 only. Collect the lead's needs so you can match them when inventory is available.`;

  const budgetKnown = opts.knowledge.hasBudget || opts.knowledge.budgetConfirmedByAI;
  const timelineKnown = opts.knowledge.hasTimeline || opts.knowledge.timelineConfirmedByAI;
  const purposeKnown = opts.knowledge.hasPurpose || opts.knowledge.purposeConfirmedByAI;

  const knowledgeSummary = [
    `## WHAT YOU ALREADY KNOW — DO NOT RE-ASK THESE`,
    `Purpose/Intent: ${purposeKnown ? "YES — KNOWN. Do not ask." : "Unknown — ask first."}`,
    `Budget: ${budgetKnown ? "YES — KNOWN. Do not ask." : "Unknown — ask after purpose."}`,
    `Timeline: ${timelineKnown ? "YES — KNOWN. Do not ask." : "Unknown — ask after budget."}`,
    ``,
    `Any field marked KNOWN must NEVER be asked again in this conversation.`,
    `If your previous AI messages already confirmed a detail, it is locked as known.`,
  ].join("\n");

  return [
    PERSONAS[opts.persona] ?? PERSONAS.apex_closer,
    SALES_FRAMEWORK,
    `## ACTIVE SESSION CONTEXT`,
    `Company you represent: ${opts.companyName}`,
    `Language: Reply in ${langMap[opts.language] ?? "clear Nigerian English"}`,
    `Current stage instruction: ${opts.stageInstruction}`,
    knowledgeSummary,
    inventoryBlock,
    opts.marketTags.length
      ? `MARKET INTELLIGENCE (weave in naturally as supporting evidence — never quote verbatim):\n${opts.marketTags.join("\n")}`
      : "",
    opts.priceObj ? `PRICE OBJECTION SCRIPT: ${opts.priceObj}` : "",
    opts.cta ? `SITE VISIT CTA (use when closing): ${opts.cta}` : "",
    opts.triggers
      ? `CLOSING TRIGGERS — if lead says any of these, close immediately: ${opts.triggers}`
      : "",
    `## PRE-REPLY CHECKLIST (complete this mentally before writing your response)
1. What stage am I in? -> ${opts.stageInstruction.split(":")[0]}
2. Am I asking only ONE question — or zero if I am presenting or closing?
3. Am I about to re-ask something already confirmed? If yes -> DELETE that question.
4. Did the lead say yes or give a positive signal? If yes -> I must advance, not qualify.
5. Am I referencing their exact words and known details in my reply?`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

// ─────────────────────────────────────────────────────────────────
// LLM PROVIDER CALL — with timeout
// ─────────────────────────────────────────────────────────────────
interface ProviderConfig {
  name: string;
  url: string;
  key: string;
  model: string;
  maxTokens: number;
}

async function callLLM(
  provider: ProviderConfig,
  messages: { role: string; content: string }[]
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

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
        temperature: 0.72,
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

// ─────────────────────────────────────────────────────────────────
// MAIN AI REPLY GENERATOR — cascade across providers
// ─────────────────────────────────────────────────────────────────
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
  properties: {
    name: string;
    location: string;
    size_sqm: number | null;
    price: number | null;
    title_type: string;
  }[];
  triggers?: string;
  cta?: string;
  priceObj?: string;
}): Promise<string> {
  const signal = detectBuyingSignal(opts.userMsg);
  const stageInstruction = detectStage(opts.history, opts.userMsg, signal);
  const knowledge = extractKnowledge(opts.history, opts.userMsg);

  const systemPrompt = buildSystemPrompt({
    persona: opts.persona,
    companyName: opts.companyName,
    language: opts.language,
    stageInstruction,
    knowledge,
    properties: opts.properties,
    marketTags: opts.marketTags,
    triggers: opts.triggers,
    cta: opts.cta,
    priceObj: opts.priceObj,
  });

  const messages = [
    { role: "system", content: systemPrompt },
    ...opts.history.slice(-20).map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.message_text,
    })),
    { role: "user", content: opts.userMsg },
  ];

  const rawModel = (opts.model || "llama-3.3-70b-versatile")
    .replace(/^google\//, "")
    .replace(/^groq\//, "");

  const isGroqModel =
    rawModel.includes("llama") ||
    rawModel.includes("mixtral") ||
    rawModel.includes("gemma") ||
    rawModel.includes("qwen");

  const providers: ProviderConfig[] = [];

  if (isGroqModel && opts.groqKey) {
    providers.push({
      name: "Groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: opts.groqKey,
      model: rawModel,
      maxTokens: 300,
    });
    if (opts.geminiKey) {
      providers.push({
        name: "Gemini",
        url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        key: opts.geminiKey,
        model: "gemini-2.5-flash",
        maxTokens: 300,
      });
    }
  } else {
    if (opts.geminiKey) {
      providers.push({
        name: "Gemini",
        url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        key: opts.geminiKey,
        model: rawModel.includes("gemini") ? rawModel : "gemini-2.5-flash",
        maxTokens: 300,
      });
    }
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

  for (const provider of providers) {
    try {
      console.log(`[ai-cascade] Trying: ${provider.name} — ${provider.model}`);
      const reply = await callLLM(provider, messages);
      console.log(`[ai-cascade] Success via ${provider.name}`);
      return reply;
    } catch (e: any) {
      console.warn(`[ai-cascade] ${provider.name} failed: ${e.message}`);
    }
  }

  const fallbacks = [
    "Bear with me one moment — I want to make sure I give you the right details. 🙏",
    "Just pulling something up for you, I'll be right back.",
    "One second — I want to confirm the latest info before I respond.",
    "Give me a moment, I want to make sure this is accurate for you.",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// ─────────────────────────────────────────────────────────────────
// TWILIO TWIML HELPER
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
    const integRows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/whatsapp_integrations?business_phone=eq.${encodeURIComponent(to)}&limit=1`
    );
    const integ = Array.isArray(integRows) ? integRows[0] : null;

    console.log(
      "[twilio-edge] integration:",
      integ ? `found (user: ${integ.user_id})` : "NOT FOUND"
    );
    if (!integ) return twiml("This number is not configured. Please contact support.");

    const [profileRows, tagRows, propertyRows] = await Promise.all([
      sbFetch(supabaseUrl, serviceKey, `/profiles?user_id=eq.${integ.user_id}&limit=1`),
      sbFetch(
        supabaseUrl,
        serviceKey,
        `/market_tags?user_id=eq.${integ.user_id}&select=tag_text&limit=10`
      ),
      sbFetch(
        supabaseUrl,
        serviceKey,
        `/properties?user_id=eq.${integ.user_id}&status=eq.available&select=name,location,size_sqm,price,title_type&limit=10`
      ),
    ]);

    const profile = Array.isArray(profileRows) ? profileRows[0] : null;
    const marketTags = Array.isArray(tagRows)
      ? tagRows.map((t: any) => t.tag_text)
      : [];
    const properties = Array.isArray(propertyRows) ? propertyRows : [];

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
      await sbFetch(supabaseUrl, serviceKey, `/leads?id=eq.${lead.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: profileName }),
      });
      lead.name = profileName;
    }

    if (!lead) return twiml("Unable to create your profile. Please try again.");

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

    if (lead.ai_paused) return new Response("", { status: 200 });

    const historyRows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/conversations?lead_id=eq.${lead.id}&select=role,message_text&order=created_at.asc&limit=20`
    );
    const history = Array.isArray(historyRows) ? historyRows : [];

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

    const newIntentScore = calculateIntentScore(history, body);
    await sbFetch(supabaseUrl, serviceKey, `/leads?id=eq.${lead.id}`, {
      method: "PATCH",
      body: JSON.stringify({ intent_score: newIntentScore }),
    });

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

    await sbFetch(
      supabaseUrl,
      serviceKey,
      `/whatsapp_integrations?id=eq.${integ.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          last_event_at: new Date().toISOString(),
          status: "connected",
        }),
      }
    );

    return twiml(reply);
  } catch (e: any) {
    console.error("[twilio-edge] Unhandled error:", e?.message);
    return twiml(
      "Bear with me one moment — I'll confirm the details and get right back to you. 🙏"
    );
  }
}