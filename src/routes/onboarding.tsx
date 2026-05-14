import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  Database,
  FileText,
  Tag,
  MessageCircle,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get Started — NairaLens" }] }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // If already signed in, skip the account step entirely.
  const skipAccount = !!user;
  const TOTAL_STEPS = skipAccount ? 6 : 7;
  const startStep = skipAccount ? 1 : 0; // 0 = account creation
  const [step, setStep] = useState(startStep);

  useEffect(() => {
    // re-sync when auth resolves
    if (!authLoading) setStep(user ? 1 : 0);
  }, [authLoading, user]);

  const [signup, setSignup] = useState({ name: "", email: "", password: "", confirm: "" });
  const [company, setCompany] = useState({
    company_name: "",
    whatsapp_number: "",
    city: "Abuja",
    agents_count: 1,
    monthly_lead_volume: "0-100",
    primary_property_type: "Land",
  });
  const [perf, setPerf] = useState({
    years_experience: 1,
    deals_last_quarter: 0,
    avg_deal_size: "",
    monthly_revenue_target: "",
    biggest_challenge: "",
  });
  const [property, setProperty] = useState({
    name: "",
    location: "",
    size_sqm: "",
    price: "",
    title_type: "C of O",
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [vault, setVault] = useState({
    tags: ["Abuja master plan expansion", "Lekki-Epe corridor appreciation"],
  });
  const [newTag, setNewTag] = useState("");
  const [brain, setBrain] = useState({ persona: "apex_closer", language: "english_ng" });
  const [loading, setLoading] = useState(false);

  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const prev = () => setStep((s) => Math.max(skipAccount ? 1 : 0, s - 1));

  const submitAccount = async (e: FormEvent) => {
    e.preventDefault();
    if (signup.password !== signup.confirm) return toast.error("Passwords don't match");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signup.email,
        password: signup.password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: { full_name: signup.name },
        },
      });
      if (error) throw error;
      navigate({ to: "/confirm-email", search: { email: signup.email } });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requireUser = async () => {
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    if (!u) throw new Error("Please sign in again.");
    return u;
  };

  const submitCompany = async () => {
    setLoading(true);
    try {
      const u = await requireUser();
      await supabase
        .from("profiles")
        .update({
          company_name: company.company_name,
          whatsapp_number: company.whatsapp_number,
          city: company.city,
          agents_count: company.agents_count,
          monthly_lead_volume: company.monthly_lead_volume,
          primary_property_type: company.primary_property_type,
        })
        .eq("user_id", u.id);
      next();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitPerf = async () => {
    setLoading(true);
    try {
      const u = await requireUser();
      await supabase
        .from("profiles")
        .update({
          years_experience: perf.years_experience,
          deals_last_quarter: perf.deals_last_quarter,
          avg_deal_size: Number(perf.avg_deal_size) || null,
          monthly_revenue_target: Number(perf.monthly_revenue_target) || null,
          biggest_challenge: perf.biggest_challenge,
        })
        .eq("user_id", u.id);
      next();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitProperty = async (skip = false) => {
    setLoading(true);
    try {
      if (!skip && (property.name.trim() || property.location.trim())) {
        const u = await requireUser();
        let document_url: string | null = null;
        if (documentFile) {
          const path = `${u.id}/${Date.now()}-${documentFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from("legal-documents")
            .upload(path, documentFile);
          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage.from("legal-documents").getPublicUrl(path);
          document_url = urlData.publicUrl;
        }
        await supabase.from("properties").insert({
          user_id: u.id,
          name: property.name,
          location: property.location,
          size_sqm: Number(property.size_sqm) || null,
          price: Number(property.price) || null,
          title_type: property.title_type,
          status: "available",
          document_url,
        });
      }
      next();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitVault = async () => {
    setLoading(true);
    try {
      const u = await requireUser();
      const tagRows = vault.tags.map((t) => ({ user_id: u.id, tag_text: t }));
      if (tagRows.length) await supabase.from("market_tags").insert(tagRows);
      next();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitBrain = async () => {
    setLoading(true);
    try {
      const u = await requireUser();
      await supabase
        .from("profiles")
        .update({ persona: brain.persona, language: brain.language })
        .eq("user_id", u.id);
      next();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [waDialogOpen, setWaDialogOpen] = useState(false);
  const [waProvider, setWaProvider] = useState<"twilio" | "meta">("twilio");
  const [waForm, setWaForm] = useState({
    phone_number_id: "",
    access_token: "",
    business_phone: "",
  });
  const [waSaving, setWaSaving] = useState(false);
  const [waConnected, setWaConnected] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const saveWhatsApp = async () => {
    try {
      const u = await requireUser();
      if (!waForm.business_phone.trim()) {
        toast.error("Phone number is required.");
        return;
      }
      setWaSaving(true);
      const verifyToken = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      const { data: existing } = await supabase
        .from("whatsapp_integrations")
        .select("id")
        .eq("user_id", u.id)
        .maybeSingle();
      const payload = {
        phone_number_id: waForm.phone_number_id.trim() || "twilio",
        access_token: waForm.access_token.trim() || "twilio",
        business_phone: waForm.business_phone.trim(),
        verify_token: verifyToken,
        status: "pending",
      };
      if (existing) {
        await supabase.from("whatsapp_integrations").update(payload).eq("user_id", u.id);
      } else {
        await supabase.from("whatsapp_integrations").insert({ user_id: u.id, ...payload });
      }
      setWaConnected(true);
      setWaDialogOpen(false);
      toast.success(
        "WhatsApp connected. Paste the webhook URL into " +
          (waProvider === "twilio" ? "Twilio." : "Meta."),
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setWaSaving(false);
    }
  };

  const finish = async () => {
    setLoading(true);
    try {
      const u = await requireUser();
      await supabase.from("profiles").update({ onboarding_complete: true }).eq("user_id", u.id);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stepNumber = skipAccount ? step : step + 1;
  const progress = (stepNumber / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen gradient-mesh flex flex-col">
      <header className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between max-w-5xl w-full mx-auto">
        <Logo size="md" />
        <div className="text-[10px] sm:text-xs font-mono text-muted-foreground">
          STEP {stepNumber} OF {TOTAL_STEPS}
        </div>
      </header>
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6">
        <div className="h-1 bg-noir-elevated rounded-full overflow-hidden">
          <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex items-start sm:items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl">
          {step === 0 && !user && (
            <Card
              title="Create Your Account"
              subtitle="Spin up your AI sales brain — takes 30 seconds."
            >
              <form onSubmit={submitAccount} className="space-y-4">
                <Field label="Full name">
                  <Input
                    value={signup.name}
                    onChange={(e) => setSignup({ ...signup, name: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={signup.email}
                    onChange={(e) => setSignup({ ...signup, email: e.target.value })}
                    required
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Password">
                    <PasswordInput
                      value={signup.password}
                      onChange={(v) => setSignup({ ...signup, password: v })}
                    />
                  </Field>
                  <Field label="Confirm">
                    <PasswordInput
                      value={signup.confirm}
                      onChange={(v) => setSignup({ ...signup, confirm: v })}
                    />
                  </Field>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">
                  <Link to="/auth" className="text-sm text-muted-foreground hover:text-gold">
                    Already have an account? Sign in
                  </Link>
                  <PrimaryBtn loading={loading} type="submit">
                    Continue
                  </PrimaryBtn>
                </div>
              </form>
            </Card>
          )}

          {step === 1 && (
            <Card
              title={`Welcome${user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}`}
              subtitle="Tell us who you sell for."
            >
              <div className="space-y-4">
                <Field label="Company name">
                  <Input
                    value={company.company_name}
                    onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
                    placeholder="Acme Realty Ltd"
                  />
                </Field>
                <Field label="WhatsApp Business number">
                  <Input
                    placeholder="+234..."
                    value={company.whatsapp_number}
                    onChange={(e) => setCompany({ ...company, whatsapp_number: e.target.value })}
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Primary city">
                    <Select
                      value={company.city}
                      onValueChange={(v) => setCompany({ ...company, city: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Lagos",
                          "Abuja",
                          "Port Harcourt",
                          "Kano",
                          "Ibadan",
                          "Enugu",
                          "Other",
                        ].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Primary property type">
                    <Select
                      value={company.primary_property_type}
                      onValueChange={(v) => setCompany({ ...company, primary_property_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Land",
                          "Detached houses",
                          "Terraces",
                          "Apartments",
                          "Mixed-use",
                          "Commercial",
                        ].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Agents on team">
                    <Input
                      type="number"
                      min={1}
                      value={company.agents_count}
                      onChange={(e) =>
                        setCompany({ ...company, agents_count: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label="Monthly lead volume">
                    <Select
                      value={company.monthly_lead_volume}
                      onValueChange={(v) => setCompany({ ...company, monthly_lead_volume: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["0-100", "100-500", "500-1000", "1000+"].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <NavRow
                  onPrev={skipAccount ? undefined : prev}
                  onNext={submitCompany}
                  loading={loading}
                />
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card
              title="Your Sales Performance"
              subtitle="So the AI can benchmark and beat your current numbers."
            >
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Years in real estate">
                    <Input
                      type="number"
                      min={0}
                      value={perf.years_experience}
                      onChange={(e) =>
                        setPerf({ ...perf, years_experience: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label="Deals closed last quarter">
                    <Input
                      type="number"
                      min={0}
                      value={perf.deals_last_quarter}
                      onChange={(e) =>
                        setPerf({ ...perf, deals_last_quarter: Number(e.target.value) })
                      }
                    />
                  </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Average deal size (₦)">
                    <Input
                      type="number"
                      placeholder="50000000"
                      value={perf.avg_deal_size}
                      onChange={(e) => setPerf({ ...perf, avg_deal_size: e.target.value })}
                    />
                  </Field>
                  <Field label="Monthly revenue target (₦)">
                    <Input
                      type="number"
                      placeholder="200000000"
                      value={perf.monthly_revenue_target}
                      onChange={(e) => setPerf({ ...perf, monthly_revenue_target: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Biggest sales challenge right now">
                  <Textarea
                    rows={3}
                    placeholder="e.g. Leads ghost after the first reply. We can't keep up at night. Diaspora buyers need too much hand-holding."
                    value={perf.biggest_challenge}
                    onChange={(e) => setPerf({ ...perf, biggest_challenge: e.target.value })}
                  />
                </Field>
                <div className="px-4 py-3 rounded-lg bg-gold/5 border border-gold/20 text-xs text-muted-foreground">
                  💡 We'll use this to calibrate your AI's tone, urgency, and reply scripts.
                </div>
                <NavRow onPrev={prev} onNext={submitPerf} loading={loading} />
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card
              title="Your First Property"
              subtitle="Feed the engine its first listing — you can bulk import later."
            >
              <div className="space-y-4">
                <Field label="Plot / property name">
                  <Input
                    value={property.name}
                    onChange={(e) => setProperty({ ...property, name: e.target.value })}
                    placeholder="Maitama Gardens — Plot 14"
                  />
                </Field>
                <Field label="Location">
                  <Input
                    value={property.location}
                    onChange={(e) => setProperty({ ...property, location: e.target.value })}
                    placeholder="Maitama, Abuja"
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Size (sqm)">
                    <Input
                      type="number"
                      value={property.size_sqm}
                      onChange={(e) => setProperty({ ...property, size_sqm: e.target.value })}
                    />
                  </Field>
                  <Field label="Price (₦)">
                    <Input
                      type="number"
                      value={property.price}
                      onChange={(e) => setProperty({ ...property, price: e.target.value })}
                    />
                  </Field>
                </div>
                <Field label="Land title type">
                  <Select
                    value={property.title_type}
                    onValueChange={(v) => setProperty({ ...property, title_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["C of O", "Gazette", "Survey Plan", "Governor's Consent", "Other"].map(
                        (c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </Field>
                <label className="block border-2 border-dashed border-gold/30 rounded-lg p-5 text-center text-xs sm:text-sm text-muted-foreground cursor-pointer hover:bg-gold/5 transition">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
                  />
                  <Upload className="w-6 h-6 mx-auto mb-2 text-gold" />
                  {documentFile ? (
                    <span className="text-gold font-mono">{documentFile.name}</span>
                  ) : (
                    "Upload land title documents (optional · add anytime in Knowledge Vault)"
                  )}
                </label>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">
                  <Button variant="ghost" onClick={prev} className="text-muted-foreground">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => submitProperty(true)}>
                      Skip
                    </Button>
                    <PrimaryBtn loading={loading} onClick={() => submitProperty(false)}>
                      Continue
                    </PrimaryBtn>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {step === 4 && (
            <Card
              title="Your Knowledge Vault"
              subtitle="What the AI quotes, knows, and weaponizes during chats."
            >
              <div className="space-y-5">
                <div className="grid sm:grid-cols-3 gap-3">
                  <VaultBox
                    icon={Database}
                    title="Inventory"
                    desc="All your active listings — auto-synced to chats."
                  />
                  <VaultBox
                    icon={FileText}
                    title="Legal Docs"
                    desc="C of O, Gazette, Survey Plans the AI can quote."
                  />
                  <VaultBox
                    icon={Tag}
                    title="Market Facts"
                    desc="Live FX, infrastructure news, scarcity triggers."
                  />
                </div>
                <div>
                  <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Seed your market intelligence tags
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    These are facts the AI weaves into chats to build urgency and credibility.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {vault.tags.map((t, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-mono inline-flex items-center gap-2"
                      >
                        {t}
                        <button
                          onClick={() => setVault({ tags: vault.tags.filter((_, j) => j !== i) })}
                          className="hover:text-foreground"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="e.g. Abuja-Kaduna expressway upgrade Q1 2026"
                    />
                    <Button
                      onClick={() => {
                        if (newTag.trim()) {
                          setVault({ tags: [...vault.tags, newTag.trim()] });
                          setNewTag("");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <div className="px-4 py-3 rounded-lg bg-gold/5 border border-gold/20 text-xs text-muted-foreground">
                  📚 After onboarding, head to <span className="text-gold">Knowledge Vault</span> to
                  bulk-upload listings, drop legal PDFs, and program objection kill-switches.
                </div>
                <NavRow onPrev={prev} onNext={submitVault} loading={loading} />
              </div>
            </Card>
          )}

          {step === 5 && (
            <Card title="Pick Your AI Persona" subtitle="Choose your closer's personality.">
              <div className="space-y-5">
                <RadioGroup
                  value={brain.persona}
                  onValueChange={(v) => setBrain({ ...brain, persona: v })}
                  className="space-y-3"
                >
                  {[
                    {
                      id: "apex_closer",
                      title: "The Apex Closer",
                      desc: "Out-closes any human. Straight-Line persuasion + urgency engineering, 24/7.",
                    },
                    {
                      id: "diaspora_whisperer",
                      title: "The Diaspora Whisperer",
                      desc: "Patient, evidence-led — built for UK/US/Canada-based Nigerian buyers.",
                    },
                    {
                      id: "hni_concierge",
                      title: "The HNI Concierge",
                      desc: "Luxury, exclusivity-first tone tuned for ₦500M+ deals.",
                    },
                  ].map((p) => (
                    <label
                      key={p.id}
                      htmlFor={p.id}
                      className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition ${brain.persona === p.id ? "border-gold bg-gold/10" : "border-border hover:border-gold/40"}`}
                    >
                      <RadioGroupItem value={p.id} id={p.id} className="mt-1" />
                      <div>
                        <div className="font-serif text-lg">{p.title}</div>
                        <div className="text-sm text-muted-foreground">{p.desc}</div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
                <Field label="Response language">
                  <Select
                    value={brain.language}
                    onValueChange={(v) => setBrain({ ...brain, language: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english_ng">English (Nigerian)</SelectItem>
                      <SelectItem value="pidgin">Pidgin English</SelectItem>
                      <SelectItem value="hausa_en">Hausa + English</SelectItem>
                      <SelectItem value="yoruba_en">Yoruba + English</SelectItem>
                      <SelectItem value="igbo_en">Igbo + English</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <NavRow onPrev={prev} onNext={submitBrain} loading={loading} />
              </div>
            </Card>
          )}

          {step === 6 && (
            <Card
              title="Connect Leads"
              subtitle="Link WhatsApp — your AI closer goes live the moment a lead messages in."
            >
              <div className="space-y-5">
                <button
                  onClick={() => setWaDialogOpen(true)}
                  className={`w-full text-left p-5 rounded-xl border transition group flex flex-col gap-3 ${waConnected ? "border-success bg-success/5" : "border-gold/30 bg-gold/5 hover:border-gold/60 hover:bg-gold/10"}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center">
                    <MessageCircle
                      className={`w-5 h-5 ${waConnected ? "text-success" : "text-gold"}`}
                    />
                  </div>
                  <div>
                    <div className="font-serif text-lg">WhatsApp Business</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {waConnected
                        ? "Connected — AI is live on WhatsApp."
                        : "Connect Twilio Sandbox (free, instant) or Meta Cloud API to start receiving leads."}
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-mono group-hover:gap-2 transition-all ${waConnected ? "text-success" : "text-gold"}`}
                  >
                    {waConnected ? (
                      "✓ Connected"
                    ) : (
                      <>
                        Connect Leads <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </div>
                </button>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-center">
                  <Button variant="outline" onClick={finish}>
                    Skip — connect later
                  </Button>
                  <PrimaryBtn loading={loading} onClick={finish}>
                    <Check className="w-4 h-4 mr-1" /> Launch My AI Closer
                  </PrimaryBtn>
                </div>
              </div>
            </Card>
          )}

          {/* WhatsApp Connect Dialog */}
          <Dialog open={waDialogOpen} onOpenChange={setWaDialogOpen}>
            <DialogContent className="bg-noir-elevated border-gold/30 max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Connect WhatsApp</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2 p-1 bg-noir rounded-lg border border-border">
                  <button
                    onClick={() => setWaProvider("twilio")}
                    className={`py-2 rounded-md text-xs font-mono transition ${waProvider === "twilio" ? "bg-gold text-noir font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Twilio Sandbox
                  </button>
                  <button
                    onClick={() => setWaProvider("meta")}
                    className={`py-2 rounded-md text-xs font-mono transition ${waProvider === "meta" ? "bg-gold text-noir font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Meta Cloud API
                  </button>
                </div>
                {waProvider === "twilio" ? (
                  <>
                    <div className="rounded-lg bg-noir border border-gold/20 p-3 space-y-1 text-xs text-muted-foreground">
                      <p className="font-mono text-[10px] text-gold uppercase tracking-wider mb-2">
                        Twilio Sandbox Setup
                      </p>
                      <div>
                        1. Sign up free at{" "}
                        <a
                          href="https://twilio.com"
                          target="_blank"
                          rel="noreferrer"
                          className="text-gold underline"
                        >
                          twilio.com
                        </a>
                      </div>
                      <div>2. Console → Messaging → Try it out → Send a WhatsApp message</div>
                      <div>3. Copy your sandbox number (e.g. +14155238886)</div>
                      <div>
                        4. Set webhook in Twilio to:{" "}
                        <span className="text-foreground font-mono">
                          /api/public/twilio-webhook
                        </span>
                      </div>
                    </div>
                    <Field label="Twilio Sandbox Number">
                      <Input
                        value={waForm.business_phone}
                        onChange={(e) =>
                          setWaForm({
                            ...waForm,
                            business_phone: e.target.value,
                            phone_number_id: "twilio",
                            access_token: "twilio",
                          })
                        }
                        placeholder="+14155238886"
                        className="font-mono text-sm"
                      />
                    </Field>
                  </>
                ) : (
                  <>
                    <Field label="Phone Number ID">
                      <Input
                        value={waForm.phone_number_id}
                        onChange={(e) => setWaForm({ ...waForm, phone_number_id: e.target.value })}
                        placeholder="From Meta Developer App"
                        className="font-mono text-sm"
                      />
                    </Field>
                    <Field label="Access Token">
                      <div className="relative">
                        <Input
                          type={showToken ? "text" : "password"}
                          value={waForm.access_token}
                          onChange={(e) => setWaForm({ ...waForm, access_token: e.target.value })}
                          placeholder="Permanent token"
                          className="font-mono text-sm pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowToken(!showToken)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </Field>
                    <Field label="Business Phone">
                      <Input
                        value={waForm.business_phone}
                        onChange={(e) => setWaForm({ ...waForm, business_phone: e.target.value })}
                        placeholder="+2348012345678"
                        className="font-mono text-sm"
                      />
                    </Field>
                  </>
                )}
                <Button
                  onClick={saveWhatsApp}
                  disabled={waSaving}
                  className="w-full bg-gold text-noir hover:bg-gold/90 font-semibold"
                >
                  {waSaving ? "Saving…" : "Save & Activate"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }: any) {
  return (
    <div className="glass-gold rounded-2xl p-5 sm:p-8 gold-glow">
      <h2 className="font-serif text-2xl sm:text-3xl mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground mb-5 sm:mb-6">{subtitle}</p>
      {children}
    </div>
  );
}
function Field({ label, children }: any) {
  return (
    <div>
      <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
function PasswordInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        minLength={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
function PrimaryBtn({ children, loading, ...props }: any) {
  return (
    <Button
      {...props}
      disabled={loading}
      className="bg-gold text-noir hover:bg-gold/90 font-semibold"
    >
      {loading ? (
        "..."
      ) : (
        <>
          {children} <ArrowRight className="w-4 h-4 ml-1" />
        </>
      )}
    </Button>
  );
}
function NavRow({
  onPrev,
  onNext,
  loading,
}: {
  onPrev?: () => void;
  onNext: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">
      {onPrev ? (
        <Button variant="ghost" onClick={onPrev} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      ) : (
        <div />
      )}
      <PrimaryBtn loading={loading} onClick={onNext}>
        Continue
      </PrimaryBtn>
    </div>
  );
}
function VaultBox({ icon: Icon, title, desc }: any) {
  return (
    <div className="glass rounded-xl p-4 border border-gold/15">
      <Icon className="w-5 h-5 text-gold mb-2" />
      <div className="font-serif text-base">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{desc}</div>
    </div>
  );
}
