"use client";

import { Opportunity } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  athlete: "bg-gold/10 text-gold",
  club: "bg-green/10 text-green",
  event: "bg-red/10 text-red",
  league: "bg-brown3/10 text-brown3",
  grassroots: "bg-ink/10 text-ink",
};

function TrendIcon({ dir }: { dir: string }) {
  if (dir === "up") return <span className="text-green text-sm">&#9650;</span>;
  if (dir === "down") return <span className="text-red text-sm">&#9660;</span>;
  return <span className="text-mist text-sm">&#9644;</span>;
}

function formatBudget(min: number, max: number): string {
  const fmt = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };
  return `$${fmt(min)} – $${fmt(max)}`;
}

interface CardProps {
  opportunity: Opportunity;
  matchScore: number;
  onClick: () => void;
}

export default function OpportunityCard({ opportunity: opp, matchScore, onClick }: CardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-white rounded-xl border border-border hover:border-gold/30 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md ${TYPE_COLORS[opp.type]}`}>
            {opp.type}
          </span>
          <span className="text-[11px] text-mist">{opp.sport}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendIcon dir={opp.trend_dir} />
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cream2 border border-border">
            <span className="text-sm font-bold text-ink">{matchScore}</span>
          </div>
        </div>
      </div>

      <h3 className="font-serif text-lg font-semibold text-ink group-hover:text-gold transition-colors mb-1">
        {opp.name}
      </h3>
      <p className="text-xs text-brown3 leading-relaxed mb-3 line-clamp-2">{opp.meta}</p>

      <div className="flex items-center gap-3 text-[11px] text-mist">
        <span>{formatBudget(opp.budget_min, opp.budget_max)}</span>
        <span className="w-px h-3 bg-border" />
        <span>{opp.reach} reach</span>
        <span className="w-px h-3 bg-border" />
        <span>{opp.geo.slice(0, 3).join(", ")}{opp.geo.length > 3 ? "…" : ""}</span>
        {opp.excl && (
          <>
            <span className="w-px h-3 bg-border" />
            <span className="text-green font-medium">Exclusive</span>
          </>
        )}
      </div>
    </button>
  );
}
