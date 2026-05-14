import { formatButtonMessage } from "./twilio";

/**
 * Start the property qualification flow with a new lead.
 * Asks them which area they're interested in with location buttons.
 * 
 * @param toPhone - The lead's WhatsApp phone number
 * @returns A WhatsApp-formatted interactive button message
 */
export function startPropertyQualification(toPhone: string): Record<string, unknown> {
  console.log(`[qualification] Starting property qualification for: ${toPhone}`);
  
  return formatButtonMessage(
    "Which area are you currently interested in?",
    ["Abuja", "Lagos", "Other"]
  );
}

/**
 * Map button responses to area codes for later filtering
 */
export const AREA_MAPPING: Record<string, string> = {
  abuja: "FCT",
  lagos: "LAGOS",
  other: "OTHER",
};

/**
 * Get the area code from a button response
 */
export function parseAreaResponse(buttonTitle: string): string | null {
  const normalized = buttonTitle.toLowerCase();
  return AREA_MAPPING[normalized] || null;
}
