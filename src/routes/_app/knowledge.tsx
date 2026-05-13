import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNaira } from "@/lib/format";
import { Plus, Trash2, Upload, ShieldAlert, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/knowledge")({
  component: KnowledgeVault,
});

function KnowledgeVault() {
  return (
    <div className="space-y-6 max-w-7xl">
      <InventorySection />
      <ObjectionRulesSection />
    </div>
  );
}

function InventorySection() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ plot_id: "", name: "", location: "", size_sqm: "", price: "", title_type: "C of O", status: "available" });

  const load = async () => {
    const { data } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const save = async () => {
    if (!user) return;
    await supabase.from("properties").insert({
      user_id: user.id, ...form,
      size_sqm: Number(form.size_sqm) || null, price: Number(form.price) || null,
    });
    toast.success("Plot added.");
    setOpen(false);
    setForm({ plot_id: "", name: "", location: "", size_sqm: "", price: "", title_type: "C of O", status: "available" });
    load();
  };

  const del = async (id: string) => {
    await supabase.from("properties").delete().eq("id", id);
    load();
  };

  const uploadDoc = async (propertyId: string, file: File) => {
    if (!user) return;
    const path = `${user.id}/properties/${propertyId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("legal-documents").upload(path, file);
    if (error) { toast.error(error.message); return; }
    const { data: urlData } = supabase.storage.from("legal-documents").getPublicUrl(path);
    await supabase.from("properties").update({ document_url: urlData.publicUrl }).eq("id", propertyId);
    toast.success("Document uploaded.");
    load();
  };

  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-serif text-2xl">Inventory Manager</h2>
          <p className="text-sm text-muted-foreground">Every plot. Every status. One source of truth.</p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button className="bg-gold text-noir hover:bg-gold/90"><Plus className="w-4 h-4 mr-1" /> Add Plot</Button>
          </SheetTrigger>
          <SheetContent className="bg-noir-elevated border-gold/30 overflow-y-auto">
            <SheetHeader><SheetTitle className="font-serif">Add Property</SheetTitle></SheetHeader>
            <div className="space-y-3 mt-4">
              <FieldEl label="Plot ID"><Input value={form.plot_id} onChange={(e) => setForm({ ...form, plot_id: e.target.value })} /></FieldEl>
              <FieldEl label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></FieldEl>
              <FieldEl label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></FieldEl>
              <div className="grid grid-cols-2 gap-3">
                <FieldEl label="Size (sqm)"><Input type="number" value={form.size_sqm} onChange={(e) => setForm({ ...form, size_sqm: e.target.value })} /></FieldEl>
                <FieldEl label="Price (₦)"><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></FieldEl>
              </div>
              <FieldEl label="Title type">
                <Select value={form.title_type} onValueChange={(v) => setForm({ ...form, title_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["C of O", "Gazette", "Survey Plan", "Other"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </FieldEl>
              <FieldEl label="Status">
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["available", "reserved", "sold"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </FieldEl>
              <Button onClick={save} className="w-full bg-gold text-noir hover:bg-gold/90">Save Plot</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {list.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No properties yet. Click Add Plot.</div>
        ) : list.map((p) => (
          <div key={p.id} className="bg-noir-elevated rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="font-mono text-xs text-gold">{p.plot_id || ""}</div>
                <div className="font-serif text-base leading-tight">{p.name}</div>
              </div>
              <StatusBadge s={p.status} />
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              {p.location && <div>📍 {p.location}</div>}
              <div>📐 {p.size_sqm ? `${p.size_sqm} sqm` : "—"} · <span className="text-gold font-mono">{formatNaira(p.price)}</span></div>
              <div>📄 {p.title_type}</div>
            </div>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <label className="text-xs text-gold hover:underline flex items-center gap-1 cursor-pointer">
                <Upload className="w-3 h-3" />
                {p.document_url ? "Replace doc" : "Upload doc"}
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDoc(p.id, f); }} />
              </label>
              {p.document_url && (
                <a href={p.document_url} target="_blank" rel="noreferrer" className="text-xs text-success hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> View doc
                </a>
              )}
              <button onClick={() => del(p.id)} className="text-xs text-danger hover:underline flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-mono text-muted-foreground uppercase">
              <th className="py-2">Plot</th><th>Location</th><th>Size</th><th>Price</th><th>Title</th><th>Status</th><th>Document</th><th></th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-muted-foreground text-sm">No properties yet. Click Add Plot.</td></tr>
            ) : list.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-noir-elevated/50">
                <td className="py-3 font-mono text-xs">{p.plot_id || p.name}</td>
                <td>{p.location}</td>
                <td className="font-mono">{p.size_sqm || "—"} sqm</td>
                <td className="font-mono text-gold">{formatNaira(p.price)}</td>
                <td className="text-xs">{p.title_type}</td>
                <td><StatusBadge s={p.status} /></td>
                <td>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer text-gold hover:opacity-80" title={p.document_url ? "Replace document" : "Upload document"}>
                      <Upload className="w-4 h-4" />
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDoc(p.id, f); }} />
                    </label>
                    {p.document_url && (
                      <a href={p.document_url} target="_blank" rel="noreferrer" className="text-success hover:opacity-80" title="View document">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </td>
                <td><Button size="sm" variant="ghost" onClick={() => del(p.id)}><Trash2 className="w-4 h-4 text-danger" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusBadge({ s }: { s: string }) {
  const map: any = {
    available: "bg-success/15 text-success border-success/40",
    reserved: "bg-warning/15 text-warning border-warning/40",
    sold: "bg-danger/15 text-danger border-danger/40",
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase ${map[s] || ""}`}>{s}</span>;
}

function FieldEl({ label, children }: any) {
  return <div><Label className="text-xs font-mono text-muted-foreground uppercase">{label}</Label><div className="mt-1">{children}</div></div>;
}


function ObjectionRulesSection() {
  const { user } = useAuth();
  const [rules, setRules] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ trigger_phrase: "", response_script: "" });

  const load = async () => {
    const { data } = await supabase.from("objection_rules").select("*").order("created_at", { ascending: false });
    setRules(data ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const save = async () => {
    if (!user || !form.trigger_phrase) return;
    await supabase.from("objection_rules").insert({ user_id: user.id, ...form, is_active: true });
    setForm({ trigger_phrase: "", response_script: "" });
    setOpen(false);
    toast.success("Rule added — injected into AI prompt.");
    load();
  };

  const toggle = async (id: string, val: boolean) => {
    await supabase.from("objection_rules").update({ is_active: val }).eq("id", id);
    load();
  };

  const del = async (id: string) => {
    await supabase.from("objection_rules").delete().eq("id", id);
    load();
  };

  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-2xl flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-gold" /> Objection Kill-Switch</h2>
          <p className="text-sm text-muted-foreground">Pre-program responses. AI deploys instantly.</p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild><Button className="bg-gold text-noir hover:bg-gold/90"><Plus className="w-4 h-4 mr-1" /> Add Rule</Button></SheetTrigger>
          <SheetContent className="bg-noir-elevated border-gold/30">
            <SheetHeader><SheetTitle className="font-serif">New Objection Rule</SheetTitle></SheetHeader>
            <div className="space-y-3 mt-4">
              <FieldEl label="If they say"><Input value={form.trigger_phrase} onChange={(e) => setForm({ ...form, trigger_phrase: e.target.value })} placeholder="e.g. 'Price is too high'" /></FieldEl>
              <FieldEl label="Respond with"><Textarea rows={5} value={form.response_script} onChange={(e) => setForm({ ...form, response_script: e.target.value })} placeholder="Sir, our pricing reflects..." /></FieldEl>
              <Button onClick={save} className="w-full bg-gold text-noir hover:bg-gold/90">Save Rule</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {rules.length === 0 ? (
          <div className="md:col-span-2 text-center py-8 text-muted-foreground text-sm">No rules yet.</div>
        ) : rules.map((r) => (
          <div key={r.id} className="glass rounded-xl p-4 border-gold/20">
            <div className="flex items-start justify-between mb-2 gap-2">
              <div className="font-mono text-xs text-warning uppercase">If they say</div>
              <Switch checked={r.is_active} onCheckedChange={(v) => toggle(r.id, v)} />
            </div>
            <div className="font-serif text-base mb-3 italic">"{r.trigger_phrase}"</div>
            <div className="font-mono text-xs text-gold uppercase mb-1">Respond with</div>
            <div className="text-sm text-muted-foreground">{r.response_script}</div>
            <button onClick={() => del(r.id)} className="mt-3 text-xs text-danger hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remove</button>
          </div>
        ))}
      </div>
    </section>
  );
}
