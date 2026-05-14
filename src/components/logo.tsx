import { Link } from "@tanstack/react-router";

type Props = {
  size?: "sm" | "md" | "lg";
  withWordmark?: boolean;
  to?: string;
  className?: string;
};

const sizeMap = {
  sm: { box: 32, text: "text-base" },
  md: { box: 40, text: "text-xl" },
  lg: { box: 56, text: "text-3xl" },
};

export function Logo({ size = "md", withWordmark = true, to = "/", className = "" }: Props) {
  const s = sizeMap[size];
  const inner = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={s.box} height={s.box} viewBox="0 0 64 64" fill="none" aria-label="NairaLens logo">
        <defs>
          <linearGradient id="nl-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#1a1306" />
            <stop offset="1" stopColor="#080808" />
          </linearGradient>
          <linearGradient id="nl-mark" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F5D77A" />
            <stop offset="0.55" stopColor="#D4AF37" />
            <stop offset="1" stopColor="#A8821F" />
          </linearGradient>
        </defs>
        {/* outer plate */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="14"
          fill="url(#nl-bg)"
          stroke="url(#nl-mark)"
          strokeWidth="1.5"
        />
        {/* lens ring */}
        <circle cx="32" cy="30" r="15" stroke="url(#nl-mark)" strokeWidth="2.4" fill="none" />
        {/* monogram N inside lens */}
        <path d="M25 38V22h2.4l9.2 11.4V22H39v16h-2.4l-9.2-11.4V38H25z" fill="url(#nl-mark)" />
        {/* naira bar through monogram */}
        <line x1="22" y1="28" x2="42" y2="28" stroke="url(#nl-mark)" strokeWidth="1.4" />
        <line x1="22" y1="32" x2="42" y2="32" stroke="url(#nl-mark)" strokeWidth="1.4" />
        {/* lens handle */}
        <line
          x1="43.5"
          y1="41.5"
          x2="52"
          y2="50"
          stroke="url(#nl-mark)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {withWordmark && (
        <div className="flex flex-col leading-none">
          <span className={`font-serif text-gold ${s.text} tracking-tight`}>NairaLens</span>
          <span className="font-mono text-[9px] text-muted-foreground tracking-[0.2em] mt-1 uppercase">
            AI Sales Engine
          </span>
        </div>
      )}
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}
