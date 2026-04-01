"use client";

import { useState, useMemo, useCallback } from "react";
import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import OpportunityCard from "@/components/OpportunityCard";
import DetailModal from "@/components/DetailModal";
import { SEED_OPPORTUNITIES } from "@/lib/seed";
import { computeMatchScore } from "@/lib/scoring";
import { Opportunity, BrandBrief, Weights, OpportunityType, TrendDir } from "@/lib/types";

const DEFAULT_BRIEF: BrandBrief = {
  categories: [],
  objectives: [],
  budgetMin: 0,
  budgetMax: 0,
  geos: [],
};

const DEFAULT_WEIGHTS: Weights = {
  audience: 5,
  budget: 5,
  category: 5,
  exclusivity: 3,
  trend: 4,
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [brief, setBrief] = useState<BrandBrief>(DEFAULT_BRIEF);
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [typeFilters, setTypeFilters] = useState<OpportunityType[]>([]);
  const [sportFilters, setSportFilters] = useState<string[]>([]);
  const [trendFilter, setTrendFilter] = useState<TrendDir | null>(null);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  const scored = useMemo(() => {
    let opps = SEED_OPPORTUNITIES;

    if (search) {
      const q = search.toLowerCase();
      opps = opps.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.sport.toLowerCase().includes(q) ||
          o.meta.toLowerCase().includes(q) ||
          o.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (typeFilters.length > 0) {
      opps = opps.filter((o) => typeFilters.includes(o.type));
    }

    if (sportFilters.length > 0) {
      opps = opps.filter((o) => sportFilters.includes(o.sport));
    }

    if (trendFilter) {
      opps = opps.filter((o) => o.trend_dir === trendFilter);
    }

    if (brief.geos.length > 0) {
      opps = opps.filter((o) => o.geo.some((g) => brief.geos.includes(g)));
    }

    return opps
      .map((opp) => ({ opp, score: computeMatchScore(opp, brief, weights) }))
      .sort((a, b) => b.score - a.score);
  }, [search, brief, weights, typeFilters, sportFilters, trendFilter]);

  const handleExport = useCallback(() => {
    const headers = ["Name", "Type", "Sport", "Match Score", "Budget Min", "Budget Max", "Reach", "Geography", "Exclusive"];
    const rows = scored.map(({ opp, score }) => [
      opp.name, opp.type, opp.sport, score, opp.budget_min, opp.budget_max, opp.reach, opp.geo.join(";"), opp.excl ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ivy-opportunities.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [scored]);

  const selectedScore = selectedOpp
    ? scored.find((s) => s.opp.id === selectedOpp.id)?.score ?? 0
    : 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Topbar search={search} onSearchChange={setSearch} onExport={handleExport} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          brief={brief}
          onBriefChange={setBrief}
          weights={weights}
          onWeightsChange={setWeights}
          typeFilters={typeFilters}
          onTypeFiltersChange={setTypeFilters}
          sportFilters={sportFilters}
          onSportFiltersChange={setSportFilters}
          trendFilter={trendFilter}
          onTrendFilterChange={setTrendFilter}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-semibold text-ink">
              {scored.length} Opportunities
            </h2>
            <p className="text-xs text-mist">Ranked by match score</p>
          </div>

          <div className="grid gap-3">
            {scored.map(({ opp, score }) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                matchScore={score}
                onClick={() => setSelectedOpp(opp)}
              />
            ))}
          </div>

          {scored.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-mist">
              <p className="text-lg font-serif">No opportunities match your filters</p>
              <p className="text-sm mt-1">Try adjusting your brief or filters</p>
            </div>
          )}
        </main>
      </div>

      {selectedOpp && (
        <DetailModal
          opportunity={selectedOpp}
          matchScore={selectedScore}
          onClose={() => setSelectedOpp(null)}
        />
      )}
    </div>
  );
}
