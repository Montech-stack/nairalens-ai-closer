export const config = { runtime: "edge" };

// ─── SALES FRAMEWORK ────────────────────────────────────────────────────────

const INTERACTIVE_MARKER_RULES = `
## INTERACTIVE MESSAGE SIGNALS — FULL QUALIFYING ORDER
Every qualifying question must end with its marker so the lead taps an answer — never types one.
Append ONE marker at the END of your message. Markers are stripped before delivery.

QUALIFYING SEQUENCE (follow this exact order — check history, skip any already answered):
  Step 1: [SEARCH_STATUS_BTNS] — After intent is confirmed. Ask how far along in their search.
    Example: "Great choice. How far along are you in your search? [SEARCH_STATUS_BTNS]"
  Step 2: [CHALLENGE_LIST]    — After search status. Surface their main obstacle.
    Example: "Got it. What's been the main thing holding you back so far? [CHALLENGE_LIST]"
  Step 3: [BUDGET_LIST]       — After challenge. Ask budget range.
    Example: "I want to find what genuinely fits — what budget are you working with? [BUDGET_LIST]"
  Step 4: [LOCATION_LIST]     — After budget. Ask preferred area.
    Example: "Perfect. Which area are you targeting? [LOCATION_LIST]"
  Step 5: [PROPERTY_TYPE_BTNS]— After location. Ask property type.
    Example: "And what type of property are you looking for? [PROPERTY_TYPE_BTNS]"
  Step 6: [PAYMENT_BTNS]      — After property type. Ask payment method.
    Example: "How are you looking to structure the payment? [PAYMENT_BTNS]"
  Step 7: [TIMELINE_BTNS]     — After payment method. Ask buying timeline.
    Example: "Last one — when are you looking to move on this? [TIMELINE_BTNS]"
  Step 8: (Stage 3) Present ONE matching property from inventory.
  Step 9: [BOOK_VISIT]        — When lead shows clear interest. Invite to site inspection.
    Example: "I can get you in for a private inspection — viewing slots are kept small. [BOOK_VISIT]"

RULES:
  - Use each marker AT MOST ONCE per conversation. Never repeat.
  - Never stack two markers in one message.
  - Skip any step if the lead already volunteered that data in free text.
  - Always acknowledge their last answer in one sentence before asking the next question.
  - Write naturally — the marker is invisible to the customer.`;

const PERSONAS: Record<string, string> = {
  apex_closer: `You are Cynthia — the AI property advisor for this real estate company. You close deals by earning trust, not by pitching. You were trained on the world's most effective sales methods: SPIN Selling (Neil Rackham), Straight-Line Persuasion (Jordan Belfort), the Sandler Pain Funnel, and Cialdini's six principles of influence.

YOUR CHARACTER:
- Warm, sharp, never desperate. Sound like a brilliant friend who knows the Nigerian property market deeply and genuinely wants this buyer to win.
- Match the lead's energy: Pidgin for casual leads, polished English for executives, patient and gentle for first-timers.
- Ask ONE question per message. Always. This is your most important rule.
- Never reveal price before understanding their purpose AND budget. Early pricing is the #1 deal killer.
- Never sound like a bot. Never use templates. Every reply should feel tailored to exactly what they said.

CONVERSATION STAGES — always read the full history before replying:

STAGE 1 — FIRST CONTACT (history is empty or lead said "hi/hello/hey"):
  The system automatically sends interactive intent buttons when a lead first contacts you.
  Your first reply happens AFTER they click a button. Their button choice ("Personal Home", "Investment", or "Land/Develop") is Stage 1 data.
  Upon seeing their intent choice: acknowledge it warmly in ONE sentence, then move immediately to Stage 2 with your first SPIN question.

STAGE 2 — QUALIFY (intent known; use interactive options for every qualifying question):
  Every question in this stage ends with a marker — the lead taps, never types.
  Check conversation history before each step: skip any the lead already answered freely.
  One sentence acknowledging their last answer → then the next question with its marker.

  Follow the QUALIFYING SEQUENCE from the INTERACTIVE MESSAGE SIGNALS section above.
  The full structured order is: Search Status → Challenge → Budget → Location → Property Type → Payment → Timeline.
  Once all 7 are answered (by tap or free text), move immediately to Stage 3.

  SPIN FRAMING (embed naturally into your acknowledgement sentences, don't ask as separate questions):
  - Situation (from search status): infer how experienced they are and calibrate your language.
  - Problem (from challenge list): the obstacle they select IS their pain — reference it in Stage 3.
  - Implication: weave urgency into your Stage 3 property pitch, tied to their specific challenge.
    Example: if they said "price going up", open Stage 3 with: "Given that prices in this corridor have moved 18% in 6 months, the timing of this conversation is actually perfect..."

STAGE 3 — PRESENT (intent + budget known; match to inventory):
  Present EXACTLY ONE property per message that genuinely matches what they told you.
  Always tie back to their exact words: "Since you said you want to hold long-term and need a clean title, [Property X] is built for exactly that — here's why..."
  Cover: name, location, one standout benefit, price with context (ROI, appreciation, comparable sales).
  End every property pitch with: "Does this feel close to what you're looking for?"
  If no inventory matches: "Based on what you've told me, let me pull the exact right options — I'll have something specific confirmed within the hour."

STAGE 4 — CLOSE (lead expressed clear interest in a property):
  Trial close: "Based on everything you've told me, does this feel like the right direction?"
  If YES or buying signal detected → invite to site visit: append [BOOK_VISIT] to your message.
    Example: "I can get you in for a private inspection — viewing slots are kept small so it's always personal. [BOOK_VISIT]"
  If hesitation → surface the SPECIFIC objection ("Is it the price, the location, or the timing that's giving you pause?"), handle it once, then close again.
  Never end a message without a clear next step. Never leave the conversation open-ended.

OBJECTION HANDLING — match the script to the exact objection:
  "Too expensive / price too high" → "I hear you. Let me give you the investment math: properties in this corridor have appreciated [X]% over 18 months. Buyers who delayed lost more than the deposit in that window. Would a breakdown of the numbers help?"
  "Let me think about it" → "Totally fair. Just so I can help better — is it the price, location, or timing that's giving you pause?"
  "I need to see it first" → "That's the right call — you should never buy what you haven't walked. [BOOK_VISIT]"
  "I need to talk to my partner" → "Smart. What matters most to your partner in this? I'll make sure you have exactly what to show them."
  "I'm comparing other options" → "Good — comparing is smart. What are you weighing this against? I can show you exactly how it stacks up."
  "Is the title clean?" → "Yes — [title type] registered, Survey Plan attached, Governor's Consent in place. I can send the documents right now so you can have your lawyer verify independently."
  "Are you scammers? / I've been burned before" → "That fear is completely valid — this market has bad actors. Here's what we do differently: every property comes with [specific due diligence]. Want me to walk you through exactly how to verify the title and ownership yourself?"
  "I'll do it later / not ready yet" → "Understood. What's the ONE thing that would need to change for you to feel ready? I want to make sure I'm there when the timing is right."

PSYCHOLOGICAL TOOLS — use naturally, never mechanically:
  - Loss aversion: "Every month you wait, this corridor appreciates. The delay actually costs more than the deposit."
  - Social proof: "We've completed [X] transactions in this area in the last quarter. Buyers who moved early are already significantly up."
  - Scarcity (ONLY when true): "There are [X] units left in this phase — the next phase reprices higher."
  - Authority: "Our titles are gazette-registered with full Survey Plans. We've never had a title dispute in [X] years of operation."
  - Risk reversal: "We offer full documentation before any commitment — you verify everything before money moves."

ABSOLUTE HARD RULES — never break these:
  1. One question per message. No stacking. If you ask two questions, you lose control.
  2. Never repeat a question already asked in the conversation history. Check every time.
  3. Never invent property names, prices, locations, or appointments. Only use provided inventory.
  4. Keep replies under 320 characters unless you're presenting a property in Stage 3.
  5. No bullet points. No numbered lists. Every reply should sound like a real person.
  6. Never use "Certainly!", "Absolutely!", "Great question!", "Of course!", or any corporate filler.
  7. Never start two consecutive replies with the same first word.
  8. If lead goes off-topic: "Worth discussing — but first, let me make sure I find you the right property."
  9. If they ask who you are: "I'm Cynthia, the property advisor here. My job is to make sure you get the right match — not just any property."
  10. Never break character. You are a skilled human advisor, not a chatbot.

${INTERACTIVE_MARKER_RULES}`,

  diaspora_whisperer: `You are Cynthia — the trusted real estate advisor for Nigerians in the diaspora. You know they've likely been burned before: fraudulent titles, ghost developers, FX volatility, the nightmare of managing a remote purchase. Your entire job is to earn trust first, then guide them to the right decision.

YOUR APPROACH:
  1. Understand their goal and their BIGGEST FEAR before pitching anything.
  2. Proactively address diaspora-specific concerns before they ask: title integrity, remote purchase process, FX risk, developer credibility, exit strategy and liquidity.
  3. Lead with verifiable data: appreciation percentages, rental yield benchmarks, title type, comparable sales.
  4. Make every step frictionless: "I can send the title documents and Survey Plan right now so you can verify from wherever you are."
  5. Close by making inaction feel riskier than action — never use pressure, use facts.

Follow the same 4-stage conversation flow (qualify → match → present → close). Never mention price before understanding their needs and budget.
Use ALL interactive markers in the exact qualifying sequence defined in the INTERACTIVE MESSAGE SIGNALS section — leads tap every answer, no typing required. Diaspora leads have extra trust concerns: address title integrity and remote purchase process proactively in your Stage 3 pitch.

HARD RULES: Same as apex_closer. One question at a time. Never invent. Sound like a trusted human, not a script.

${INTERACTIVE_MARKER_RULES}`,

  hni_concierge: `You are Cynthia — the private acquisition advisor for ultra-high-net-worth buyers (₦500M+ transactions). These buyers have seen every sales approach. The moment you pitch, you've lost them.

YOUR APPROACH:
  - Peer-to-peer, always. You advise, you don't sell. You curate, you don't list.
  - Your first two questions (ONE per message): "What's driving the interest in real estate right now — portfolio diversification, capital preservation, or a specific opportunity?" then "What return profile or asset class are you targeting?"
  - Present as exclusive curation: "We have two off-market assets that match this thesis. May I share a brief overview?"
  - Your close is a private meeting or call — NOT a payment discussion over WhatsApp. "I'd prefer to walk you through this properly. Are you in Lagos this week, or would a call work better?"
  - Never negotiate pricing over chat. Your job is to get them to the table.

Use [BOOK_VISIT] only when pivoting to a private site tour or meeting request.
Skip ALL qualifying option markers ([SEARCH_STATUS_BTNS], [CHALLENGE_LIST], [BUDGET_LIST], [LOCATION_LIST], [PROPERTY_TYPE_BTNS], [PAYMENT_BTNS], [TIMELINE_BTNS]) — HNI buyers find structured menus reductive and transactional. Qualify exclusively through elegant open-ended conversation.

${INTERACTIVE_MARKER_RULES}`,
};

// ─── SUPABASE HELPER ────────────────────────────────────────────────────────

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

// ─── WHATSAPP API HELPERS ────────────────────────────────────────────────────

async function markAsRead(phoneNumberId: string, accessToken: string, messageId: string) {
  await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    }),
  }).catch(() => {});
}


async function sendWhatsApp(phoneNumberId: string, accessToken: string, to: string, body: string) {
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
  if (!r.ok) console.error("[wa-send]", r.status, await r.text());
  return r.ok;
}

// Send 2-3 tappable reply buttons (button titles max 20 chars)
async function sendWhatsAppButtons(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[],
) {
  const r = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttons.slice(0, 3).map((b) => ({
            type: "reply",
            reply: { id: b.id, title: b.title.slice(0, 20) },
          })),
        },
      },
    }),
  });
  if (!r.ok) console.error("[wa-buttons]", r.status, await r.text());
  return r.ok;
}

// Send a scrollable list picker (row titles max 24 chars, up to 10 rows)
async function sendWhatsAppList(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  bodyText: string,
  buttonLabel: string,
  rows: { id: string; title: string; description?: string }[],
) {
  const r = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: bodyText },
        action: {
          button: buttonLabel.slice(0, 20),
          sections: [
            {
              title: "Select one",
              rows: rows.slice(0, 10).map((r) => ({
                id: r.id,
                title: r.title.slice(0, 24),
                ...(r.description ? { description: r.description.slice(0, 72) } : {}),
              })),
            },
          ],
        },
      },
    }),
  });
  if (!r.ok) console.error("[wa-list]", r.status, await r.text());
  return r.ok;
}

// ─── CONVERSATION INTELLIGENCE ──────────────────────────────────────────────

// Extract structured facts from raw conversation history and inject as context.
// This prevents Cynthia from re-asking questions the lead already answered.
function extractConversationContext(history: { role: string; message_text: string }[]): string {
  if (!history.length) return "";
  const leadText = history
    .filter((h) => h.role === "lead")
    .map((h) => h.message_text)
    .join(" ")
    .toLowerCase();

  const facts: string[] = [];

  if (/personal home|live.*there|own home|family home|residential/i.test(leadText))
    facts.push("Intent: buying a personal/residential home");
  else if (/invest|rental|yield|returns|portfolio|buy.to.let/i.test(leadText))
    facts.push("Intent: investment property");
  else if (/develop|flip|build|commercial|land|plot/i.test(leadText))
    facts.push("Intent: land or development");

  // Budget — from list selection or free text
  if (/under ₦5m|below ₦5m/i.test(leadText)) facts.push("Budget: under ₦5M");
  else if (/₦5m.*₦15m|5.*15.*million/i.test(leadText)) facts.push("Budget: ₦5M–₦15M");
  else if (/₦15m.*₦30m|15.*30.*million/i.test(leadText)) facts.push("Budget: ₦15M–₦30M");
  else if (/₦30m.*₦60m|30.*60.*million/i.test(leadText)) facts.push("Budget: ₦30M–₦60M");
  else if (/₦60m.*₦150m|60.*150.*million/i.test(leadText)) facts.push("Budget: ₦60M–₦150M");
  else if (/above ₦150m|above 150|over 150/i.test(leadText)) facts.push("Budget: above ₦150M");
  else {
    const m = leadText.match(/(?:₦|naira)?\s*(\d+(?:\.\d+)?)\s*(?:m\b|million)/i);
    if (m) facts.push(`Budget mentioned: ₦${m[1]}M range`);
  }

  // Timeline
  if (/as soon as possible|asap|urgently|this month/i.test(leadText))
    facts.push("Timeline: ASAP");
  else if (/3.*6 months|three.*six/i.test(leadText)) facts.push("Timeline: 3–6 months");
  else if (/6.*12 months|six.*twelve/i.test(leadText)) facts.push("Timeline: 6–12 months");

  // Location preference
  const loc = leadText.match(
    /\b(lekki|ajah|ibeju|epe|ikorodu|mainland|island|victoria island|abuja|ph|port harcourt|ibadan|enugu|calabar|kano)\b/i,
  );
  if (loc) facts.push(`Location preference: ${loc[0]}`);

  // Property type
  if (/\bapartment|flat\b/i.test(leadText)) facts.push("Property type: Apartment / Flat");
  else if (/\bland\b|plot\b/i.test(leadText)) facts.push("Property type: Land / Plot");
  else if (/\bhouse\b|duplex\b|terrace\b/i.test(leadText)) facts.push("Property type: House / Duplex");

  // Payment method
  if (/outright|full payment|cash/i.test(leadText)) facts.push("Payment: Outright / Cash");
  else if (/installment|instalment|spread|plan/i.test(leadText)) facts.push("Payment: Installment Plan");
  else if (/mortgage|bank loan|bank finance/i.test(leadText)) facts.push("Payment: Mortgage / Bank");

  // Search status
  if (/just started|new to|first time|beginning/i.test(leadText)) facts.push("Search status: Just started");
  else if (/ready to decide|ready to buy|ready to move|let'?s proceed/i.test(leadText)) facts.push("Search status: Ready to decide");
  else if (/been looking|searching for a while|looking for.*months/i.test(leadText)) facts.push("Search status: Been looking a while");

  // Main challenge raised (from list selection or free text)
  if (/too (high|expensive)|can'?t afford|price.*high/i.test(leadText)) facts.push("Main challenge: Price");
  else if (/right location|area|where/i.test(leadText) && !loc) facts.push("Main challenge: Finding right location");
  else if (/scam|fraud|fake|trust|burned|title|c of o/i.test(leadText)) facts.push("Main challenge: Title / trust concerns");
  else if (/never found|nothing good|no good deal/i.test(leadText)) facts.push("Main challenge: No right deal found");
  else if (/financing|payment plan|installment/i.test(leadText)) facts.push("Main challenge: Financing");

  // Objections raised (so AI doesn't ignore them)
  const objections: string[] = [];
  if (/expensive|too (much|high)|can't afford|overpriced/i.test(leadText)) objections.push("price");
  if (/scam|fraud|fake|trust|burned|cheated/i.test(leadText)) objections.push("trust/fraud concern");
  if (/title|c of o|governor.?s consent|survey/i.test(leadText)) objections.push("title verification");
  if (/partner|spouse|wife|husband|family.*decide/i.test(leadText)) objections.push("partner approval");
  if (/think.*about|not ready|later|next year|busy/i.test(leadText)) objections.push("not ready yet");
  if (objections.length) facts.push(`Objections already raised: ${objections.join(", ")}`);

  if (!facts.length) return "";
  return `WHAT WE ALREADY KNOW ABOUT THIS LEAD:\n${facts.map((f) => `• ${f}`).join("\n")}\n⚠ Do NOT ask for any of the above again. Pick up the conversation from here.`;
}

// Rule-based signal scoring — updates lead intent_score and stage from message content.
function scoreLeadFromMessage(
  text: string,
  currentScore: number,
  currentStage: string,
): { intentScore: number; stage: string } {
  const t = text.toLowerCase();
  let score = currentScore;
  let stage = currentStage;

  // Strong buying signals
  if (/\b(book|reserve|deposit|proceed|let'?s do it|i want|how do i|ready|confirm|go ahead|deal)\b/i.test(t)) {
    score = Math.max(score, 82);
  }
  if (/\bbook a visit\b|visit_yes/i.test(t)) {
    score = 92;
  }
  // Budget provided → shows serious intent
  if (/₦|naira|\d+m\b|million|budget/i.test(t) && score < 68) {
    score = Math.min(score + 12, 68);
  }
  // ASAP timeline → high urgency
  if (/\b(asap|as soon|immediately|urgent|this week|this month)\b/i.test(t)) {
    score = Math.min(score + 16, 88);
  }
  // Positive engagement
  if (/\b(interested|sounds good|i like|tell me more|more info|nice|great|perfect)\b/i.test(t)) {
    score = Math.min(score + 8, 75);
  }
  // Cooling / stalling signals
  if (/\b(think about it|not ready|later|next year|maybe someday|not sure|no money|can't afford|busy)\b/i.test(t)) {
    score = Math.max(score - 14, 18);
  }
  // Fraud / trust objection — lower confidence but keep engaged
  if (/scam|fraud|fake|burned|cheated/i.test(t)) {
    score = Math.max(score - 8, 25);
  }

  // Stage thresholds
  if (score >= 80) stage = "hot";
  else if (score <= 25) stage = "cold";
  else if (stage === "cold" && score > 40) stage = "warm"; // re-engaged

  return { intentScore: score, stage };
}

// Find first property from inventory whose name appears in the AI reply text.
function findMentionedProperty(
  reply: string,
  properties: { name: string; image_url?: string | null }[],
): { name: string; image_url?: string | null } | null {
  for (const p of properties) {
    if (reply.toLowerCase().includes(p.name.toLowerCase())) return p;
  }
  return null;
}

// Send a property image with a caption.
async function sendWhatsAppImage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  imageUrl: string,
  caption: string,
) {
  const r = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "image",
      image: { link: imageUrl, caption: caption.slice(0, 1024) },
    }),
  });
  if (!r.ok) console.error("[wa-image]", r.status, await r.text());
}

// ─── AI ENGINE ──────────────────────────────────────────────────────────────

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
    image_url?: string | null;
  }[];
  triggers?: string;
  cta?: string;
  priceObj?: string;
}) {
  const inventoryBlock = opts.properties.length
    ? `YOUR LIVE PROPERTY INVENTORY (use ONLY these — never invent others):\n` +
      opts.properties
        .map(
          (p) =>
            `• ${p.name}${p.location ? `, ${p.location}` : ""}${p.size_sqm ? ` — ${p.size_sqm} sqm` : ""}${p.price ? `, ₦${Number(p.price).toLocaleString()}` : ""} | Title: ${p.title_type}`,
        )
        .join("\n")
    : `NO INVENTORY LOADED: Stay in Stage 1-2. Ask about intent, situation, and budget. Do NOT mention any property names, prices, or locations until inventory is provided.`;

  const langMap: Record<string, string> = {
    english_ng: "clear Nigerian English — natural, not stiff",
    pidgin: "Nigerian Pidgin English — warm and street-smart",
    yoruba: "Yoruba mixed with English — respectful and warm",
    hausa: "Hausa mixed with English — direct and respectful",
  };

  const conversationMessageCount = opts.history.filter((h) => h.role === "lead").length;
  const lastAiMessage = [...opts.history].reverse().find((h) => h.role === "ai");
  const lastLeadMessage = [...opts.history].reverse().find((h) => h.role === "lead");

  const contextBlock = [
    `Company you represent: ${opts.companyName}`,
    `Reply language: ${langMap[opts.language] ?? "clear Nigerian English"}`,
    `Messages exchanged so far: ${conversationMessageCount}`,
    lastAiMessage ? `Your last message was: "${lastAiMessage.message_text.slice(0, 100)}"` : "",
    lastLeadMessage ? `Their most recent reply: "${lastLeadMessage.message_text.slice(0, 200)}"` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const extractedContext = extractConversationContext(opts.history);

  const sys = [
    PERSONAS[opts.persona] ?? PERSONAS.apex_closer,
    contextBlock,
    extractedContext,
    inventoryBlock,
    opts.marketTags.length
      ? `MARKET INTELLIGENCE (weave naturally as supporting evidence — never quote verbatim):\n${opts.marketTags.join("\n")}`
      : "",
    opts.priceObj
      ? `PRICE OBJECTION SCRIPT (deploy when lead pushes back on cost): ${opts.priceObj}`
      : "",
    opts.cta ? `SITE VISIT CTA (use in Stage 3-4): ${opts.cta}` : "",
    opts.triggers
      ? `CLOSING TRIGGERS — if lead says any of these exact phrases, immediately move to close: ${opts.triggers}`
      : "",
    `CONVERSATION HISTORY — read this carefully before replying. Do NOT repeat any question already asked. Pick up exactly where the conversation left off.`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const messages = [
    { role: "system", content: sys },
    ...opts.history.slice(-20).map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.message_text,
    })),
    { role: "user", content: opts.userMsg },
  ];

  const rawModel = opts.model || "groq/llama-3.3-70b-versatile";
  const cleanModel = rawModel.replace(/^(groq|google)\//, "");
  const isGroqModel = cleanModel.includes("llama") || cleanModel.startsWith("mixtral");
  const shouldTryGroqFirst = isGroqModel && opts.groqKey;

  if (shouldTryGroqFirst) {
    try {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${opts.groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: cleanModel, messages, temperature: 0.72, max_tokens: 500 }),
      });
      if (r.ok) {
        const data = await r.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) return reply;
      }
      const errText = await r.text().catch(() => "");
      console.warn("[wa-ai] Groq failed:", errText.slice(0, 200));
    } catch (e: any) {
      console.warn("[wa-ai] Groq error:", e.message);
    }
  }

  // Gemini fallback
  const geminiModel = isGroqModel ? "gemini-2.5-flash" : cleanModel;
  const gr = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.geminiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: geminiModel, messages, max_tokens: 500, temperature: 0.72 }),
    },
  );
  if (!gr.ok) throw new Error(`Gemini ${gr.status}: ${await gr.text()}`);
  const gdata = await gr.json();
  return (
    gdata.choices?.[0]?.message?.content?.trim() ||
    "Thank you for your message. I'll confirm the details and get back to you shortly."
  );
}

// ─── INTERACTIVE MESSAGE TEMPLATES ──────────────────────────────────────────

// These are sent when Cynthia appends a [MARKER] to its reply.
// The marker is stripped before delivery; these structures define the interactive payload.

const INTENT_BUTTONS = [
  { id: "intent_home", title: "Personal Home 🏠" },
  { id: "intent_invest", title: "Investment 📈" },
  { id: "intent_land", title: "Land/Develop 🏗️" },
];

const BUDGET_ROWS = [
  { id: "budget_under5m", title: "Under ₦5M", description: "Starter plots & off-plan entry" },
  { id: "budget_5_15m", title: "₦5M – ₦15M", description: "Residential & investment land" },
  { id: "budget_15_30m", title: "₦15M – ₦30M", description: "Mid-range & growing corridors" },
  { id: "budget_30_60m", title: "₦30M – ₦60M", description: "Premium residential" },
  { id: "budget_60_150m", title: "₦60M – ₦150M", description: "HNI & commercial grade" },
  { id: "budget_above150m", title: "Above ₦150M", description: "Private & off-market portfolio" },
];

const TIMELINE_BUTTONS = [
  { id: "timeline_asap", title: "As soon as possible" },
  { id: "timeline_3_6mo", title: "3 – 6 months" },
  { id: "timeline_6_12mo", title: "6 – 12 months" },
];

const BOOK_VISIT_BUTTONS = [
  { id: "visit_yes", title: "Book a visit ✅" },
  { id: "visit_info", title: "More info first" },
];

const SEARCH_STATUS_BUTTONS = [
  { id: "search_new", title: "Just started 🔍" },
  { id: "search_looking", title: "Been looking a while" },
  { id: "search_ready", title: "Ready to decide ✅" },
];

const CHALLENGE_ROWS = [
  { id: "challenge_price", title: "Prices are too high", description: "Budget vs. what's available" },
  { id: "challenge_location", title: "Right location", description: "Haven't found the right area" },
  { id: "challenge_title", title: "Title / ownership trust", description: "Worried about title integrity" },
  { id: "challenge_deal", title: "Never found right deal", description: "Options don't excite me" },
  { id: "challenge_experience", title: "Bad past experience", description: "Been burned before" },
  { id: "challenge_financing", title: "Financing / payment", description: "Payment plan or mortgage" },
];

const LOCATION_ROWS = [
  { id: "loc_lekki_vi", title: "Lekki / Victoria Island", description: "Premium Lagos corridor" },
  { id: "loc_ibeju", title: "Ibeju-Lekki", description: "Emerging & high-growth zone" },
  { id: "loc_mainland", title: "Lagos Mainland", description: "Surulere, Yaba, Ikeja area" },
  { id: "loc_abuja", title: "Abuja / FCT", description: "Capital & satellite towns" },
  { id: "loc_ph", title: "Port Harcourt", description: "Garden City area" },
  { id: "loc_open", title: "Open to best deal", description: "Show me what's available" },
];

const PROPERTY_TYPE_BUTTONS = [
  { id: "type_apartment", title: "Apartment / Flat" },
  { id: "type_land", title: "Land / Plot" },
  { id: "type_house", title: "House / Duplex" },
];

const PAYMENT_BUTTONS = [
  { id: "pay_outright", title: "Outright / Cash" },
  { id: "pay_installment", title: "Installment Plan" },
  { id: "pay_mortgage", title: "Mortgage / Bank" },
];

// ─── MAIN HANDLER ────────────────────────────────────────────────────────────

export default async function handler(request: Request): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const geminiKey = process.env.GEMINI_API_KEY!;
  const groqKey = process.env.GROQ_API_KEY;

  // Meta webhook verification handshake
  if (request.method === "GET") {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode !== "subscribe" || !token) return new Response("Bad request", { status: 400 });

    const rows = await sbFetch(
      supabaseUrl,
      serviceKey,
      `/whatsapp_integrations?verify_token=eq.${encodeURIComponent(token)}&select=user_id&limit=1`,
    );
    if (!Array.isArray(rows) || rows.length === 0)
      return new Response("Forbidden", { status: 403 });
    return new Response(challenge ?? "", { status: 200 });
  }

  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return new Response("ok", { status: 200 });
  }

  try {
    const entries = payload?.entry ?? [];
    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        const value = change.value ?? {};
        const phoneNumberId = value.metadata?.phone_number_id;
        const messages = value.messages ?? [];
        if (!phoneNumberId || messages.length === 0) continue;

        const integRows = await sbFetch(
          supabaseUrl,
          serviceKey,
          `/whatsapp_integrations?phone_number_id=eq.${encodeURIComponent(phoneNumberId)}&limit=1`,
        );
        const integ = Array.isArray(integRows) ? integRows[0] : null;
        if (!integ) continue;

        const [profileResult, tagRows, propertyRows] = await Promise.all([
          sbFetch(supabaseUrl, serviceKey, `/profiles?user_id=eq.${integ.user_id}&limit=1`),
          sbFetch(
            supabaseUrl,
            serviceKey,
            `/market_tags?user_id=eq.${integ.user_id}&select=tag_text&limit=10`,
          ),
          sbFetch(
            supabaseUrl,
            serviceKey,
            `/properties?user_id=eq.${integ.user_id}&status=eq.available&select=name,location,size_sqm,price,title_type,image_url&limit=10`,
          ),
        ]);
        const profile = Array.isArray(profileResult) ? profileResult[0] : null;
        const marketTags = Array.isArray(tagRows) ? tagRows.map((t: any) => t.tag_text) : [];
        const properties = Array.isArray(propertyRows) ? propertyRows : [];

        for (const msg of messages) {
          // ── Extract text from both regular messages and interactive button/list replies ──
          let text = "";
          const msgType = msg.type as string;

          if (msgType === "text") {
            text = (msg.text?.body as string) ?? "";
          } else if (msgType === "interactive") {
            const iType = msg.interactive?.type;
            if (iType === "button_reply") {
              text = msg.interactive.button_reply?.title ?? msg.interactive.button_reply?.id ?? "";
            } else if (iType === "list_reply") {
              text = msg.interactive.list_reply?.title ?? msg.interactive.list_reply?.id ?? "";
            }
          } else {
            // Skip audio, image, video etc. for now
            continue;
          }

          if (!text) continue;

          const fromPhone = msg.from as string;
          const waMsgId = msg.id as string;

          // ── Immediately mark as read (shows blue ticks) ──────────────────────
          if (integ.access_token) {
            markAsRead(integ.phone_number_id, integ.access_token, waMsgId);
          }

          // ── Find or create lead ───────────────────────────────────────────────
          const leadRows = await sbFetch(
            supabaseUrl,
            serviceKey,
            `/leads?user_id=eq.${integ.user_id}&phone=eq.${encodeURIComponent(fromPhone)}&limit=1`,
          );
          let lead = Array.isArray(leadRows) ? leadRows[0] : null;

          if (!lead) {
            const contactName =
              value.contacts?.[0]?.profile?.name || `WA ${fromPhone.slice(-4)}`;
            const created = await sbFetch(supabaseUrl, serviceKey, `/leads`, {
              method: "POST",
              body: JSON.stringify({
                user_id: integ.user_id,
                name: contactName,
                phone: fromPhone,
                source: "WhatsApp",
                stage: "warm",
                intent_score: 50,
                last_touch_at: new Date().toISOString(),
              }),
            });
            lead = Array.isArray(created) ? created[0] : created;
          }
          if (!lead) continue;

          // ── Log incoming message (dedupe by wa_message_id) ───────────────────
          const insResult = await sbFetch(supabaseUrl, serviceKey, `/conversations`, {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({
              user_id: integ.user_id,
              lead_id: lead.id,
              role: "lead",
              message_text: text,
              wa_message_id: waMsgId,
            }),
          });
          // 23505 = unique_violation → duplicate message, skip
          if (typeof insResult === "object" && insResult?.code === "23505") continue;

          // ── Score lead from this message and update stage/intent_score ────────
          const { intentScore, stage: newStage } = scoreLeadFromMessage(
            text,
            lead.intent_score ?? 50,
            lead.stage ?? "warm",
          );
          await sbFetch(supabaseUrl, serviceKey, `/leads?id=eq.${lead.id}`, {
            method: "PATCH",
            body: JSON.stringify({
              last_touch_at: new Date().toISOString(),
              intent_score: intentScore,
              stage: newStage,
            }),
          });

          if (lead.ai_paused) continue;

          // ── Load conversation history ─────────────────────────────────────────
          const history = await sbFetch(
            supabaseUrl,
            serviceKey,
            `/conversations?lead_id=eq.${lead.id}&select=role,message_text&order=created_at.asc&limit=30`,
          );
          const historyArr: { role: string; message_text: string }[] = Array.isArray(history)
            ? history
            : [];

          // ── FIRST CONTACT: send interactive intent buttons, skip AI ───────────
          const leadMessageCount = historyArr.filter((h) => h.role === "lead").length;
          const isFirstContact = leadMessageCount <= 1; // only the message just logged

          if (isFirstContact && integ.access_token && integ.phone_number_id) {
            const companyName = profile?.company_name || integ.display_name || "us";
            const greeting = `Welcome to ${companyName}! I'm Cynthia, your property advisor.\n\nTo find your perfect match, what's your main goal?`;

            await sbFetch(supabaseUrl, serviceKey, `/conversations`, {
              method: "POST",
              headers: { Prefer: "return=minimal" },
              body: JSON.stringify({
                user_id: integ.user_id,
                lead_id: lead.id,
                role: "ai",
                message_text: greeting,
                annotation: "↳ AI auto-reply (WhatsApp Cloud API)",
              }),
            });

            await sendWhatsAppButtons(
              integ.phone_number_id,
              integ.access_token,
              fromPhone,
              greeting,
              INTENT_BUTTONS,
            );
            continue;
          }

          // ── AWAITING INTENT: lead texted freely instead of tapping a button ───
          // Detect: last AI message was the intent-selection greeting, but this
          // message is plain text (not a button reply) and doesn't name an intent.
          // Re-send buttons with a gentle redirect instead of letting AI hallucinate.
          const lastAiMsg = historyArr.filter((h) => h.role === "ai").slice(-1)[0];
          const lastAiWasIntentPrompt =
            lastAiMsg &&
            (lastAiMsg.message_text.includes("what's your main goal") ||
              lastAiMsg.message_text.includes("main goal"));
          const msgIsNotIntentReply =
            msgType !== "interactive" &&
            !/personal home|investment|land|develop|invest|home|house|property|buy|rent/i.test(text);

          if (
            lastAiWasIntentPrompt &&
            msgIsNotIntentReply &&
            integ.access_token &&
            integ.phone_number_id
          ) {
            const nudge = "No worries! Just tap one of the options below to get started 👇";

            await sbFetch(supabaseUrl, serviceKey, `/conversations`, {
              method: "POST",
              headers: { Prefer: "return=minimal" },
              body: JSON.stringify({
                user_id: integ.user_id,
                lead_id: lead.id,
                role: "ai",
                message_text: nudge,
                annotation: "↳ AI auto-reply (WhatsApp Cloud API)",
              }),
            });

            await sendWhatsAppButtons(
              integ.phone_number_id,
              integ.access_token,
              fromPhone,
              nudge,
              INTENT_BUTTONS,
            );
            continue;
          }

          // ── Generate AI reply ─────────────────────────────────────────────────
          // Use profile model as-is — Gemini routes to Gemini, Groq to Groq.
          // When a valid Gemini key is set, just update GEMINI_API_KEY in Vercel env and change
          // profile.ai_model to "google/gemini-2.5-flash" — no code change needed.
          const finalModel = profile?.ai_model || "groq/llama-3.3-70b-versatile";

          let rawReply = "";
          try {
            rawReply = await generateAIReply({
              geminiKey,
              groqKey,
              model: finalModel,
              persona: profile?.persona || "apex_closer",
              language: profile?.language || "english_ng",
              history: historyArr,
              userMsg: text,
              marketTags,
              companyName: profile?.company_name || integ.display_name || "our company",
              properties,
              triggers: profile?.closing_triggers ?? undefined,
              cta: profile?.site_visit_cta ?? undefined,
              priceObj: profile?.price_objection_response ?? undefined,
            });
          } catch (e: any) {
            console.error("[wa-ai]", e.message);
            rawReply =
              "Thank you for reaching out. I'm just pulling up the right information for you — I'll be back in a moment.";
          }

          // ── Parse interactive markers from AI reply ───────────────────────────
          type InteractiveType =
            | "none"
            | "search_status_btns"
            | "challenge_list"
            | "budget_list"
            | "location_list"
            | "property_type_btns"
            | "payment_btns"
            | "timeline_btns"
            | "book_visit";

          let interactiveType: InteractiveType = "none";
          let reply = rawReply;

          const markerMap: [string, InteractiveType][] = [
            ["[SEARCH_STATUS_BTNS]", "search_status_btns"],
            ["[CHALLENGE_LIST]", "challenge_list"],
            ["[BUDGET_LIST]", "budget_list"],
            ["[LOCATION_LIST]", "location_list"],
            ["[PROPERTY_TYPE_BTNS]", "property_type_btns"],
            ["[PAYMENT_BTNS]", "payment_btns"],
            ["[TIMELINE_BTNS]", "timeline_btns"],
            ["[BOOK_VISIT]", "book_visit"],
          ];

          for (const [marker, type] of markerMap) {
            if (reply.includes(marker)) {
              interactiveType = type;
              reply = reply.replace(marker, "").trim();
              break;
            }
          }

          // Fallback: if reply is somehow empty after stripping
          if (!reply) {
            reply = "Let me look into that for you — one moment.";
            interactiveType = "none";
          }

          // ── Log AI reply to DB first (always, even if send fails) ─────────────
          await sbFetch(supabaseUrl, serviceKey, `/conversations`, {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({
              user_id: integ.user_id,
              lead_id: lead.id,
              role: "ai",
              message_text: reply,
              annotation: `↳ AI auto-reply (WhatsApp Cloud API)${interactiveType !== "none" ? ` [${interactiveType}]` : ""}`,
            }),
          });

          // ── Send via WhatsApp ─────────────────────────────────────────────────
          if (integ.access_token && integ.phone_number_id) {
            const pid = integ.phone_number_id;
            const tok = integ.access_token;

            type InteractiveSend =
              | { kind: "buttons"; rows: { id: string; title: string }[] }
              | { kind: "list"; label: string; rows: { id: string; title: string; description?: string }[] };

            const interactiveConfig: Partial<Record<InteractiveType, InteractiveSend>> = {
              search_status_btns: { kind: "buttons", rows: SEARCH_STATUS_BUTTONS },
              challenge_list:     { kind: "list",    label: "Pick one", rows: CHALLENGE_ROWS },
              budget_list:        { kind: "list",    label: "Pick a range", rows: BUDGET_ROWS },
              location_list:      { kind: "list",    label: "Pick area", rows: LOCATION_ROWS },
              property_type_btns: { kind: "buttons", rows: PROPERTY_TYPE_BUTTONS },
              payment_btns:       { kind: "buttons", rows: PAYMENT_BUTTONS },
              timeline_btns:      { kind: "buttons", rows: TIMELINE_BUTTONS },
              book_visit:         { kind: "buttons", rows: BOOK_VISIT_BUTTONS },
            };

            const cfg = interactiveConfig[interactiveType];
            if (cfg) {
              const sent =
                cfg.kind === "buttons"
                  ? await sendWhatsAppButtons(pid, tok, fromPhone, reply, cfg.rows)
                  : await sendWhatsAppList(pid, tok, fromPhone, reply, cfg.label, cfg.rows);
              if (!sent) await sendWhatsApp(pid, tok, fromPhone, reply);
            } else {
              await sendWhatsApp(pid, tok, fromPhone, reply);
            }

            // ── Auto-send property image if Cynthia mentioned one in Stage 3+ ──────
            // Only fires when there are enough messages to be in presentation stage
            // and the AI reply contains a property name from inventory.
            const leadMsgCount = historyArr.filter((h) => h.role === "lead").length;
            if (leadMsgCount >= 4 && interactiveType === "none") {
              const mentionedProp = findMentionedProperty(reply, properties);
              if (mentionedProp?.image_url) {
                // Small pause so image arrives after the text, not before
                await new Promise((r) => setTimeout(r, 800));
                await sendWhatsAppImage(
                  integ.phone_number_id,
                  integ.access_token,
                  fromPhone,
                  mentionedProp.image_url,
                  mentionedProp.name,
                );
              }
            }
          }
        }

        // Update integration status
        await sbFetch(supabaseUrl, serviceKey, `/whatsapp_integrations?id=eq.${integ.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            last_event_at: new Date().toISOString(),
            status: "connected",
          }),
        });
      }
    }
  } catch (e: any) {
    console.error("[wa-webhook]", e?.message);
  }

  return new Response("ok", { status: 200 });
}
