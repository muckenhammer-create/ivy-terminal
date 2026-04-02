"use client";

interface DataFreshnessProps {
  fetchedAt: string | null;
  size?: "sm" | "md";
}

export default function DataFreshness({ fetchedAt, size = "sm" }: DataFreshnessProps) {
  if (!fetchedAt) {
    return (
      <span className={`inline-flex items-center gap-1 ${size === "sm" ? "text-[10px]" : "text-xs"}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-mist" />
        <span className="text-mist">Estimated</span>
      </span>
    );
  }

  const hoursAgo = (Date.now() - new Date(fetchedAt).getTime()) / (1000 * 60 * 60);

  let color = "bg-mist";
  let label = "Stale";

  if (hoursAgo < 24) {
    color = "bg-green";
    label = "Live";
  } else if (hoursAgo < 168) {
    color = "bg-gold";
    label = "Recent";
  }

  return (
    <span className={`inline-flex items-center gap-1 ${size === "sm" ? "text-[10px]" : "text-xs"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span className="text-mist">{label}</span>
    </span>
  );
}
