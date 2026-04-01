"use client";

import { BrandBrief, Weights, OpportunityType, TrendDir } from "@/lib/types";

const CATEGORIES = ["Sportswear", "FMCG", "Luxury", "Automotive", "Fintech", "Tech", "Beverages", "Entertainment", "Beauty", "Health", "Education"];
const OBJECTIVES = ["Brand Awareness", "Lead Generation", "Community", "Content", "Hospitality", "ESG/CSR"];
const GEOS = ["UK", "USA", "Global", "Europe", "China", "India", "LATAM", "APAC", "Africa"];
const SPORTS = ["Football", "Tennis", "Basketball", "Golf", "Athletics", "Motorsport", "Multi-sport", "Cricket", "Rugby", "Running", "Cycling"];
const TYPES: OpportunityType[] = ["athlete", "club", "event", "league", "grassroots"];

interface SidebarProps {
  brief: BrandBrief;
  onBriefChange: (b: BrandBrief) => void;
  weights: Weights;
  onWeightsChange: (w: Weights) => void;
  typeFilters: OpportunityType[];
  onTypeFiltersChange: (t: OpportunityType[]) => void;
  sportFilters: string[];
  onSportFiltersChange: (s: string[]) => void;
  trendFilter: TrendDir | null;
  onTrendFilterChange: (t: TrendDir | null) => void;
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded-full border transition-all ${
        active
          ? "bg-ink text-cream border-ink"
          : "bg-transparent text-brown3 border-border hover:border-brown3"
      }`}
    >
      {label}
    </button>
  );
}

function SliderField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-brown3 w-20 shrink-0">{label}</span>
      <input
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
      />
      <span className="text-xs font-medium text-ink w-6 text-right">{value}</span>
    </div>
  );
}

function toggleInArray<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export default function Sidebar({
  brief, onBriefChange, weights, onWeightsChange,
  typeFilters, onTypeFiltersChange, sportFilters, onSportFiltersChange,
  trendFilter, onTrendFilterChange,
}: SidebarProps) {
  return (
    <aside className="w-72 shrink-0 h-[calc(100vh-53px)] overflow-y-auto border-r border-border bg-cream p-5 space-y-6">
      {/* Brand Brief */}
      <section>
        <h3 className="font-serif text-sm font-semibold text-ink mb-3">Brand Brief</h3>

        <label className="text-xs text-mist mb-1 block">Category</label>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {CATEGORIES.map((c) => (
            <Pill key={c} label={c} active={brief.categories.includes(c)} onClick={() => onBriefChange({ ...brief, categories: toggleInArray(brief.categories, c) })} />
          ))}
        </div>

        <label className="text-xs text-mist mb-1 block">Objective</label>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {OBJECTIVES.map((o) => (
            <Pill key={o} label={o} active={brief.objectives.includes(o)} onClick={() => onBriefChange({ ...brief, objectives: toggleInArray(brief.objectives, o) })} />
          ))}
        </div>

        <label className="text-xs text-mist mb-1 block">Budget Range</label>
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            placeholder="Min"
            value={brief.budgetMin || ""}
            onChange={(e) => onBriefChange({ ...brief, budgetMin: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-xs bg-cream2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <input
            type="number"
            placeholder="Max"
            value={brief.budgetMax || ""}
            onChange={(e) => onBriefChange({ ...brief, budgetMax: Number(e.target.value) })}
            className="w-full px-2 py-1.5 text-xs bg-cream2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </div>

        <label className="text-xs text-mist mb-1 block">Geography</label>
        <div className="flex flex-wrap gap-1.5">
          {GEOS.map((g) => (
            <Pill key={g} label={g} active={brief.geos.includes(g)} onClick={() => onBriefChange({ ...brief, geos: toggleInArray(brief.geos, g) })} />
          ))}
        </div>
      </section>

      <hr className="border-border" />

      {/* Type Filters */}
      <section>
        <h3 className="font-serif text-sm font-semibold text-ink mb-3">Type</h3>
        <div className="space-y-1.5">
          {TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={typeFilters.includes(t)}
                onChange={() => onTypeFiltersChange(toggleInArray(typeFilters, t))}
                className="w-3.5 h-3.5 accent-gold"
              />
              <span className="text-xs text-ink capitalize">{t}</span>
            </label>
          ))}
        </div>
      </section>

      <hr className="border-border" />

      {/* Sport Filters */}
      <section>
        <h3 className="font-serif text-sm font-semibold text-ink mb-3">Sport</h3>
        <div className="flex flex-wrap gap-1.5">
          {SPORTS.map((s) => (
            <Pill key={s} label={s} active={sportFilters.includes(s)} onClick={() => onSportFiltersChange(toggleInArray(sportFilters, s))} />
          ))}
        </div>
      </section>

      <hr className="border-border" />

      {/* Trend Filter */}
      <section>
        <h3 className="font-serif text-sm font-semibold text-ink mb-3">Trend</h3>
        <div className="flex gap-1.5">
          {(["up", "flat", "down"] as TrendDir[]).map((t) => (
            <Pill key={t} label={t === "up" ? "Trending Up" : t === "flat" ? "Stable" : "Declining"} active={trendFilter === t} onClick={() => onTrendFilterChange(trendFilter === t ? null : t)} />
          ))}
        </div>
      </section>

      <hr className="border-border" />

      {/* Weighting Sliders */}
      <section>
        <h3 className="font-serif text-sm font-semibold text-ink mb-3">Match Weighting</h3>
        <div className="space-y-3">
          <SliderField label="Audience" value={weights.audience} onChange={(v) => onWeightsChange({ ...weights, audience: v })} />
          <SliderField label="Budget" value={weights.budget} onChange={(v) => onWeightsChange({ ...weights, budget: v })} />
          <SliderField label="Category" value={weights.category} onChange={(v) => onWeightsChange({ ...weights, category: v })} />
          <SliderField label="Exclusivity" value={weights.exclusivity} onChange={(v) => onWeightsChange({ ...weights, exclusivity: v })} />
          <SliderField label="Trend" value={weights.trend} onChange={(v) => onWeightsChange({ ...weights, trend: v })} />
        </div>
      </section>
    </aside>
  );
}
