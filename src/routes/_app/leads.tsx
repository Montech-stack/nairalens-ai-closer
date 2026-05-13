import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { formatNaira, timeAgo } from "@/lib/format";
import { IntentBadge } from "./dashboard";
import { Search, Plus, X, Send, Calendar, AlertTriangle, Hand, Brain } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/leads")({
  validateSearch: (s: Record<string, unknown>) => ({ lead: (s.lead as string) ?? "" }),
  component: LeadIntelligence,
});

const STAGES = ["all", "hot", "warm", "cold"] as const;

function LeadIntelligence() {
  const { user } = useAuth();
  const search = useSearch({ from: "/_app/leads" });
  const [leads, setLeads] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<string>("all");
  const [source, setSource] = useState<string>("all");
  const [sel, setSel] = useState<any | null>(null);

  const load = async () => {
    const { data } = await supabase.from("leads").select("*").order("last_touch_at", { ascending: false });
    setLeads(data ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  useEffect(() => {
    if (search.lead && leads.length) {
      const l = leads.find((x) => x.id === search.lead);
      if (l) setSel(l);
    }
  }, [search.lead, leads]);

  const filtered = useMemo(() => leads.filter((l) => {
    if (stage !== "all" && l.stage !== stage) return false;
    if (source !== "all" && l.source !== source) return false;
    if (q && !l.name.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [leads, q, stage, source]);

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search leads…" className="pl-10 focus:ring-gold" />
        </div>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>{STAGES.map((s) => <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>{["all", "Meta Ads", "WhatsApp", "Referral", "Direct"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <NewLeadSheet onSaved={load} />
      </div>

      <div className="glass rounded-2xl p-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-mono text-muted-foreground uppercase">
              <th className="p-3">Name</th><th>Budget</th><th>Location</th><th>Source</th><th>Intent</th><th>Stage</th><th>Last Touch</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">No leads yet.</td></tr>
            ) : filtered.map((l) => (
              <tr key={l.id} onClick={() => setSel(l)} className="border-t border-border hover:bg-noir-elevated cursor-pointer">
                <td className="p-3"><div className="font-medium">{l.name}</div><div className="text-xs text-muted-foreground">{l.occupation || "—"}</div></td>
                <td className="font-mono text-gold">{formatNaira(l.budget_max || l.budget_min)}</td>
                <td>{l.location_preference || "—"}</td>
                <td className="text-xs text-muted-foreground">{l.source || "—"}</td>
                <td><IntentBadge score={l.intent_score} /></td>
                <td><StageBadge s={l.stage} /></td>
                <td className="text-xs font-mono">{timeAgo(l.last_touch_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && <LeadDetailOverlay lead={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function NewLeadSheet({ onSaved }: { onSaved: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", occupation: "", phone: "", budget_max: "", location_preference: "", source: "WhatsApp", intent_score: 50, stage: "warm" });
  const save = async () => {
    if (!user || !f.name) return;
    await supabase.from("leads").insert({ user_id: user.id, ...f, budget_max: Number(f.budget_max) || null, intent_score: Number(f.intent_score) });
    toast.success("Lead added.");
    setOpen(false);
    onSaved();
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild><Button className="bg-gold text-noir hover:bg-gold/90"><Plus className="w-4 h-4 mr-1" /> New Lead</Button></SheetTrigger>
      <SheetContent className="bg-noir-elevated border-gold/30 overflow-y-auto">
        <SheetHeader><SheetTitle className="font-serif">New Lead</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <FieldEl label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></FieldEl>
          <FieldEl label="Occupation"><Input value={f.occupation} onChange={(e) => setF({ ...f, occupation: e.target.value })} /></FieldEl>
          <FieldEl label="Phone"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></FieldEl>
          <FieldEl label="Budget (max)"><Input type="number" value={f.budget_max} onChange={(e) => setF({ ...f, budget_max: e.target.value })} /></FieldEl>
          <FieldEl label="Location preference"><Input value={f.location_preference} onChange={(e) => setF({ ...f, location_preference: e.target.value })} /></FieldEl>
          <FieldEl label="Source">
            <Select value={f.source} onValueChange={(v) => setF({ ...f, source: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["WhatsApp", "Meta Ads", "Referral", "Direct"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </FieldEl>
          <FieldEl label="Intent score"><Input type="number" min={0} max={100} value={f.intent_score} onChange={(e) => setF({ ...f, intent_score: Number(e.target.value) })} /></FieldEl>
          <FieldEl label="Stage">
            <Select value={f.stage} onValueChange={(v) => setF({ ...f, stage: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["hot", "warm", "cold"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </FieldEl>
          <Button onClick={save} className="w-full bg-gold text-noir hover:bg-gold/90">Save Lead</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StageBadge({ s }: any) {
  const m: any = {
    hot: "bg-danger/15 text-danger border-danger/40",
    warm: "bg-warning/15 text-warning border-warning/40",
    cold: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase ${m[s] || ""}`}>{s}</span>;
}

function FieldEl({ label, children }: any) {
  return <div><Label className="text-xs font-mono text-muted-foreground uppercase">{label}</Label><div className="mt-1">{children}</div></div>;
}

function LeadDetailOverlay({ lead, onClose }: { lead: any; onClose: () => void }) {
  const { user } = useAuth();
  const [convo, setConvo] = useState<any[]>([]);
  const [draft, setDraft] = useState("");
  const [paused, setPaused] = useState(lead.ai_paused);

  const load = async () => {
    const { data } = await supabase.from("conversations").select("*").eq("lead_id", lead.id).order("created_at");
    setConvo(data ?? []);
  };
  useEffect(() => { load(); }, [lead.id]);

  const send = async () => {
    if (!user || !draft.trim()) return;
    await supabase.from("conversations").insert({ user_id: user.id, lead_id: lead.id, role: "ai", message_text: draft, annotation: paused ? "↳ Manual override (CEO)" : "↳ AI auto-send" });
    setDraft("");
    load();
  };

  const toggleControl = async () => {
    const v = !paused;
    setPaused(v);
    await supabase.from("leads").update({ ai_paused: v }).eq("id", lead.id);
    toast(v ? "AI paused — manual control active." : "AI resumed.");
  };

  return (
    <div className="fixed inset-0 z-40 bg-noir/90 backdrop-blur-md p-4 overflow-auto">
      <div className="max-w-7xl mx-auto glass-gold rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gold/20">
          <h2 className="font-serif text-2xl">{lead.name}</h2>
          <Button size="sm" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
        <div className="grid lg:grid-cols-[240px_1fr_270px] min-h-[70vh]">
          {/* LEFT */}
          <aside className="p-5 border-r border-border space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gold flex items-center justify-center text-noir font-serif text-3xl mx-auto mb-2">{lead.name?.[0]}</div>
              <div className="font-serif text-lg">{lead.name}</div>
              <div className="text-xs text-muted-foreground">{lead.occupation || "—"}</div>
            </div>
            <DataRow l="Budget" v={formatNaira(lead.budget_max || lead.budget_min)} />
            <DataRow l="Location" v={lead.location_preference || "—"} />
            <DataRow l="Source" v={lead.source || "—"} />
            <DataRow l="Phone" v={lead.phone || "—"} />
            <DataRow l="Notes" v={lead.notes || "—"} />
            <hr className="border-border" />
            <div className="text-center">
              <div className="text-xs font-mono text-muted-foreground uppercase">Intent Score</div>
              <div className="font-mono text-5xl text-gold gold-text-glow">{lead.intent_score || 0}</div>
              <div className="mt-2"><StageBadge s={lead.stage} /></div>
              <div className="text-xs text-muted-foreground mt-2 font-mono">Last active {timeAgo(lead.last_touch_at)}</div>
            </div>
          </aside>

          {/* CENTER */}
          <section className="flex flex-col">
            <div className="flex-1 p-5 space-y-3 overflow-auto scrollbar-gold max-h-[60vh]">
              {convo.length === 0 ? (
                <div className="text-center text-muted-foreground py-12 text-sm">No messages yet. Start the conversation.</div>
              ) : convo.map((m) => (
                <div key={m.id} className={`flex ${m.role === "lead" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[75%]">
                    <div className={`px-3 py-2 rounded-xl text-sm ${m.role === "ai" ? "bg-gold/15 border border-gold/25" : "bg-noir-elevated"}`}>{m.message_text}</div>
                    {m.role === "ai" && m.annotation && <div className="text-[10px] font-mono text-gold mt-1 ml-2">{m.annotation}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-3 flex gap-2">
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={paused ? "Manual override active — type message…" : "Send AI follow-up…"} onKeyDown={(e) => e.key === "Enter" && send()} />
              <Button onClick={send} className="bg-gold text-noir"><Send className="w-4 h-4" /></Button>
            </div>
          </section>

          {/* RIGHT */}
          <aside className="p-5 border-l border-border space-y-3 bg-noir/40">
            <Button onClick={toggleControl} variant={paused ? "outline" : "destructive"} className="w-full">
              <Hand className="w-4 h-4 mr-1" /> {paused ? "Resume AI" : "Take Control"}
            </Button>
            <ConsoleCard icon={<Brain className="w-4 h-4 text-gold" />} title="Current Objective" body={lead.current_objective || "—"} />
            <ConsoleCard icon={<Brain className="w-4 h-4 text-gold" />} title="Psychological Profile" body={lead.psych_profile || "Not yet inferred."} />
            <ConsoleCard accent="gold" title="Next Recommended Move" body={lead.next_move || "Awaiting first AI analysis after next inbound message."} />
            <ConsoleCard accent="warning" icon={<AlertTriangle className="w-4 h-4 text-warning" />} title="Risk Signals" body={lead.risk_signals || "None detected."} />
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button className="bg-gold text-noir hover:bg-gold/90"><Send className="w-4 h-4 mr-1" /> Follow-up</Button>
              <Button variant="outline"><Calendar className="w-4 h-4 mr-1" /> Site Visit</Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function DataRow({ l, v }: any) {
  return <div><div className="text-[10px] font-mono text-muted-foreground uppercase">{l}</div><div className="text-sm">{v}</div></div>;
}

function ConsoleCard({ icon, title, body, accent }: any) {
  const colorMap: any = { gold: "border-gold/40 bg-gold/5", warning: "border-warning/40 bg-warning/5" };
  return (
    <div className={`rounded-xl p-3 border ${colorMap[accent] || "border-border bg-noir-elevated/40"}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <div className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider">{title}</div>
      </div>
      <div className={`text-sm ${accent === "gold" ? "text-gold" : accent === "warning" ? "text-warning" : ""}`}>{body}</div>
    </div>
  );
}
