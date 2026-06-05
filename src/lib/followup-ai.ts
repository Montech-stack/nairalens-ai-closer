// ─────────────────────────────────────────────
// SHARED AI ENGINE FOR FOLLOW-UP GENERATION
// Used by both the cron trigger and manual-followup endpoints
// ─────────────────────────────────────────────

async function callProvider(
  provider: "groq" | "gemini",
  model: string,
  messages: { role: string; content: string }[],
): Promise<string | null> {
  if (provider === "groq") {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY not configured");
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, max_tokens: 120, temperature: 0.75 }),
    });
    if (!r.ok) throw new Error(`Groq ${r.status}: ${await r.text()}`);
    const d = await r.json();
    return d.choices?.[0]?.message?.content?.trim() || null;
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
  const r = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, max_tokens: 120, temperature: 0.75 }),
    },
  );
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${await r.text()}`);
  const d = await r.json();
  return d.choices?.[0]?.message?.content?.trim() || null;
}

const PERSONA_LINES: Record<string, string> = {
  apex_closer: "You are ARIA — a sharp, direct Nigerian real estate closer.",
  diaspora_whisperer:
    "You are ARIA — a patient, evidence-led real estate agent for Nigerian diaspora buyers.",
  hni_concierge:
    "You are ARIA — a polished concierge for ultra-high-net-worth real estate buyers.",
};

export async function generateFollowUp(opts: {
  model: string;
  persona: string;
  history: { role: string; message_text: string }[];
  leadName: string;
}): Promise<string | null> {
  const systemPrompt = [
    PERSONA_LINES[opts.persona] ?? PERSONA_LINES.apex_closer,
    "",
    `${opts.leadName} went quiet after your last WhatsApp message. Write ONE re-engagement message.`,
    "Rules:",
    "- 1-2 sentences, under 200 characters total",
    "- Do NOT say 'following up', 'checking in', or 'just wanted to'",
    "- Pick up naturally from the last conversation topic",
    "- Create a genuine hook: a new angle, a soft open question, or a time-sensitive note",
    "- Sound warm and human — never robotic, never a template",
    "- Do not start with 'Hi' or 'Hello'",
    "- Output ONLY the message text — no labels, no explanation",
  ].join("\n");

  const messages = [
    { role: "system", content: systemPrompt },
    ...opts.history.slice(-10).map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.message_text,
    })),
    {
      role: "user",
      content: "[The lead has gone quiet. Generate your follow-up message now.]",
    },
  ];

  const raw = (opts.model || "groq/llama-3.3-70b-versatile").trim();
  const primary: "groq" | "gemini" = raw.startsWith("groq/") ? "groq" : "gemini";
  const primaryModel = primary === "groq" ? raw.slice(5) : raw.replace(/^google\//, "");
  const fallback: "groq" | "gemini" = primary === "groq" ? "gemini" : "groq";
  const fallbackModel = fallback === "groq" ? "llama-3.3-70b-versatile" : "gemini-2.5-flash";

  try {
    return await callProvider(primary, primaryModel, messages);
  } catch (e: any) {
    console.warn(`[followup-ai] primary ${primary} failed: ${e.message}, trying ${fallback}`);
    try {
      return await callProvider(fallback, fallbackModel, messages);
    } catch (e2: any) {
      console.error(`[followup-ai] both providers failed: ${e2.message}`);
      return null;
    }
  }
}

// ─────────────────────────────────────────────
// SHARED SENDERS
// ─────────────────────────────────────────────
export async function sendMetaWhatsApp(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  body: string,
) {
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
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Meta ${r.status}: ${err}`);
  }
}

export async function sendTwilioMessage(
  accountSid: string,
  authToken: string,
  from: string,
  to: string,
  body: string,
) {
  const credentials = btoa(`${accountSid}:${authToken}`);
  const r = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: `whatsapp:${from}`,
        To: `whatsapp:${to}`,
        Body: body,
      }).toString(),
    },
  );
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Twilio ${r.status}: ${err}`);
  }
}
