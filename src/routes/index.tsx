import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Zap, MessageCircle, Brain, TrendingUp, Eye, Hand, Trophy,
  CheckCircle2, ArrowRight, Activity, Clock, Target, Banknote, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NairaLens — Nigeria's AI Real Estate Sales Engine" },
      { name: "description", content: "NairaLens closes WhatsApp deals 24/7 for Nigerian real estate — qualifying leads, handling objections, and driving revenue while you sleep." },
      { property: "og:title", content: "NairaLens — Nigeria's AI Real Estate Sales Engine" },
      { property: "og:description", content: "The AI sales engine built for Nigerian real estate." },
    ],
  }),
  component: Landing,
});

// ─── Custom cursor — lusion-style lagging ring ────────────────────────────────

function CustomCursor() {
  const dot  = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -300, y: -300 });
  const lag   = useRef({ x: -300, y: -300 });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setShow(true);
    const move = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dot.current)
        dot.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };
    window.addEventListener("mousemove", move, { passive: true });
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    let raf: number;
    const tick = () => {
      lag.current.x = lerp(lag.current.x, mouse.current.x, 0.09);
      lag.current.y = lerp(lag.current.y, mouse.current.y, 0.09);
      if (ring.current)
        ring.current.style.transform = `translate(${lag.current.x}px, ${lag.current.y}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  if (!show) return null;
  return (
    <>
      <div ref={dot}  className="fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gold mix-blend-difference" style={{ willChange: "transform" }} />
      <div ref={ring} className="fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-gold/50" style={{ willChange: "transform" }} />
    </>
  );
}

// ─── Mask reveal — lusion signature: text slides up from overflow:hidden ──────
// Each word/phrase sits inside a clipping box; sliding up makes it appear from nowhere.

function Mask({
  children,
  delay = 0,
  visible,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  visible: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-block overflow-hidden ${className}`}
      style={{ verticalAlign: "bottom" }}
    >
      <span
        className="inline-block"
        style={{
          transform: visible ? "translateY(0)" : "translateY(112%)",
          transition: `transform 0.95s cubic-bezier(.4,0,.1,1) ${delay}ms`,
          willChange: "transform",
        }}
      >
        {children}
      </span>
    </span>
  );
}

// ─── Scroll-reveal (below-fold elements) ─────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const HIDDEN: Record<string, React.CSSProperties> = {
  up:    { opacity: 0, transform: "translateY(36px)" },
  left:  { opacity: 0, transform: "translateX(-40px)" },
  right: { opacity: 0, transform: "translateX(40px)" },
  scale: { opacity: 0, transform: "scale(0.92)" },
  fade:  { opacity: 0 },
};

function Reveal({ children, delay = 0, dir = "up", className = "" }: {
  children: React.ReactNode; delay?: number; dir?: keyof typeof HIDDEN; className?: string;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      style={{
        ...(visible ? { opacity: 1, transform: "none" } : HIDDEN[dir]),
        transition: `opacity 0.72s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.72s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
      className={className}
    >
      {children}
    </div>
  );
}

// Section heading with per-line mask reveal
function RevealHeading({ lines, className = "" }: { lines: string[]; className?: string }) {
  const { ref, visible } = useInView(0.2);
  return (
    <div ref={ref}>
      <h2 className={className}>
        {lines.map((line, i) => (
          <span key={i} className="block">
            <Mask visible={visible} delay={i * 100}>{line}</Mask>
          </span>
        ))}
      </h2>
    </div>
  );
}

// ─── Magnetic button wrapper ──────────────────────────────────────────────────

function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left - r.width / 2)  * 0.28;
    const y = (e.clientY - r.top  - r.height / 2) * 0.28;
    if (ref.current) {
      ref.current.style.transition = "transform 0.15s ease";
      ref.current.style.transform  = `translate(${x}px, ${y}px)`;
    }
  }, []);
  const onLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1)";
      ref.current.style.transform  = "translate(0,0)";
    }
  }, []);
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ display: "inline-block", willChange: "transform" }}>
      {children}
    </div>
  );
}

// ─── Spotlight card ───────────────────────────────────────────────────────────

function SpotlightCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 0, y: 0, active: false });
  const onMove  = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    setSpot({ x: e.clientX - r.left, y: e.clientY - r.top, active: true });
  }, []);
  const onLeave = useCallback(() => setSpot(s => ({ ...s, active: false })), []);
  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative glass rounded-xl p-6 hover:border-gold/50 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-default h-full"
    >
      <div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          opacity: spot.active ? 1 : 0,
          transition: "opacity 0.25s ease",
          background: `radial-gradient(300px circle at ${spot.x}px ${spot.y}px, oklch(0.78 0.13 85 / 0.09), transparent 65%)`,
        }}
      />
      <Icon className="relative w-8 h-8 text-gold mb-4 group-hover:scale-110 transition-transform duration-300" />
      <h3 className="relative font-serif text-xl mb-2">{title}</h3>
      <p  className="relative text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function Landing() {
  return (
    <div className="min-h-screen bg-noir text-foreground overflow-x-hidden">
      <CustomCursor />
      <Nav />
      <Hero />
      <HeroBanner />
      <ProofBar />
      <VsHumanSection />
      <RevenueMultiplier />
      <HowItWorks />
      <PhotoGrid />
      <WhatsAppIntegration />
      <Features />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-noir/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo size="md" />
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#vs-human" className="hover:text-gold transition-colors duration-200">vs. Humans</a>
          <a href="#how"      className="hover:text-gold transition-colors duration-200">How it works</a>
          <a href="#whatsapp" className="hover:text-gold transition-colors duration-200">WhatsApp</a>
          <a href="#features" className="hover:text-gold transition-colors duration-200">Features</a>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-gold transition-colors duration-200">Sign in</Link>
          <Link to="/onboarding">
            <Button className="bg-gold text-noir hover:bg-gold/90 font-semibold">Start Free Trial</Button>
          </Link>
        </div>
        <button className="md:hidden text-gold" onClick={() => setOpen(o => !o)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-noir/95 backdrop-blur-xl px-6 py-4 space-y-3">
          <a href="#vs-human" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground">vs. Humans</a>
          <a href="#how"      onClick={() => setOpen(false)} className="block text-sm text-muted-foreground">How it works</a>
          <a href="#whatsapp" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground">WhatsApp</a>
          <a href="#features" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground">Features</a>
          <div className="pt-3 border-t border-border flex gap-3">
            <Link to="/auth" className="flex-1 text-center py-2 text-sm border border-border rounded-md">Sign in</Link>
            <Link to="/onboarding" className="flex-1">
              <Button className="w-full bg-gold text-noir hover:bg-gold/90 font-semibold">Start Trial</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="orb-drift-1 absolute w-[560px] h-[560px] rounded-full bg-gold/[0.05] blur-[110px]" style={{ top: "-18%", left: "-10%" }} />
      <div className="orb-drift-2 absolute w-[400px] h-[400px] rounded-full bg-gold/[0.07] blur-[90px]"  style={{ bottom: "-12%", right: "-6%" }} />
      <div className="orb-drift-3 absolute w-[240px] h-[240px] rounded-full bg-gold/[0.04] blur-[70px]"  style={{ top: "38%", left: "54%" }} />
    </div>
  );
}

// Word-level data for the headline — each word gets its own Mask reveal
const HEADLINE_WORDS: { text: string; gold: boolean }[] = [
  { text: "The",      gold: false },
  { text: "#1",       gold: true  },
  { text: "Nigerian", gold: false },
  { text: "Real",     gold: true  },
  { text: "Estate",   gold: true  },
  { text: "Sales",    gold: true  },
  { text: "Expert",   gold: true  },
  { text: "Engine",   gold: false },
];

function Hero() {
  // Hero is above the fold — use a mounted flag, not IntersectionObserver
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 gradient-mesh overflow-hidden min-h-[100svh] flex items-center">
      <FloatingOrbs />
      <div className="absolute inset-0 shimmer pointer-events-none opacity-50" aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Text column ── */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[10px] sm:text-xs font-mono text-gold mb-6 sm:mb-8 max-w-full"
              style={{ opacity: ready ? 1 : 0, transition: "opacity 0.6s ease 0ms" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success pulse-gold shrink-0" />
              <span className="hidden sm:inline truncate">AI-POWERED REAL ESTATE SALES FOR NIGERIA</span>
              <span className="sm:hidden">AI REAL ESTATE SALES · NIGERIA</span>
            </div>

            {/* Headline — word-by-word mask reveal (lusion-style) */}
            {/* Each word sits inside an overflow:hidden clip box and slides up on mount */}
            <h1 className="font-serif text-[2.05rem] leading-[1.18] sm:text-[2.7rem] md:text-5xl lg:text-6xl xl:text-7xl lg:leading-[1.06]">
              {HEADLINE_WORDS.map((w, i) => (
                <span key={i}>
                  <span className="inline-block overflow-hidden" style={{ verticalAlign: "bottom" }}>
                    <span
                      className={`inline-block${w.gold ? " text-gold gold-text-glow" : ""}`}
                      style={{
                        transform: ready ? "translateY(0)" : "translateY(112%)",
                        transition: `transform 0.95s cubic-bezier(.4,0,.1,1) ${i * 52}ms`,
                        willChange: "transform",
                      }}
                    >
                      {w.text}
                    </span>
                  </span>
                  {i < HEADLINE_WORDS.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>

            {/* Subtitle */}
            <p
              className="mt-5 sm:mt-6 text-[0.95rem] sm:text-lg text-muted-foreground max-w-lg"
              style={{
                opacity: ready ? 1 : 0,
                transform: ready ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.8s ease 700ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 700ms",
              }}
            >
              NairaLens handles every WhatsApp lead around the clock — qualifying, pushing back on objections, and locking in deals. No commissions. No sick days. No 6 PM cut-off.
            </p>

            {/* CTAs */}
            <div
              className="mt-7 sm:mt-8 flex flex-wrap gap-3 justify-center lg:justify-start"
              style={{
                opacity: ready ? 1 : 0,
                transform: ready ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.8s ease 840ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) 840ms",
              }}
            >
              <Magnetic>
                <Link to="/onboarding">
                  <Button size="lg" className="bg-gold text-noir hover:bg-gold/90 font-semibold cta-pulse">
                    Activate My AI Closer <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </Magnetic>
              <Magnetic>
                <a href="#how">
                  <Button size="lg" variant="outline" className="border-gold/40 text-gold hover:bg-gold/10 transition-colors">
                    See How It Works
                  </Button>
                </a>
              </Magnetic>
            </div>

            <p
              className="mt-3 text-[11px] font-mono text-muted-foreground/60"
              style={{ opacity: ready ? 1 : 0, transition: "opacity 0.6s ease 1000ms" }}
            >
              No credit card required · Setup in under 60 seconds
            </p>

            {/* Stats — each pops in with its own delay */}
            <div className="mt-8 flex gap-6 sm:gap-10 justify-center lg:justify-start">
              {[
                { value: "3.2×", label: "Revenue lift", delay: 1020 },
                { value: "73%",  label: "Close rate",   delay: 1140 },
                { value: "<8s",  label: "Reply time",   delay: 1260 },
              ].map(({ value, label, delay }) => (
                <div
                  key={label}
                  style={{
                    opacity: ready ? 1 : 0,
                    transform: ready ? "translateY(0) scale(1)" : "translateY(20px) scale(0.88)",
                    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
                  }}
                >
                  <div className="font-serif text-2xl sm:text-3xl text-gold gold-text-glow">{value}</div>
                  <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <p
              className="mt-5 text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest"
              style={{ opacity: ready ? 1 : 0, transition: "opacity 0.6s ease 1440ms" }}
            >
              Active across Lagos · Abuja · Port Harcourt · Kano
            </p>
          </div>

          {/* ── Card — desktop only ── */}
          <div
            className="hidden lg:block"
            style={{
              opacity: ready ? 1 : 0,
              transform: ready ? "translateX(0)" : "translateX(52px)",
              transition: "opacity 0.9s ease 280ms, transform 0.9s cubic-bezier(0.16,1,0.3,1) 280ms",
            }}
          >
            <div className="float-slow">
              <LiveNegotiationCard />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Live Negotiation Card ────────────────────────────────────────────────────

function LiveNegotiationCard() {
  const [score, setScore] = useState(66);
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = [
    { role: "lead", text: "Is the Maitama plot still available?" },
    { role: "ai",   text: "Yes — Plot 14 at ₦185M. Only one left.",     note: "↳ Scarcity trigger" },
    { role: "lead", text: "That's high. Can we negotiate?" },
    { role: "ai",   text: "I can hold it 24hrs for a site visit today.", note: "↳ Binary close + urgency" },
    { role: "lead", text: "Okay, what time works?" },
    { role: "ai",   text: "10 AM or 2 PM — which suits you?",           note: "↳ Assumptive close" },
  ];
  useEffect(() => {
    const t = setInterval(() => {
      setScore(s => s >= 95 ? 66 : Math.min(96, s + Math.floor(Math.random() * 7) + 2));
      setMsgIdx(i => (i + 1) % (messages.length + 1));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-gold/[0.08] blur-3xl rounded-3xl" />
      <div className="relative glass-gold rounded-2xl p-5 sm:p-6 gold-glow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-danger pulse-red" />
            <span className="font-mono text-xs text-muted-foreground">LIVE NEGOTIATION</span>
          </div>
          <span className="font-mono text-xs text-gold">MAITAMA, ABUJA</span>
        </div>
        <div className="mb-4">
          <div className="text-[10px] text-muted-foreground mb-1 font-mono tracking-widest">BUYER INTENT</div>
          <div className="flex items-end gap-2">
            <span className="font-mono text-5xl text-gold gold-text-glow transition-all duration-500">{score}</span>
            <span className="text-muted-foreground text-sm pb-2">/ 100</span>
          </div>
          <div className="mt-2 h-1.5 bg-noir-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full transition-all duration-700 ease-out"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
        <div className="space-y-2.5 max-h-60 overflow-hidden">
          {messages.slice(0, msgIdx + 1).map((m, i) => (
            <div key={i} className={`text-sm ${m.role === "ai" ? "text-foreground" : "text-muted-foreground"}`}>
              <div className={`px-3 py-2 rounded-xl text-xs sm:text-sm ${m.role === "ai" ? "bg-gold/10 border border-gold/20" : "bg-noir-elevated"} max-w-[88%] ${m.role === "lead" ? "ml-auto" : ""}`}>
                {m.text}
              </div>
              {m.note && <div className="font-mono text-[10px] text-gold/70 mt-1 ml-2">{m.note}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Hero Banner ─────────────────────────────────────────────────────────────

function HeroBanner() {
  return (
    <div className="relative w-full h-56 sm:h-72 md:h-96 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=80&auto=format&fit=crop&crop=center"
        alt="Business deal being signed"
        className="w-full h-full object-cover object-center"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-noir/85 via-noir/55 to-noir/20" />
      <div className="absolute inset-0 flex items-center px-6 sm:px-10 md:px-16">
        <div className="max-w-xl">
          <p className="font-serif text-xl sm:text-3xl md:text-4xl text-foreground leading-snug">
            "Every lead that walks away is{" "}
            <span className="text-gold gold-text-glow">revenue left on the table.</span>"
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 font-mono uppercase tracking-widest">
            NairaLens stops that. Permanently.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Proof Bar ────────────────────────────────────────────────────────────────

const proofStats = [
  "Replies in seconds, not hours",
  "Works 24 / 7 — never sleeps, never forgets",
  "Built for Naija — Lagos, Abuja, PH, Kano & beyond",
  "Speaks WhatsApp like your sharpest closer",
  "Trained on real Nigerian buyer objections",
  "Your knowledge vault, your tone, your rules",
  "No commissions. No sick days. No drop-offs.",
];

function ProofBar() {
  return (
    <section className="py-10 border-y border-border bg-noir-elevated/30 overflow-hidden">
      <div className="flex ticker whitespace-nowrap">
        {[...proofStats, ...proofStats].map((s, i) => (
          <div key={i} className="flex items-center px-8 sm:px-10 font-mono text-gold text-base sm:text-lg">
            <span>{s}</span>
            <span className="mx-8 sm:mx-10 text-gold/30">◆</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── VS Human ────────────────────────────────────────────────────────────────

function VsHumanSection() {
  const rows = [
    { metric: "Reply time",                 human: "47 minutes avg",        ai: "< 8 seconds" },
    { metric: "Working hours",              human: "8–10 hrs/day",          ai: "24 / 7 / 365" },
    { metric: "Simultaneous conversations", human: "2–3 max",               ai: "Unlimited" },
    { metric: "Objection recall",           human: "Inconsistent",          ai: "Instant, every time" },
    { metric: "Midnight availability",      human: "Unavailable",           ai: "Full capacity" },
    { metric: "Live FX & market data",      human: "Manual research",       ai: "Auto-injected" },
    { metric: "Monthly cost",               human: "₦400k–2M + commission", ai: "Flat subscription" },
  ];
  return (
    <section id="vs-human" className="py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <Reveal dir="fade"><p className="font-mono text-xs text-gold mb-4">— THE EDGE —</p></Reveal>
          <RevealHeading
            lines={["Why NairaLens out-performs", "even the best human closer."]}
            className="font-serif text-3xl sm:text-4xl md:text-5xl"
          />
          <Reveal dir="up" delay={200}>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-sm sm:text-base">
              Great agents exist. But they clock out, get sick, forget follow-ups, and can only hold one conversation at a time. NairaLens has none of those limits.
            </p>
          </Reveal>
        </div>
        <div className="glass rounded-2xl overflow-hidden border border-gold/20">
          <div className="grid grid-cols-3 px-4 sm:px-6 py-4 border-b border-border bg-noir-elevated/40">
            <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase">Metric</div>
            <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase">Human Realtor</div>
            <div className="font-mono text-[10px] sm:text-xs text-gold uppercase">NairaLens AI</div>
          </div>
          {rows.map((r, i) => (
            <Reveal key={i} delay={i * 55} dir="left">
              <div className="grid grid-cols-3 px-4 sm:px-6 py-4 border-b border-border/50 last:border-0 items-center">
                <div className="text-xs sm:text-sm font-medium">{r.metric}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{r.human}</div>
                <div className="text-xs sm:text-sm text-gold flex items-center gap-2 font-medium">
                  <Trophy className="w-3.5 h-3.5 shrink-0" /> {r.ai}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Revenue Multiplier ───────────────────────────────────────────────────────

function RevenueMultiplier() {
  const cards = [
    { icon: Banknote, title: "Revenue × 3.2",    desc: "Every lead that messages your number gets an instant, intelligent reply — midnight, Sunday, or mid-presentation. No lead left cold." },
    { icon: Target,   title: "Profit × 2.4",     desc: "Handle an unlimited volume of leads with zero headcount increase. No payroll. No commission. No downtime." },
    { icon: Clock,    title: "Cycle × 5 faster", desc: "Leads get a reply in under 8 seconds. Pre-built objection scripts deploy instantly. Your pipeline shrinks from weeks to days." },
  ];
  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 bg-noir-elevated/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <Reveal dir="fade"><p className="font-mono text-xs text-gold mb-4">— THE OUTCOME —</p></Reveal>
          <RevealHeading lines={["Multiply revenue.", "Boost profit. Asymmetrically."]} className="font-serif text-3xl sm:text-4xl md:text-5xl" />
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {cards.map((c, i) => (
            <Reveal key={i} delay={i * 110} dir="up" className="h-full">
              <div className="glass rounded-2xl p-6 sm:p-8 hover:border-gold/40 transition-all duration-300 h-full">
                <c.icon className="w-9 h-9 text-gold mb-4" />
                <h3 className="font-serif text-2xl mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    { icon: MessageCircle, title: "Lead Hits WhatsApp",    desc: "Any source — Instagram ad, referral, cold inbox — routes straight into your business number." },
    { icon: Brain,         title: "AI Qualifies Instantly", desc: "Scores intent 0–100, identifies buyer type, deploys the right objection response, and moves the lead toward commitment." },
    { icon: CheckCircle2,  title: "Deal Closes Itself",    desc: "Site visit booked. Payment plan confirmed. Contract terms locked. You wake up to closed business." },
  ];
  return (
    <section id="how" className="py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <Reveal dir="fade"><p className="font-mono text-xs text-gold mb-4">— THE ENGINE —</p></Reveal>
          <RevealHeading lines={["Three steps.", "Deals closed on autopilot."]} className="font-serif text-3xl sm:text-4xl md:text-5xl" />
        </div>
        <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 110} dir="up" className="h-full">
              <div className="glass rounded-2xl p-6 sm:p-8 hover:border-gold/40 transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center">
                    <s.icon className="w-6 h-6 sm:w-7 sm:h-7 text-gold" />
                  </div>
                  <span className="font-mono text-3xl sm:text-4xl text-gold/25">0{i + 1}</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WhatsApp Integration ─────────────────────────────────────────────────────

function WhatsAppIntegration() {
  const steps = [
    "Sign in with your Meta / Facebook Business account — no developer account needed.",
    "Select your WhatsApp Business number or connect your Facebook and Instagram ad accounts.",
    "NairaLens links up in seconds. No API keys, no webhook URLs, no developer setup.",
    "Every new lead — from WhatsApp or your Meta ad campaigns — lands in Lead Intelligence instantly.",
    "Your AI persona replies in under 8 seconds, qualifies intent, and drives toward a close.",
  ];
  return (
    <section id="whatsapp" className="py-20 sm:py-24 px-4 sm:px-6 bg-noir-elevated/30">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <Reveal dir="fade"><p className="font-mono text-xs text-gold mb-4">— PLUG-IN —</p></Reveal>
          <RevealHeading lines={["Connected in", "under 60 seconds."]} className="font-serif text-3xl sm:text-4xl md:text-5xl" />
          <Reveal dir="left" delay={200}>
            <p className="text-muted-foreground mt-4 text-sm sm:text-base max-w-md">
              No API keys. No developer setup. Connect your Meta account once and NairaLens handles every inbound lead — from WhatsApp messages and Meta ad forms alike.
            </p>
            <ol className="mt-6 space-y-3">
              {steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm sm:text-base">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-gold/15 border border-gold/40 text-gold font-mono text-xs flex items-center justify-center">{i + 1}</span>
                  <span className="text-muted-foreground">{s}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 px-4 py-3 rounded-lg bg-gold/5 border border-gold/20 text-xs sm:text-sm text-gold">
              ⚡ WhatsApp Business numbers and Meta Lead Ad accounts both supported — your leads, one pipeline, one AI.
            </div>
          </Reveal>
        </div>
        <Reveal dir="right" delay={120}>
          <div className="relative">
            <div className="absolute -inset-4 bg-gold/10 blur-3xl rounded-3xl" />
            <div className="relative glass-gold rounded-2xl p-6 gold-glow">
              <div className="flex items-center gap-2 pb-3 border-b border-border mb-4">
                <div className="w-7 h-7 rounded bg-[#1877F2]/20 flex items-center justify-center shrink-0">
                  <span className="font-bold text-[#1877F2] text-sm leading-none">f</span>
                </div>
                <div className="text-xs font-mono text-muted-foreground">Meta Lead — Maitama Gardens Campaign</div>
                <div className="ml-auto text-[10px] font-mono text-success shrink-0">● LIVE</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="text-[10px] font-mono text-muted-foreground mb-2 uppercase tracking-wider">Lead submitted form → NairaLens AI</div>
                <div className="bg-noir-elevated rounded-xl px-3 py-2 max-w-[82%] text-xs leading-relaxed">
                  Name: Chukwuemeka Obi<br />
                  Phone: +234 803 ••• 4421<br />
                  Interest: 600sqm Maitama plot
                </div>
                <div className="ml-auto bg-gold/10 border border-gold/20 rounded-xl px-3 py-2 max-w-[85%] text-xs">
                  Hi Chukwuemeka 👋 Thanks for your interest in Plot 14. It's still live at ₦185M. Are you buying for yourself or as an investment?
                </div>
                <div className="font-mono text-[10px] text-gold mt-1">↳ AI engaged in 4s · Intent score: 71</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const features = [
  { icon: Activity,   title: "Live Intent Scoring",     desc: "Every lead is scored 0–100 in real time. You always know who's hot and who needs more time." },
  { icon: Zap,        title: "Objection Kill-Switch",   desc: "Pre-program your best responses to any objection. Deployed in the right moment, every time." },
  { icon: TrendingUp, title: "Market Pulse Sync",       desc: "Live FX rates, infrastructure news, and market data injected into conversations automatically." },
  { icon: Eye,        title: "Full Conversation Audit", desc: "Every WhatsApp chat is logged with AI annotations showing which tactics fired and why." },
  { icon: Brain,      title: "Legal Document Brain",    desc: "Upload your C of O, Gazette, Survey Plans. The AI recalls and quotes the right documents on demand." },
  { icon: Hand,       title: "Manual Override",         desc: "Take control of any chat the moment you want. Your instincts, amplified — not replaced." },
];

function Features() {
  return (
    <section id="features" className="py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <Reveal dir="fade"><p className="font-mono text-xs text-gold mb-4">— THE ARSENAL —</p></Reveal>
          <RevealHeading lines={["Trained on the world's best", "sales experts."]} className="font-serif text-3xl sm:text-4xl md:text-5xl" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 75} dir="scale" className="h-full">
              <SpotlightCard icon={f.icon} title={f.title} desc={f.desc} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Photo Grid ───────────────────────────────────────────────────────────────

const GRID_PHOTOS = [
  {
    src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&q=80&auto=format&fit=crop",
    stat: "Deal signed.",
    label: "₦185M. Zero human effort.",
  },
  {
    src: "https://images.unsplash.com/photo-1586996157600-590ad5dc61b5?w=900&q=80&auto=format&fit=crop",
    stat: "< 8 seconds.",
    label: "AI reply time. Every single lead.",
  },
  {
    src: "https://images.unsplash.com/photo-1724482606633-fa74fe4f5de1?w=900&q=80&auto=format&fit=crop",
    stat: "73% close rate.",
    label: "Agents who run NairaLens full-time.",
  },
];

function PhotoGrid() {
  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 bg-noir-elevated/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <Reveal dir="fade"><p className="font-mono text-xs text-gold mb-4">— IN THE FIELD —</p></Reveal>
          <RevealHeading lines={["Real deals.", "Real numbers."]} className="font-serif text-3xl sm:text-4xl md:text-5xl" />
        </div>
        <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
          {GRID_PHOTOS.map((p, i) => (
            <Reveal key={i} delay={i * 120} dir="up">
              <div className="relative rounded-2xl overflow-hidden group aspect-[4/3]">
                <img
                  src={p.src}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/40 to-noir/10" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  <div className="font-serif text-2xl sm:text-3xl text-gold gold-text-glow">{p.stat}</div>
                  <div className="text-xs sm:text-sm text-foreground/75 mt-1 font-mono">{p.label}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "Is NairaLens a CRM?",
    a: "No — it's an AI sales execution engine. A CRM stores and organises your leads. NairaLens actively talks to them, qualifies their intent, handles objections, and books site visits — autonomously. Think of it as a closer that never clocks out, not a filing cabinet.",
  },
  {
    q: "Which Nigerian cities does NairaLens support?",
    a: "All of them. If your lead is on WhatsApp, NairaLens can close them — Lagos, Abuja, Port Harcourt, Kano, Ibadan, Enugu, and diaspora buyers in the UK, US, or Canada. There are no city restrictions.",
  },
  {
    q: "Do I need a developer to set it up?",
    a: "No. NairaLens connects in under 60 seconds. You sign in with your Meta / Facebook Business account, select your WhatsApp Business number or ad account, and you're live. No API keys. No webhooks. No code.",
  },
  {
    q: "Does it work with my Facebook and Instagram ads?",
    a: "Yes. When a lead fills in a Meta Lead Ad form, NairaLens receives their details instantly and starts the conversation before the lead goes cold. WhatsApp inbound and Meta Lead Ads both feed the same pipeline.",
  },
  {
    q: "What if a lead needs a human to take over?",
    a: "Manual override is always available. You can jump into any chat at any moment — the AI steps aside, you take control, and NairaLens picks back up when you hand off. Your instincts amplified, not replaced.",
  },
  {
    q: "What property types does it handle?",
    a: "All of them — land, detached houses, terraces, apartments, mixed-use, and commercial. You upload your listings and legal documents once. NairaLens quotes the right details in every conversation.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes. No credit card required to get started. Set up your AI closer in under 60 seconds and see it handle your first leads before you pay a naira.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 bg-noir-elevated/30">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Reveal dir="fade"><p className="font-mono text-xs text-gold mb-4">— FAQ —</p></Reveal>
          <RevealHeading lines={["Everything you need", "to know."]} className="font-serif text-3xl sm:text-4xl md:text-5xl" />
        </div>
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <Reveal key={i} delay={i * 55} dir="up">
              <div className="glass rounded-xl overflow-hidden border border-border hover:border-gold/30 transition-colors duration-200">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                >
                  <span className="font-serif text-base sm:text-lg">{item.q}</span>
                  <span
                    className="shrink-0 w-6 h-6 rounded-full border border-gold/40 text-gold flex items-center justify-center text-sm font-mono transition-transform duration-300"
                    style={{ transform: open === i ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    +
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: open === i ? "300px" : "0px" }}
                >
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6">
      <Reveal dir="scale">
        <div className="max-w-4xl mx-auto glass-gold rounded-3xl p-8 sm:p-14 text-center border-breathe">
          <RevealHeading
            lines={["Stop losing deals", "to slow replies."]}
            className="font-serif text-3xl sm:text-4xl md:text-5xl"
          />
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Let NairaLens take the night shift, the weekend shift, and every shift in between.
          </p>
          <div className="mt-8 inline-block">
            <Magnetic>
              <Link to="/onboarding">
                <Button size="lg" className="bg-gold text-noir hover:bg-gold/90 font-semibold cta-pulse">
                  Activate My AI Closer <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </Magnetic>
          </div>
          <p className="mt-4 text-xs font-mono text-muted-foreground/60">No credit card required · Cancel anytime</p>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-border py-10 sm:py-12 px-4 sm:px-6 bg-noir-elevated/30">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <Logo size="md" />
          <p className="text-sm text-muted-foreground max-w-md mt-4">
            The AI sales engine for Nigerian real estate. Built for the Nigerian buyer. Running around the clock.
          </p>
        </div>
        <div>
          <h4 className="font-mono text-xs text-gold mb-3">PRODUCT</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#features" className="hover:text-gold transition-colors duration-200">Features</a></li>
            <li><a href="#whatsapp" className="hover:text-gold transition-colors duration-200">WhatsApp setup</a></li>
            <li><Link to="/onboarding" className="hover:text-gold transition-colors duration-200">Get started</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-xs text-gold mb-3">COMPANY</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-gold transition-colors duration-200">About</a></li>
            <li><Link to="/privacy" className="hover:text-gold transition-colors duration-200">Privacy Policy</Link></li>
            <li><Link to="/terms"   className="hover:text-gold transition-colors duration-200">Terms of Service</Link></li>
            <li><a href="mailto:support@nairalens.com" className="hover:text-gold transition-colors duration-200">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-border text-xs text-muted-foreground font-mono flex flex-wrap justify-between gap-3">
        <span>© 2026 MONTECH Innovations. All Rights Reserved.</span>
        <span className="text-gold">NairaLens is a product of MONTECH Innovations.</span>
      </div>
    </footer>
  );
}
