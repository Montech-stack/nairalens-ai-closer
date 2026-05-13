import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, MessageCircle, CheckCircle2, Copy, ExternalLink, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  component: Settings,
});

const PERSONAS = [
  { id: "apex_closer", title: "The Apex Closer", desc: "Out-closes any human. Straight-Line persuasion, urgency engineering, zero hesitation, 24/7." },
  { id: "diaspora_whisperer", title: "The Diaspora Whisperer", desc: "Patient, evidence-driven, multi-timezone. Converts UK/US/Canada-based buyers a top human can't reach in time." },
  { id: "hni_concierge", title: "The HNI Concierge", desc: "Luxury positioning for ultra-HNI deals. Exclusivity, scarcity, and white-glove tone built for ₦500M+ tickets." },
];

function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>({ persona: "apex_closer", language: "english_ng", ai_model: "gemini-2.5-flash", max_followups: 3, response_delay: 5, site_visit_cta: "", price_objection_response: "", closing_triggers: "" });
  const [tags, setTags] = useState<any[]>([]);
  const [newTag, setNewTag] = useState("");
  const [wa, setWa] = useState<any>({ status: "disconnected" });
  const [waDialogOpen, setWaDialogOpen] = useState(false);
  const [waProvider, setWaProvider] = useState<"twilio" | "meta">("twilio");
  const [waForm, setWaForm] = useState({ phone_number_id: "", access_token: "", business_phone: "" });
  const [waSaving, setWaSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const isTwilio = wa.phone_number_id === "twilio";
  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/public/${isTwilio ? "twilio-webhook" : "whatsapp-webhook"}`
    : `/api/public/${isTwilio ? "twilio-webhook" : "whatsapp-webhook"}`;

  const load = async () => {
    const { data: p } = await supabase.from("profiles").select("*").maybeSingle();
    if (p) setProfile({ ...profile, ...p });
    const { data: t } = await supabase.from("market_tags").select("*").order("created_at", { ascending: false });
    setTags(t ?? []);
    const { data: w } = await supabase.from("whatsapp_integrations").select("*").maybeSingle();
    if (w) {
      setWa(w);
      setWaForm({ phone_number_id: w.phone_number_id || "", access_token: w.access_token || "", business_phone: w.business_phone || "" });
    }
  };
  useEffect(() => { if (user) load(); }, [user]);

  const save = async () => {
    if (!user) return;
    await supabase.from("profiles").update({
      persona: profile.persona, language: profile.language, ai_model: profile.ai_model,
      max_followups: profile.max_followups, response_delay: profile.response_delay,
      site_visit_cta: profile.site_visit_cta, price_objection_response: profile.price_objection_response,
      closing_triggers: profile.closing_triggers,
    }).eq("user_id", user.id);
    toast.success("Settings saved. AI prompt updated.");
  };

  const saveWhatsApp = async () => {
    if (!user) return;
    if (!waForm.phone_number_id.trim() || !waForm.access_token.trim()) {
      toast.error("Phone Number ID and Access Token are required.");
      return;
    }
    setWaSaving(true);
    const verifyToken = wa.verify_token || Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const { data: existing } = await supabase.from("whatsapp_integrations").select("id").eq("user_id", user.id).maybeSingle();
    if (existing) {
      await supabase.from("whatsapp_integrations").update({
        phone_number_id: waForm.phone_number_id.trim(),
        access_token: waForm.access_token.trim(),
        business_phone: waForm.business_phone.trim() || null,
        verify_token: verifyToken,
        status: "pending",
      }).eq("user_id", user.id);
    } else {
      await supabase.from("whatsapp_integrations").insert({
        user_id: user.id,
        phone_number_id: waForm.phone_number_id.trim(),
        access_token: waForm.access_token.trim(),
        business_phone: waForm.business_phone.trim() || null,
        verify_token: verifyToken,
        status: "pending",
      });
    }
    await load();
    setWaSaving(false);
    setWaDialogOpen(false);
    toast.success("WhatsApp credentials saved. Paste the webhook URL into Meta to activate.");
  };

  const disconnectWhatsApp = async () => {
    if (!user) return;
    await supabase.from("whatsapp_integrations").update({ status: "disconnected", access_token: null }).eq("user_id", user.id);
    setWa({ status: "disconnected" });
    toast.success("WhatsApp disconnected.");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied.`);
  };

  const addTag = async () => {
    if (!user || !newTag.trim()) return;
    const { data } = await supabase.from("market_tags").insert({ user_id: user.id, tag_text: newTag.trim() }).select().single();
    if (data) setTags([data, ...tags]);
    setNewTag("");
    toast.success("Tag broadcast to all sessions.");
  };
  const delTag = async (id: string) => {
    await supabase.from("market_tags").delete().eq("id", id);
    setTags(tags.filter((t) => t.id !== id));
  };

  const isConnected = wa.status === "connected";

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Connect Leads */}
      <div className="glass-gold rounded-2xl p-6">
        <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="font-serif text-xl">Connect Leads</h3>
              <p className="text-sm text-muted-foreground max-w-xl mt-0.5">
                Link your WhatsApp Business number. Every inbound message gets qualified and closed by the AI automatically.
              </p>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-mono border shrink-0 ${isConnected ? "bg-success/15 text-success border-success/40" : "bg-border/30 text-muted-foreground border-border"}`}>
            {isConnected ? "● CONNECTED" : "○ NOT CONNECTED"}
          </span>
        </div>

        <div className="rounded-xl border border-gold/25 bg-noir-elevated/40 p-5 flex flex-col gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <MessageCircle className="w-4 h-4 text-gold" />
              <span className="font-mono text-[10px] text-gold uppercase tracking-wider">WhatsApp Business</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect via Twilio Sandbox (free, instant) or Meta Cloud API (production). NairaLens handles every inbound chat automatically.
            </p>
          </div>
          {wa.business_phone && (
            <div className="text-xs font-mono text-success flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3" /> {wa.business_phone}
            </div>
          )}
          {wa.verify_token && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2 bg-noir rounded-lg px-3 py-2 border border-border">
                <span className="font-mono text-muted-foreground truncate">
                  <span className="text-gold">{isTwilio ? "Twilio" : "Meta"} URL: </span>{webhookUrl}
                </span>
                <button onClick={() => copyToClipboard(webhookUrl, "Webhook URL")} className="shrink-0 text-gold hover:opacity-80"><Copy className="w-3.5 h-3.5" /></button>
              </div>
              {!isTwilio && (
                <div className="flex items-center justify-between gap-2 bg-noir rounded-lg px-3 py-2 border border-border">
                  <span className="font-mono text-muted-foreground">Verify token: <span className="text-foreground">{wa.verify_token}</span></span>
                  <button onClick={() => copyToClipboard(wa.verify_token, "Verify token")} className="shrink-0 text-gold hover:opacity-80"><Copy className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-2 mt-auto">
            <Button onClick={() => setWaDialogOpen(true)} className="flex-1 bg-gold text-noir hover:bg-gold/90 font-semibold">
              {isConnected ? "Reconfigure" : "Connect Leads"}
            </Button>
            {isConnected && (
              <Button variant="outline" onClick={disconnectWhatsApp} className="border-danger/40 text-danger hover:bg-danger/10">
                Disconnect
              </Button>
            )}
          </div>
        </div>

        {wa.last_event_at && (
          <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-xs text-success font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" /> Last lead received {new Date(wa.last_event_at).toLocaleString()}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
      {/* LEFT */}
      <div className="space-y-5">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-serif text-xl mb-4">Sales Persona</h3>
          <div className="space-y-3">
            {PERSONAS.map((p) => (
              <button key={p.id} onClick={() => setProfile({ ...profile, persona: p.id })}
                className={`w-full text-left p-4 rounded-xl border transition ${profile.persona === p.id ? "border-gold bg-gold/10" : "border-border hover:border-gold/40"}`}>
                <div className="font-serif text-lg">{p.title}</div>
                <div className="text-sm text-muted-foreground">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-serif text-xl">Model Configuration</h3>
          <Field label="AI Model">
            <Select value={profile.ai_model} onValueChange={(v) => setProfile({ ...profile, ai_model: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="groq/llama-3.3-70b-versatile">Groq · Llama 3.3 70B Versatile (Recommended — best reasoning + speed)</SelectItem>
                <SelectItem value="groq/llama-3.1-8b-instant">Groq · Llama 3.1 8B Instant (Ultra-fast)</SelectItem>
                <SelectItem value="groq/llama-3.1-70b-versatile">Groq · Llama 3.1 70B Versatile</SelectItem>
                <SelectItem value="groq/mixtral-8x7b-32768">Groq · Mixtral 8x7B (Long context)</SelectItem>
                <SelectItem value="groq/gemma2-9b-it">Groq · Gemma2 9B</SelectItem>
                <SelectItem value="groq/deepseek-r1-distill-llama-70b">Groq · DeepSeek R1 Distill 70B (Deep reasoning)</SelectItem>
                <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <p className="text-xs text-muted-foreground -mt-2">
            Whichever you pick is the primary brain. If it fails, NairaLens automatically falls back to the other provider so replies never stop.
          </p>
          <Field label="Response Language">
            <Select value={profile.language} onValueChange={(v) => setProfile({ ...profile, language: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="english_ng">English (Nigerian)</SelectItem>
                <SelectItem value="pidgin">Pidgin</SelectItem>
                <SelectItem value="hausa_en">Hausa + English</SelectItem>
                <SelectItem value="yoruba_en">Yoruba + English</SelectItem>
                <SelectItem value="igbo_en">Igbo + English</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Max Follow-up Attempts"><Input type="number" min={1} max={10} value={profile.max_followups} onChange={(e) => setProfile({ ...profile, max_followups: Number(e.target.value) })} /></Field>
          <Field label={`Response Delay — ${profile.response_delay}s`}>
            <Slider value={[profile.response_delay]} max={30} step={1} onValueChange={(v) => setProfile({ ...profile, response_delay: v[0] })} />
          </Field>
        </div>
      </div>

      {/* RIGHT */}
      <div className="space-y-5">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-serif text-xl mb-1">Market Intelligence Tags</h3>
          <p className="text-sm text-muted-foreground mb-4">Live facts injected into every active AI session.</p>
          <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
            {tags.length === 0 && <p className="text-xs text-muted-foreground">No tags yet.</p>}
            {tags.map((t) => (
              <span key={t.id} className="px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-mono inline-flex items-center gap-2">
                {t.tag_text}
                <button onClick={() => delTag(t.id)} className="hover:text-foreground"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add a market fact…" onKeyDown={(e) => e.key === "Enter" && addTag()} />
            <Button onClick={addTag} className="bg-gold text-noir hover:bg-gold/90">Add</Button>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-serif text-xl">Closing Triggers</h3>
          <Field label="Trigger phrases (comma-separated)">
            <Textarea rows={2} value={profile.closing_triggers} onChange={(e) => setProfile({ ...profile, closing_triggers: e.target.value })} placeholder="ready to buy, when can I see, send account details" />
          </Field>
          <Field label="Site Visit CTA template">
            <Textarea rows={3} value={profile.site_visit_cta} onChange={(e) => setProfile({ ...profile, site_visit_cta: e.target.value })} placeholder="Sir, I'll personally walk you through Plot 14 tomorrow at 11am — shall I confirm?" />
          </Field>
          <Field label="Price Objection Response">
            <Textarea rows={3} value={profile.price_objection_response} onChange={(e) => setProfile({ ...profile, price_objection_response: e.target.value })} placeholder="Our pricing reflects the C of O title and Maitama 2027 infrastructure plan…" />
          </Field>
          <Button onClick={save} className="w-full bg-gold text-noir hover:bg-gold/90 font-semibold">Save Settings</Button>
        </div>
      </div>
      </div>

      {/* WhatsApp Connect Dialog */}
      <Dialog open={waDialogOpen} onOpenChange={setWaDialogOpen}>
        <DialogContent className="bg-noir-elevated border-gold/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Connect WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            {/* Provider toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-noir rounded-lg border border-border">
              <button onClick={() => setWaProvider("twilio")}
                className={`py-2 rounded-md text-xs font-mono transition ${waProvider === "twilio" ? "bg-gold text-noir font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
                Twilio Sandbox
              </button>
              <button onClick={() => setWaProvider("meta")}
                className={`py-2 rounded-md text-xs font-mono transition ${waProvider === "meta" ? "bg-gold text-noir font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
                Meta Cloud API
              </button>
            </div>

            {waProvider === "twilio" ? (
              <>
                <div className="rounded-lg bg-noir border border-gold/20 p-3 space-y-1 text-xs text-muted-foreground">
                  <p className="font-mono text-[10px] text-gold uppercase tracking-wider mb-2">Twilio Sandbox Setup</p>
                  <div>1. Sign up free at <a href="https://twilio.com" target="_blank" rel="noreferrer" className="text-gold underline">twilio.com</a></div>
                  <div>2. Console → Messaging → Try it out → Send a WhatsApp message</div>
                  <div>3. Copy the sandbox number (e.g. +14155238886)</div>
                  <div>4. Set webhook URL in Twilio → "When a message comes in"</div>
                </div>
                <Field label="Twilio Sandbox Number (e.g. +14155238886)">
                  <Input value={waForm.business_phone} onChange={(e) => setWaForm({ ...waForm, business_phone: e.target.value, phone_number_id: "twilio", access_token: "twilio" })}
                    placeholder="+14155238886" className="font-mono text-sm" />
                </Field>
                {wa.verify_token && (
                  <div className="flex items-center justify-between gap-2 bg-noir rounded-lg px-3 py-2 border border-border text-xs">
                    <span className="font-mono text-muted-foreground truncate">Webhook URL: <span className="text-foreground">{typeof window !== "undefined" ? `${window.location.origin}/api/public/twilio-webhook` : "/api/public/twilio-webhook"}</span></span>
                    <button onClick={() => copyToClipboard(typeof window !== "undefined" ? `${window.location.origin}/api/public/twilio-webhook` : "", "Webhook URL")} className="shrink-0 text-gold hover:opacity-80"><Copy className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-muted-foreground">Get these from your <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-gold underline inline-flex items-center gap-1">Meta Developer App <ExternalLink className="w-3 h-3" /></a> → WhatsApp → API Setup.</p>
                <Field label="Phone Number ID">
                  <Input value={waForm.phone_number_id} onChange={(e) => setWaForm({ ...waForm, phone_number_id: e.target.value })} placeholder="e.g. 123456789012345" className="font-mono text-sm" />
                </Field>
                <Field label="Permanent Access Token">
                  <div className="relative">
                    <Input type={showToken ? "text" : "password"} value={waForm.access_token}
                      onChange={(e) => setWaForm({ ...waForm, access_token: e.target.value })}
                      placeholder="Paste your permanent token" className="font-mono text-sm pr-10" />
                    <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>
                <Field label="Business Phone Number">
                  <Input value={waForm.business_phone} onChange={(e) => setWaForm({ ...waForm, business_phone: e.target.value })} placeholder="+2348012345678" className="font-mono text-sm" />
                </Field>
                {wa.verify_token && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2 bg-noir rounded-lg px-3 py-2 border border-border">
                      <span className="font-mono text-muted-foreground truncate">{webhookUrl}</span>
                      <button onClick={() => copyToClipboard(webhookUrl, "Webhook URL")} className="shrink-0 text-gold hover:opacity-80"><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="flex items-center justify-between gap-2 bg-noir rounded-lg px-3 py-2 border border-border">
                      <span className="font-mono text-muted-foreground">Verify token: <span className="text-foreground">{wa.verify_token}</span></span>
                      <button onClick={() => copyToClipboard(wa.verify_token, "Verify token")} className="shrink-0 text-gold hover:opacity-80"><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                )}
              </>
            )}

            <Button onClick={saveWhatsApp} disabled={waSaving} className="w-full bg-gold text-noir hover:bg-gold/90 font-semibold">
              {waSaving ? "Saving…" : "Save & Activate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: any) {
  return <div><Label className="text-xs font-mono text-muted-foreground uppercase">{label}</Label><div className="mt-1.5">{children}</div></div>;
}
