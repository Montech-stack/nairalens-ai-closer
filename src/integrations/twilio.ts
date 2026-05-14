import { z } from "zod";

/**
 * Zod schema for WhatsApp Interactive Button Message payload
 */
export const ButtonMessageSchema = z.object({
  body: z.string().max(1024),
  buttons: z
    .array(
      z.object({
        id: z.string().max(256),
        title: z.string().max(20),
      }),
    )
    .min(1)
    .max(3),
  header: z.string().max(60).optional(),
  footer: z.string().max(60).optional(),
});

export type ButtonMessage = z.infer<typeof ButtonMessageSchema>;

/**
 * Zod schema for WhatsApp Interactive List Message payload
 */
export const ListMessageSchema = z.object({
  body: z.string().max(1024),
  button: z.string().max(20), // The label of the list trigger button
  sections: z
    .array(
      z.object({
        title: z.string().max(24).optional(),
        rows: z
          .array(
            z.object({
              id: z.string().max(200),
              title: z.string().max(24),
              description: z.string().max(72).optional(),
            }),
          )
          .min(1)
          .max(10),
      }),
    )
    .min(1)
    .max(10),
  header: z.string().max(60).optional(),
  footer: z.string().max(60).optional(),
});

export type ListMessage = z.infer<typeof ListMessageSchema>;

/**
 * Helper to send 'typing' status to WhatsApp via Twilio
 * Note: Twilio's WhatsApp API doesn't have a direct 'typing' indicator like the Cloud API 'sender_status'.
 * For Twilio, we typically use the WhatsApp Cloud API directly or wait for Twilio's native support.
 * However, the request asks for 'sender_status: typing' signal to the WhatsApp API.
 */
export async function sendWhatsAppTypingIndicator(
  accessToken: string,
  phoneNumberId: string,
  to: string,
) {
  try {
    await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to,
        sender_status: "typing",
      }),
    });
  } catch (e) {
    console.error("[twilio-typing] Failed to send typing indicator:", e);
  }
}

/**
 * Formats a question and options into a WhatsApp Interactive Button JSON structure
 */
export function formatButtonMessage(question: string, options: string[]): Record<string, unknown> {
  const buttons = options.slice(0, 3).map((opt, i) => ({
    type: "reply",
    reply: {
      id: `btn_${i}`,
      title: opt,
    },
  }));

  return {
    type: "button",
    body: { text: question },
    action: { buttons },
  };
}

/**
 * Formats a question and options into a WhatsApp Interactive List JSON structure
 */
export function formatListMessage(
  question: string,
  buttonLabel: string,
  options: { id: string; title: string; description?: string }[],
): Record<string, unknown> {
  return {
    type: "list",
    body: { text: question },
    action: {
      button: buttonLabel,
      sections: [
        {
          rows: options.slice(0, 10).map((opt) => ({
            id: opt.id,
            title: opt.title,
            description: opt.description,
          })),
        },
      ],
    },
  };
}
