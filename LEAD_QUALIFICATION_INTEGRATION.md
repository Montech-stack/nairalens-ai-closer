/**
 * LEAD QUALIFICATION FLOW INTEGRATION GUIDE
 * 
 * This shows how to use startPropertyQualification in your whatsapp-webhook.ts
 */

// ═════════════════════════════════════════════════════════════════════════
// STEP 1: Import the qualification function
// ═════════════════════════════════════════════════════════════════════════
import { startPropertyQualification } from "@/integrations/qualification";
import { sendWhatsApp } from "@/integrations/twilio"; // You'll need this to send messages


// ═════════════════════════════════════════════════════════════════════════
// STEP 2: After creating a new lead, send the qualification prompt
// ═════════════════════════════════════════════════════════════════════════
// Replace this section in your handler, after creating the lead:

// BEFORE: Just send AI reply
// const reply = await generateAIReply({ ... });
// await sendWhatsApp(phoneNumberId, accessToken, toPhone, reply);

// AFTER: Send qualification buttons on first message
if (!existingLead) {
  // This is a NEW lead - send the qualification buttons
  const qualificationMessage = startPropertyQualification(toPhone);
  
  await sendWhatsApp(
    integration.phone_number_id,
    integration.access_token,
    toPhone,
    qualificationMessage
  );
  
  // Save this to the conversation for context
  await supabaseAdmin.from("conversations").insert({
    user_id: integration.user_id,
    lead_id: lead.id,
    role: "ai",
    message_text: "Which area are you currently interested in? [Abuja | Lagos | Other]",
    annotation: "↳ Qualification flow started - area selection",
  });
} else {
  // Existing lead - handle as normal with AI reply
  const reply = await generateAIReply({ ... });
  await sendWhatsApp(phoneNumberId, accessToken, toPhone, reply);
}


// ═════════════════════════════════════════════════════════════════════════
// STEP 3: Parse their response when they select a button
// ═════════════════════════════════════════════════════════════════════════
import { parseAreaResponse } from "@/integrations/qualification";

// When the lead responds with a button selection:
const selectedArea = parseAreaResponse(incomingMessage);
if (selectedArea) {
  // Save their area preference to the lead record
  await supabaseAdmin
    .from("leads")
    .update({
      metadata: {
        ...lead.metadata,
        preferred_area: selectedArea,
        qualified_area: true,
      },
    })
    .eq("id", lead.id);
    
  // Now proceed with AI to understand budget/intent
  const reply = await generateAIReply({
    userMsg: incomingMessage,
    // ... other params
  });
  
  await sendWhatsApp(phoneNumberId, accessToken, toPhone, reply);
}


// ═════════════════════════════════════════════════════════════════════════
// COMPLETE FLOW EXAMPLE
// ═════════════════════════════════════════════════════════════════════════
/*
1️⃣  User sends first WhatsApp message
   ↓
2️⃣  Webhook receives it, creates a new lead entry
   ↓
3️⃣  Call startPropertyQualification(toPhone)
   ↓
4️⃣  User sees three buttons: "Abuja", "Lagos", "Other"
   ↓
5️⃣  User taps one button (e.g., "Abuja")
   ↓
6️⃣  Their selection is parsed and saved to lead.metadata
   ↓
7️⃣  Conversation continues with AI (STAGE 1: QUALIFY)
   ↓
8️⃣  Rest of your normal flow continues...
*/


// ═════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═════════════════════════════════════════════════════════════════════════
export { startPropertyQualification, parseAreaResponse, AREA_MAPPING } from "@/integrations/qualification";
