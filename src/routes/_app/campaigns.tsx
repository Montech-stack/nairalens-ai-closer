import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { compactNaira, formatNaira } from "@/lib/format";
import { Plus, TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/campaigns")({
  component: Campaigns,
});

function Campaigns() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => {
    if (user) load();
  }, [user]);

  const totalSpend = list.reduce((s, c) => s + Number(c.budget || 0), 0);
  const totalLeads = list.reduce((s, c) => s + Number(c.leads_count || 0), 0);
  const cpl = totalLeads ? Math.round(totalSpend / totalLeads) : 0;

  const meta = list.filter((c) => c.platform === "Meta");
  const roas = totalSpend ? (totalLeads * 1.0).toFixed(1) : "—"; // placeholder until revenue attribution lands

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Ad Spend" value={compactNaira(totalSpend)} icon={DollarSign} />
        <KPI label="Leads Generated" value={String(totalLeads)} icon={Users} />
        <KPI label="Cost Per Lead" value={cpl ? formatNaira(cpl) : "—"} icon={Activity} />
        <KPI
          label="Active Campaigns"
          value={String(list.filter((c) => c.status === "active").length)}
          icon={TrendingUp}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-serif text-xl mb-4">Meta Ads Performance</h3>
          {meta.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No Meta campaigns yet. Add one below.
            </p>
          ) : (
            <div className="space-y-3">
              {meta.map((c) => (
                <div key={c.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{c.name}</span>
                    <span className="font-mono text-gold">
                      {c.leads_count} leads · {formatNaira(c.cpl)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-noir-elevated rounded-full">
                    <div
                      className="h-full bg-gold rounded-full"
                      style={{ width: `${Math.min(100, (Number(c.leads_count) / 100) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="font-serif text-xl mb-4">WhatsApp Performance</h3>
          <WhatsAppMetrics />
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl">Campaign History</h3>
          <NewCampaignSheet onSaved={load} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-mono text-muted-foreground uppercase">
                <th className="p-2">Name</th>
                <th>Platform</th>
                <th>Date Range</th>
                <th>Budget</th>
                <th>Leads</th>
                <th>CPL</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">
                    No campaigns yet.
                  </td>
                </tr>
              ) : (
                list.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="p-2 font-medium">{c.name}</td>
                    <td className="text-xs">{c.platform}</td>
                    <td className="text-xs font-mono">
                      {c.date_start} → {c.date_end}
                    </td>
                    <td className="font-mono text-gold">{formatNaira(c.budget)}</td>
                    <td className="font-mono">{c.leads_count}</td>
                    <td className="font-mono">{formatNaira(c.cpl)}</td>
                    <td>
                      <CampStatus s={c.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CampStatus({ s }: any) {
  const m: any = {
    active: "bg-success/15 text-success border-success/40",
    paused: "bg-warning/15 text-warning border-warning/40",
    completed: "bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase ${m[s] || ""}`}>
      {s}
    </span>
  );
}

function KPI({ label, value, icon: Icon }: any) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase text-muted-foreground">{label}</div>
          <div className="font-serif text-2xl text-gold mt-2">{value}</div>
        </div>
        <Icon className="w-5 h-5 text-gold/60" />
      </div>
    </div>
  );
}
function Metric({ label, value }: any) {
  return (
    <div className="bg-noir-elevated rounded-lg p-3">
      <div className="text-[10px] font-mono text-muted-foreground uppercase">{label}</div>
      <div className="font-mono text-xl text-gold mt-1">{value}</div>
    </div>
  );
}

function WhatsAppMetrics() {
  const { user } = useAuth();
  const [m, setM] = useState({ inbound: 0, ai: 0, leads: 0, hot: 0 });
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [a, b, c, d] = await Promise.all([
        supabase
          .from("conversations")
          .select("*", { count: "exact", head: true })
          .eq("role", "lead"),
        supabase.from("conversations").select("*", { count: "exact", head: true }).eq("role", "ai"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("source", "WhatsApp"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("stage", "hot"),
      ]);
      setM({ inbound: a.count ?? 0, ai: b.count ?? 0, leads: c.count ?? 0, hot: d.count ?? 0 });
    })();
  }, [user]);
  const responseRate = m.inbound ? Math.round((m.ai / m.inbound) * 100) : 0;
  return (
    <div className="grid grid-cols-2 gap-4">
      <Metric label="Inbound Messages" value={String(m.inbound)} />
      <Metric label="AI Replies" value={String(m.ai)} />
      <Metric label="Response Rate" value={`${responseRate}%`} />
      <Metric label="WhatsApp Leads" value={String(m.leads)} />
      <Metric label="Hot Stage" value={String(m.hot)} />
      <Metric label="Total Touches" value={String(m.inbound + m.ai)} />
    </div>
  );
}

function NewCampaignSheet({ onSaved }: any) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    name: "",
    platform: "Meta",
    budget: "",
    date_start: "",
    date_end: "",
    leads_count: 0,
    cpl: 0,
    status: "active",
  });
  const save = async () => {
    if (!user || !f.name) return;
    await supabase
      .from("campaigns")
      .insert({ user_id: user.id, ...f, budget: Number(f.budget) || 0 });
    toast.success("Campaign created.");
    setOpen(false);
    onSaved();
  };
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-gold text-noir hover:bg-gold/90">
          <Plus className="w-4 h-4 mr-1" /> New Campaign
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-noir-elevated border-gold/30 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-serif">New Campaign</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 mt-4">
          <FE label="Name">
            <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </FE>
          <FE label="Platform">
            <Select value={f.platform} onValueChange={(v) => setF({ ...f, platform: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Meta", "Google", "WhatsApp", "Other"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FE>
          <FE label="Budget (₦)">
            <Input
              type="number"
              value={f.budget}
              onChange={(e) => setF({ ...f, budget: e.target.value })}
            />
          </FE>
          <div className="grid grid-cols-2 gap-2">
            <FE label="Start">
              <Input
                type="date"
                value={f.date_start}
                onChange={(e) => setF({ ...f, date_start: e.target.value })}
              />
            </FE>
            <FE label="End">
              <Input
                type="date"
                value={f.date_end}
                onChange={(e) => setF({ ...f, date_end: e.target.value })}
              />
            </FE>
          </div>
          <Button onClick={save} className="w-full bg-gold text-noir hover:bg-gold/90">
            Save Campaign
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
function FE({ label, children }: any) {
  return (
    <div>
      <Label className="text-xs font-mono text-muted-foreground uppercase">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
