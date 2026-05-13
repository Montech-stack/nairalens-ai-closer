export const formatNaira = (n: number | null | undefined) => {
  if (n == null) return "₦0";
  return "₦" + Number(n).toLocaleString("en-NG", { maximumFractionDigits: 0 });
};

export const compactNaira = (n: number | null | undefined) => {
  if (n == null) return "₦0";
  const v = Number(n);
  if (v >= 1e9) return `₦${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `₦${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `₦${(v / 1e3).toFixed(0)}K`;
  return `₦${v}`;
};

export const timeAgo = (date: string | Date) => {
  const d = typeof date === "string" ? new Date(date) : date;
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
