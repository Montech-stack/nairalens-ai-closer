import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateFollowUp, sendMetaWhatsApp, sendTwilioMessage } from "@/lib/followup-ai";

// ─────────────────────────────────────────────
// ROUTE — called by external cron every hour
// Required header: x-cron-secret: <CRON_SECRET env var>
// ─────────────────────────────────────────────
export const Route = createFileRoute("/api/public/followup-trigger")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = request.headers.get("x-cron-secret");
        if (!secret || secret !== process.env.CRON_SECRET) {
          return new Response("Unauthorized", { status: 401 });
        }

        let totalSent = 0;
        let totalSkipped = 0;
        const errors: string[] = [];

        try {
          const { data: integrations } = await supabaseAdmin
            .from("whatsapp_integrations")
            .select("*")
            .eq("status", "connected");

          for (const integ of integrations ?? []) {
            const isTwilio = integ.phone_number_id === "twilio";

            const { data: profile } = await supabaseAdmin
              .from("profiles")
              .select("ai_model, persona, max_followups")
              .eq("user_id", integ.user_id)
              .maybeSingle();

            const maxFollowups = profile?.max_followups ?? 3;

            const { data: leads } = await supabaseAdmin
              .from("leads")
              .select("id, phone, name, followup_count")
              .eq("user_id", integ.user_id)
              .eq("ai_paused", false)
              .lt("followup_count", maxFollowups)
              .not("phone", "is", null);

            for (const lead of leads ?? []) {
              try {
                const { data: convos } = await supabaseAdmin
                  .from("conversations")
                  .select("role, message_text, created_at")
                  .eq("lead_id", lead.id)
                  .order("created_at", { ascending: false })
                  .limit(20);

                if (!convos || convos.length === 0) { totalSkipped++; continue; }

                const lastMsg = convos[0];

                // Only follow up if the AI sent the last message (lead went quiet)
                if (lastMsg.role !== "ai") { totalSkipped++; continue; }

                const lastAiAgeHours =
                  (Date.now() - new Date(lastMsg.created_at!).getTime()) / 3_600_000;

                // Follow-up window: 3 hours to 72 hours after last AI message
                if (lastAiAgeHours < 3 || lastAiAgeHours > 72) { totalSkipped++; continue; }

                // Meta Cloud API enforces a 24h messaging window from the lead's last message
                if (!isTwilio) {
                  const lastLeadMsg = convos.find((c) => c.role === "lead");
                  if (!lastLeadMsg) { totalSkipped++; continue; }
                  const lastLeadAgeHours =
                    (Date.now() - new Date(lastLeadMsg.created_at!).getTime()) / 3_600_000;
                  if (lastLeadAgeHours > 23) { totalSkipped++; continue; }
                }

                // Generate re-engagement message (oldest-first history for context)
                const history = [...convos].reverse();
                const reply = await generateFollowUp({
                  model: profile?.ai_model || "groq/llama-3.3-70b-versatile",
                  persona: profile?.persona || "apex_closer",
                  history,
                  leadName: lead.name,
                });

                if (!reply) { totalSkipped++; continue; }

                // Send via appropriate provider
                if (isTwilio) {
                  const sid = process.env.TWILIO_ACCOUNT_SID;
                  const token = process.env.TWILIO_AUTH_TOKEN;
                  if (!sid || !token || !integ.business_phone) {
                    errors.push(`lead ${lead.id}: Twilio env vars missing`);
                    continue;
                  }
                  await sendTwilioMessage(sid, token, integ.business_phone, lead.phone!, reply);
                } else {
                  if (!integ.phone_number_id || !integ.access_token) {
                    errors.push(`lead ${lead.id}: Meta credentials missing`);
                    continue;
                  }
                  await sendMetaWhatsApp(integ.phone_number_id, integ.access_token, lead.phone!, reply);
                }

                // Log and update
                await Promise.all([
                  supabaseAdmin.from("conversations").insert({
                    user_id: integ.user_id,
                    lead_id: lead.id,
                    role: "ai",
                    message_text: reply,
                    annotation: `↳ AI follow-up #${(lead.followup_count ?? 0) + 1} (auto)`,
                  }),
                  supabaseAdmin
                    .from("leads")
                    .update({
                      followup_count: (lead.followup_count ?? 0) + 1,
                      last_touch_at: new Date().toISOString(),
                    })
                    .eq("id", lead.id),
                ]);

                totalSent++;
              } catch (e: any) {
                errors.push(`lead ${lead.id}: ${e.message}`);
              }
            }
          }
        } catch (e: any) {
          console.error("[followup-trigger] Fatal:", e.message);
          return new Response(JSON.stringify({ ok: false, error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        console.log(
          `[followup-trigger] sent=${totalSent} skipped=${totalSkipped} errors=${errors.length}`,
        );
        return new Response(
          JSON.stringify({ ok: true, sent: totalSent, skipped: totalSkipped, errors }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
