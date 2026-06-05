import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateFollowUp, sendMetaWhatsApp, sendTwilioMessage } from "@/lib/followup-ai";

export const Route = createFileRoute("/api/private/manual-followup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Auth — require valid Supabase JWT
        const token = request.headers.get("Authorization")?.replace("Bearer ", "");
        if (!token) return new Response("Unauthorized", { status: 401 });

        const {
          data: { user },
          error: authErr,
        } = await supabaseAdmin.auth.getUser(token);
        if (authErr || !user) return new Response("Unauthorized", { status: 401 });

        // Parse body
        let lead_id: string;
        try {
          const body = await request.json();
          lead_id = body.lead_id;
          if (!lead_id) throw new Error("missing lead_id");
        } catch {
          return new Response("Bad request: missing lead_id", { status: 400 });
        }

        // Verify lead belongs to this user and has a phone
        const { data: lead } = await supabaseAdmin
          .from("leads")
          .select("id, name, phone, followup_count")
          .eq("id", lead_id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!lead) {
          return new Response(
            JSON.stringify({ error: "Lead not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } },
          );
        }
        if (!lead.phone) {
          return new Response(
            JSON.stringify({ error: "Lead has no phone number on record" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        // Get the connected WhatsApp integration
        const { data: integ } = await supabaseAdmin
          .from("whatsapp_integrations")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!integ || integ.status !== "connected") {
          return new Response(
            JSON.stringify({ error: "WhatsApp not connected. Configure it in Settings." }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        // Pull conversation history
        const { data: history } = await supabaseAdmin
          .from("conversations")
          .select("role, message_text, created_at")
          .eq("lead_id", lead_id)
          .order("created_at", { ascending: true })
          .limit(20);

        // Get AI profile settings
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("ai_model, persona")
          .eq("user_id", user.id)
          .maybeSingle();

        // Generate the follow-up message
        let reply: string | null = null;
        try {
          reply = await generateFollowUp({
            model: profile?.ai_model || "groq/llama-3.3-70b-versatile",
            persona: profile?.persona || "apex_closer",
            history: history ?? [],
            leadName: lead.name,
          });
        } catch (e: any) {
          return new Response(
            JSON.stringify({ error: `AI generation failed: ${e.message}` }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        if (!reply) {
          return new Response(
            JSON.stringify({ error: "AI could not generate a message. Try again." }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        // Send via appropriate provider
        const isTwilio = integ.phone_number_id === "twilio";
        try {
          if (isTwilio) {
            const sid = process.env.TWILIO_ACCOUNT_SID;
            const twilioToken = process.env.TWILIO_AUTH_TOKEN;
            if (!sid || !twilioToken || !integ.business_phone) {
              return new Response(
                JSON.stringify({ error: "Twilio credentials not fully configured" }),
                { status: 500, headers: { "Content-Type": "application/json" } },
              );
            }
            await sendTwilioMessage(sid, twilioToken, integ.business_phone, lead.phone, reply);
          } else {
            if (!integ.phone_number_id || !integ.access_token) {
              return new Response(
                JSON.stringify({ error: "Meta credentials not configured" }),
                { status: 500, headers: { "Content-Type": "application/json" } },
              );
            }
            await sendMetaWhatsApp(integ.phone_number_id, integ.access_token, lead.phone, reply);
          }
        } catch (e: any) {
          return new Response(
            JSON.stringify({ error: `WhatsApp send failed: ${e.message}` }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          );
        }

        // Log to conversations and update lead
        await Promise.all([
          supabaseAdmin.from("conversations").insert({
            user_id: user.id,
            lead_id,
            role: "ai",
            message_text: reply,
            annotation: "↳ Manual follow-up (sent from dashboard)",
          }),
          supabaseAdmin
            .from("leads")
            .update({ last_touch_at: new Date().toISOString() })
            .eq("id", lead_id),
        ]);

        return new Response(JSON.stringify({ ok: true, message: reply }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
