import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { compactNaira, formatNaira, timeAgo } from "@/lib/format";
import { Zap, MessageSquare, Target, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<any[]>([]);
  const [marketPulse, setMarketPulse] = useState("");
  const [stats, setStats] = useState({ revenue: 0, deals: 0, avgCloseDays: 0, totalLeads: 0, intent: 0, openNeg: 0, objections: 0, followups: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: leadsData }, { data: sold }, { count: objCount }, { count: aiCount }] = await Promise.all([
        supabase.from("leads").select("*").order("last_touch_at", { ascending: false }).limit(50),
        supabase.from("properties").select("price, updated_at, created_at").eq("status", "sold"),
        supabase.from("objection_rules").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("conversations").select("*", { count: "exact", head: true }).eq("role", "ai"),
      ]);
      const ls = leadsData ?? [];
      setLeads(ls);
      const intent = ls.length ? Math.round(ls.reduce((s, l) => s + (l.intent_score || 0), 0) / ls.length) : 0;
      const openNeg = ls.filter((l) => l.stage !== "cold").length;
      const revenue = (sold ?? []).reduce((s, p: any) => s + Number(p.price || 0), 0);
      const closeTimes = (sold ?? []).map((p: any) => p.updated_at && p.created_at
        ? (new Date(p.updated_at).getTime() - new Date(p.created_at).getTime()) / 86400000 : 0).filter(Boolean);
      const avgCloseDays = closeTimes.length ? +(closeTimes.reduce((a, b) => a + b, 0) / closeTimes.length).toFixed(1) : 0;
      setStats({ revenue, deals: sold?.length ?? 0, avgCloseDays, totalLeads: ls.length, intent, openNeg, objections: objCount ?? 0, followups: aiCount ?? 0 });
    })();
  }, [user]);

  const broadcastPulse = async () => {
    if (!user || !marketPulse.trim()) return;
    await supabase.from("market_tags").insert({ user_id: user.id, tag_text: marketPulse.trim() });
    toast.success("Market pulse broadcast to all active AI sessions.");
    setMarketPulse("");
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Revenue widget */}
      <div className="glass-gold rounded-2xl p-8 gold-glow">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="font-mono text-xs text-gold mb-2">— REVENUE BOOST · ALL TIME —</div>
            <div className="font-serif text-[52px] leading-none text-gold gold-text-glow">{compactNaira(stats.revenue)}</div>
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <Stat label="Deals Closed" value={String(stats.deals)} />
              <Stat label="Avg. Close Time" value={stats.avgCloseDays ? `${stats.avgCloseDays} days` : "—"} />
              <Stat label="Total Leads" value={String(stats.totalLeads)} />
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gold text-noir hover:bg-gold/90 font-semibold">
                <Zap className="w-4 h-4 mr-2" /> Update Market Pulse
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-noir-elevated border-gold/30">
              <DialogHeader><DialogTitle className="font-serif">Broadcast Market Pulse</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground">A live fact injected into every active AI session right now.</p>
              <Textarea value={marketPulse} onChange={(e) => setMarketPulse(e.target.value)} placeholder="e.g. CBN raised rates to 27.5% — buyers acting fast." rows={4} />
              <Button onClick={broadcastPulse} className="bg-gold text-noir hover:bg-gold/90"><Send className="w-4 h-4 mr-2" /> Broadcast Now</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Intent Score Avg" value={stats.intent} icon={Target} />
        <StatCard label="Open Negotiations" value={stats.openNeg} icon={MessageSquare} />
        <StatCard label="Objections Handled" value={stats.objections} icon={Zap} />
        <StatCard label="AI Replies Sent" value={stats.followups} icon={Send} />
      </div>

      {/* Live negotiation stream */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-2xl">Live Negotiation Stream</h2>
          <span className="px-3 py-1 rounded-full bg-danger/15 border border-danger/40 text-danger text-xs font-mono pulse-red">
            {leads.length || 0} ACTIVE
          </span>
        </div>
        <div className="space-y-3">
          {leads.length === 0 ? (
            <EmptyState />
          ) : leads.slice(0, 8).map((l) => (
            <button key={l.id} onClick={() => navigate({ to: "/leads", search: { lead: l.id } as any })}
              className="w-full text-left glass rounded-xl p-4 hover:border-gold/50 hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-serif">
                    {l.name?.[0] ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{l.name}</span>
                      <IntentBadge score={l.intent_score} />
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">⚡ {l.current_strategy || "Discovery — qualifying intent"}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 font-mono">{timeAgo(l.last_touch_at)}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: any) {
  return <div><div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div><div className="font-mono text-lg">{value}</div></div>;
}

function StatCard({ label, value, icon: Icon }: any) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{label}</div>
          <div className="font-mono text-3xl">{value}</div>
        </div>
        <Icon className="w-5 h-5 text-gold/60" />
      </div>
    </div>
  );
}

export function IntentBadge({ score }: { score: number }) {
  const s = score ?? 0;
  const color = s >= 80 ? "bg-success/20 text-success border-success/40" : s >= 55 ? "bg-warning/20 text-warning border-warning/40" : "bg-danger/20 text-danger border-danger/40";
  return <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${color}`}>{s}</span>;
}

function EmptyState() {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gold/40" />
      <p className="text-sm">No active negotiations yet. Connect WhatsApp to start receiving leads.</p>
    </div>
  );
}
