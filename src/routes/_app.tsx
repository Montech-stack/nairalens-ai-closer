import { Link, Outlet, useRouterState, useNavigate, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Database, Users, Megaphone, Brain, LogOut, Menu, X } from "lucide-react";
import { compactNaira } from "@/lib/format";
import { Logo } from "@/components/logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/_app")({ component: AppLayout });

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/knowledge", label: "Knowledge Vault", icon: Database },
  { to: "/leads", label: "Lead Intelligence", icon: Users, dynamic: "leads" as const },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/settings", label: "Expert Settings", icon: Brain },
];

const titles: Record<string, string> = {
  "/dashboard": "Command Center",
  "/knowledge": "Knowledge Vault",
  "/leads": "Lead Intelligence",
  "/campaigns": "Campaigns",
  "/settings": "Expert Settings",
};

function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [stats, setStats] = useState({ leads: 0, revenue: 0, active: 0 });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ count: leadCount }, { data: closed }, { count: activeCount }] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase.from("properties").select("price").eq("status", "sold"),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("stage", "hot"),
      ]);
      const revenue = (closed ?? []).reduce((s, p: any) => s + Number(p.price || 0), 0);
      setStats({ leads: leadCount ?? 0, revenue, active: activeCount ?? 0 });
    })();
  }, [user, pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-noir text-muted-foreground">
        Loading…
      </div>
    );
  }

  const title = titles[pathname] || "NairaLens";
  const SidebarContent = (
    <>
      <div className="p-4 sm:p-5 border-b border-border">
        <Logo size="md" to="/dashboard" />
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((it) => {
          const active = pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active ? "bg-gold/15 text-gold border border-gold/30" : "text-muted-foreground hover:bg-noir-elevated hover:text-foreground"}`}
            >
              <it.icon className="w-4 h-4" />
              <span className="flex-1">{it.label}</span>
              {it.dynamic === "leads" && stats.leads > 0 && (
                <span className="text-[10px] font-mono bg-noir-elevated px-1.5 py-0.5 rounded">
                  {stats.leads}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-success pulse-gold" />
          <span className="font-mono text-success">AI BRAIN ACTIVE</span>
        </div>
        <button
          onClick={() => {
            signOut();
            navigate({ to: "/" });
          }}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-gold"
        >
          <LogOut className="w-3 h-3" /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-noir">
      <aside className="hidden lg:flex w-[220px] shrink-0 bg-sidebar border-r border-border flex-col">
        {SidebarContent}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-noir-elevated/50 backdrop-blur-md flex items-center justify-between gap-3 px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden text-gold" aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="bg-sidebar border-r border-border p-0 w-[260px] flex flex-col"
              >
                <div className="flex items-center justify-between p-2 border-b border-border lg:hidden">
                  <span className="text-xs font-mono text-muted-foreground pl-3">MENU</span>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {SidebarContent}
              </SheetContent>
            </Sheet>
            <h1 className="font-serif text-lg sm:text-xl truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Single, focused metric — no clutter */}
            <div className="hidden sm:flex px-3 py-1.5 rounded-full glass border border-gold/20 items-center gap-2">
              <span className="font-mono text-[9px] text-muted-foreground">REVENUE</span>
              <span className="font-mono text-sm text-gold">
                {compactNaira(stats.revenue || 0)}
              </span>
            </div>
            <div className="px-2.5 py-1.5 rounded-full glass border border-gold/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success pulse-gold" />
              <span className="font-mono text-[10px] text-gold">{stats.active} LIVE</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto scrollbar-gold">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
