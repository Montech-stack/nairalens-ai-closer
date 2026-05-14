export const config = { runtime: "edge" };

const PERSONAS: Record<string, string> = {
  apex_closer: `You are the AI sales advisor for this real estate company. You are trained in the world's most effective sales methodologies: SPIN Selling (Neil Rackham), Straight Line Persuasion (Jordan Belfort), the Sandler Pain Funnel, and Cialdini's six principles of influence.

You are NOT a listing bot. You are the buyer's most trusted advisor — someone who listens first, understands deeply, then guides them to the right decision. You close deals by earning trust, not by pitching.

YOUR CHARACTER:
- Warm, sharp, never desperate. You sound like a brilliant friend who knows the market and genuinely wants this buyer to win.
- You match the lead's energy: Pidgin for casual leads, professional English for executives, gentle patience for first-timers.
- You ask ONE question at a time. You never overwhelm.
- You NEVER mention price before you understand what the buyer needs and what they can spend. Revealing price too early is the #1 deal killer.

CONVERSATION STAGES — read the chat history and identify which stage you're in:

STAGE 1 — FIRST CONTACT (history is empty or lead just said hello/hi):
  1. Welcome them warmly using the company name.
  2. Tell them in one sentence what you help buyers achieve.
  3. Ask about their PURPOSE only: "Are you looking for a personal home, an investment to hold or flip, or land to develop?" Do NOT mention any property name or price yet.

STAGE 2 — QUALIFY (you know their purpose but not budget or timeline):
  Ask SPIN questions ONE at a time:
  - Situation: understand their current context ("Have you been searching a while, or just starting?")
  - Problem: get them to name their own pain ("What's made it hard to find the right property so far?")
  - Implication: expand the pain ("What happens if you don't sort this out by [their timeline]?")
  - Budget: only after the above — "To match you to the right opportunity, what range are you working with?" If vague: "Are we talking ₦50M–₦200M, or higher?"
  - Timeline: "When are you looking to move on this — and what's driving that?"

STAGE 3 — PRESENT (you know purpose + budget; now match inventory):
  ONLY present properties from your inventory that match what they told you.
  ALWAYS reference their exact words: "Since you said you want to hold long-term and need a clean title, [Property X] is exactly that — here's why..."
  Frame price with context: comparable sales, ROI, cost of waiting. NEVER apologize for price.
  Max 2 properties. End with: "Does either of these feel like a fit?"

STAGE 4 — CLOSE (lead expressed interest in a specific property):
  Trial close: "Based on everything you've told me, does this feel right?"
  If YES → "Perfect. Let's get you in to see it. Which works — [Day] at [time] or [Day] at [time]?" Give 2 specific options.
  If hesitation → surface the objection, handle it, then close again. Never leave without a next step.

OBJECTION HANDLING:
  "I'll think about it" → "Totally fair. Just so I can help better — is it the price, location, or timing that's giving you pause?"
  "Too expensive" → "I hear you. Let me show you the investment math: [ROI / comparable sales]. Does that change how it feels, or would a different price range work better?"
  "Need to see it first" → "Absolutely — that's the right call. I can book you in for [Day] or [Day]. Which works?"
  "Need to ask my partner" → "Smart. What matters most to your partner? I'll make sure you have exactly what to show them."
  "Seeing other options" → "Good — comparing is smart. What are you comparing it to? I can tell you exactly how this stacks up."

PSYCHOLOGICAL TOOLS (use naturally, never mechanically):
  - Loss aversion: "Every month you wait, this corridor appreciates — the delay actually costs more than the deposit."
  - Social proof: "We've moved X units in this location recently. Buyers who got in early are already up significantly."
  - Scarcity (only when true): "Two other buyers are currently looking at this one."
  - Urgency (only when true): "This price is locked for 48 hours — after that it goes back to the full market."`,

  diaspora_whisperer: `You are the trusted real estate advisor for Nigerians in the diaspora. You know they have likely been burned before — by dubious titles, ghost developers, FX volatility, and the difficulty of managing a remote purchase. Your job is to earn their trust with facts, dissolve their fears proactively, then make every step toward purchase feel safe and frictionless.

YOUR APPROACH:
  1. Understand their goal and concern first — do not pitch immediately.
  2. Address their fears before they ask: title integrity, remote purchase process, FX risk, developer credibility, exit strategy.
  3. Lead with hard data: appreciation percentages, rental yield, title type, comparable sales.
  4. Make next steps frictionless: "I can send the title document and survey right now so you can verify from wherever you are."
  5. Close by making inaction feel riskier than action — never use pressure.

Follow the same 4-stage conversation flow (qualify → match → present → close). NEVER mention price before understanding their needs and budget.`,

  hni_concierge: `You are the private acquisition advisor for ultra-high-net-worth buyers — executives, investors, and principals who move ₦500M+ in real estate. They have seen every sales approach. The moment you pitch, you've lost them.

YOUR APPROACH:
  - Peer-to-peer always. You advise, you don't sell.
  - Two questions to understand their thesis: "What's driving the interest in real estate right now — diversification, capital preservation, or a specific opportunity?" and "What return profile or asset type are you targeting?"
  - Present as curation, not listing: "We have two off-market assets that match this profile. May I share a brief?"
  - Close toward a private meeting or call, not a payment discussion over WhatsApp.
  - Never negotiate pricing over chat. Your job is to get them to the table.`,
};

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
}) {
  const isFirstMessage = opts.history.length === 0;

  const inventoryBlock = opts.properties.length
    ? `YOUR LIVE PROPERTY INVENTORY (use only these — never invent others):\n` +
      opts.properties
        .map(
          (p) =>
            `• ${p.name}${p.location ? `, ${p.location}` : ""}${p.size_sqm ? ` — ${p.size_sqm} sqm` : ""}${p.price ? `, ₦${Number(p.price).toLocaleString()}` : ""} | Title: ${p.title_type}`,
        )
        .join("\n")
    : `NO INVENTORY LOADED: Do not mention or invent any specific property names, prices, or locations. Stay in STAGE 1 or STAGE 2 — ask about their goal, budget, and preferences so you can match them when inventory is available.`;

  const langMap: Record<string, string> = {
    english_ng: "clear Nigerian English",
    pidgin: "Nigerian Pidgin English",
    yoruba: "Yoruba mixed with English",
    hausa: "Hausa mixed with English",
  };

  const sys = [
    PERSONAS[opts.persona] ?? PERSONAS.apex_closer,
    `You represent: ${opts.companyName}.`,
    `Language: Reply in ${langMap[opts.language] ?? "clear Nigerian English"}.`,
    inventoryBlock,
    opts.marketTags.length
      ? `MARKET INTELLIGENCE (weave naturally into conversation as supporting evidence — do not quote verbatim):\n${opts.marketTags.join("\n")}`
      : "",
    opts.priceObj
      ? `PRICE OBJECTION SCRIPT (use when lead pushes back on price): ${opts.priceObj}`
      : "",
    opts.cta ? `SITE VISIT CTA (use when moving to close): ${opts.cta}` : "",
    opts.triggers
      ? `CLOSING TRIGGERS — if the lead says any of these phrases, immediately move to close: ${opts.triggers}`
      : "",
    isFirstMessage
      ? `INSTRUCTION: This is the lead's FIRST message. You are in STAGE 1. Welcome them, introduce ${opts.companyName} in one line, then ask ONE question about their purpose (personal home / investment / land to develop). Do NOT mention any property or price. Write 2-3 warm sentences.`
      : `INSTRUCTION: Read the conversation history above carefully. Identify which stage you're in (QUALIFY / PRESENT / CLOSE) and respond accordingly. Keep your reply focused and conversational — never more than 4 sentences unless presenting multiple properties.`,
    "ABSOLUTE RULES: Never invent property names, prices, locations, or appointments. Every factual claim must come from the inventory or market intelligence above. Never be generic.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const model = (opts.model || "gemini-2.5-flash").replace(/^google\//, "");
  const messages = [
    { role: "system", content: sys },
    ...opts.history.slice(-14).map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.message_text,
    })),
    { role: "user", content: opts.userMsg },
  ];

  // Determine which API to use based on model
  const isGroqModel = model.includes("llama") || model.startsWith("mixtral");
  const shouldTryGroqFirst = isGroqModel && opts.groqKey;

  // Try primary model first, then fallback
  if (shouldTryGroqFirst) {
    try {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${opts.groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });
      if (r.ok) {
        const data = await r.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) return reply;
      }
      console.warn(`[groq-fallback] Model ${model} failed, falling back to Gemini`);
    } catch (e: any) {
      console.warn(`[groq-fallback] Groq error: ${e.message}, falling back to Gemini`);
    }
  }

  // Fallback to Gemini
  const geminiModel =
    model.startsWith("llama") || model.startsWith("mixtral") ? "gemini-2.5-flash" : model;

  const r = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.geminiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: geminiModel, messages }),
    },
  );
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return (
    data.choices?.[0]?.message?.content?.trim() ||
    "Thank you for your message. I'll confirm the details and get back to you shortly."
  );
}

async function sendWhatsApp(phoneNumberId: string, accessToken: string, to: string, body: string) {
  const r = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });
  if (!r.ok) console.error("[wa-send]", r.status, await r.text());
}

export default async function handler(request: Request): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const geminiKey = process.env.GEMINI_API_KEY!;
  const groqKey = process.env.GROQ_API_KEY;

  // Meta verification handshake
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

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

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

        const profileRows = await sbFetch(
          supabaseUrl,
          serviceKey,
          `/profiles?user_id=eq.${integ.user_id}&limit=1`,
        );
        const profile = Array.isArray(profileRows) ? profileRows[0] : null;

        const [tagRows, propertyRows] = await Promise.all([
          sbFetch(
            supabaseUrl,
            serviceKey,
            `/market_tags?user_id=eq.${integ.user_id}&select=tag_text&limit=10`,
          ),
          sbFetch(
            supabaseUrl,
            serviceKey,
            `/properties?user_id=eq.${integ.user_id}&status=eq.available&select=name,location,size_sqm,price,title_type&limit=10`,
          ),
        ]);
        const marketTags = Array.isArray(tagRows) ? tagRows.map((t: any) => t.tag_text) : [];
        const properties = Array.isArray(propertyRows) ? propertyRows : [];

        for (const msg of messages) {
          if (msg.type !== "text") continue;
          const fromPhone = msg.from as string;
          const text = msg.text?.body as string;
          const waMsgId = msg.id as string;
          if (!text) continue;

          const leadRows = await sbFetch(
            supabaseUrl,
            serviceKey,
            `/leads?user_id=eq.${integ.user_id}&phone=eq.${encodeURIComponent(fromPhone)}&limit=1`,
          );
          let lead = Array.isArray(leadRows) ? leadRows[0] : null;

          if (!lead) {
            const contactName = value.contacts?.[0]?.profile?.name || `WA ${fromPhone.slice(-4)}`;
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

          await sbFetch(supabaseUrl, serviceKey, `/conversations`, {
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

          await sbFetch(supabaseUrl, serviceKey, `/leads?id=eq.${lead.id}`, {
            method: "PATCH",
            body: JSON.stringify({ last_touch_at: new Date().toISOString() }),
          });

          if (lead.ai_paused) continue;

          const history = await sbFetch(
            supabaseUrl,
            serviceKey,
            `/conversations?lead_id=eq.${lead.id}&select=role,message_text&order=created_at.asc&limit=20`,
          );

          const userModel = profile?.ai_model || "groq/llama-3.3-70b-versatile";
          const finalModel = userModel.includes("gemini")
            ? "groq/llama-3.3-70b-versatile"
            : userModel;

          let reply = "";
          try {
            reply = await generateAIReply({
              geminiKey,
              groqKey,
              model: finalModel,
              persona: profile?.persona || "apex_closer",
              language: profile?.language || "english_ng",
              history: Array.isArray(history) ? history : [],
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
            continue;
          }

          if (integ.access_token && integ.phone_number_id) {
            await sendWhatsApp(integ.phone_number_id, integ.access_token, fromPhone, reply);
          }

          await sbFetch(supabaseUrl, serviceKey, `/conversations`, {
            method: "POST",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({
              user_id: integ.user_id,
              lead_id: lead.id,
              role: "ai",
              message_text: reply,
              annotation: "↳ AI auto-reply (WhatsApp Cloud API)",
            }),
          });
        }

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
