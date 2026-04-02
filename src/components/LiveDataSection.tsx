"use client";

import { useState, useEffect } from "react";
import DataFreshness from "./DataFreshness";

interface LiveDataProps {
  opportunityName: string;
  opportunityType: string;
  opportunitySport: string;
}

interface EnrichmentResult {
  enrichments: {
    metadata?: { thumbnail?: string; cutout?: string; logo?: string; description?: string; stadium?: string };
    live_stats?: Record<string, unknown>;
    rankings?: unknown;
  };
  source: string;
  fetched_at: string | null;
}

export default function LiveDataSection({ opportunityName, opportunityType, opportunitySport }: LiveDataProps) {
  const [data, setData] = useState<EnrichmentResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/sports-data/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: opportunityName, type: opportunityType, sport: opportunitySport }),
    })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [opportunityName, opportunityType, opportunitySport]);

  if (loading) {
    return (
      <section className="p-4 bg-cream2 rounded-xl">
        <h3 className="font-serif text-sm font-semibold text-ink mb-2">Live Data</h3>
        <div className="flex items-center gap-2 text-xs text-mist">
          <div className="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          Fetching live data…
        </div>
      </section>
    );
  }

  if (!data || !data.enrichments || Object.keys(data.enrichments).length === 0) {
    return (
      <section className="p-4 bg-cream2 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-serif text-sm font-semibold text-ink">Live Data</h3>
          <DataFreshness fetchedAt={null} />
        </div>
        <p className="text-xs text-mist">No live data available for this opportunity.</p>
      </section>
    );
  }

  const { enrichments, fetched_at } = data;
  const stats = enrichments.live_stats as Record<string, unknown> | undefined;
  const meta = enrichments.metadata;

  return (
    <section className="p-4 bg-cream2 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-sm font-semibold text-ink">Live Data</h3>
        <DataFreshness fetchedAt={fetched_at} />
      </div>

      {/* Thumbnail/Logo from TheSportsDB */}
      {meta && (meta.thumbnail || meta.cutout || meta.logo) && (
        <div className="mb-3">
          <img
            src={(meta.cutout || meta.thumbnail || meta.logo) as string}
            alt={opportunityName}
            className="w-16 h-16 rounded-lg object-cover bg-white border border-border"
          />
        </div>
      )}

      {/* Live Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {Object.entries(stats).map(([key, value]) => {
            if (value === null || value === undefined) return null;
            const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            return (
              <div key={key} className="bg-white rounded-md p-2 border border-border">
                <p className="text-[10px] text-mist">{label}</p>
                <p className="text-sm font-semibold text-ink">
                  {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Description from metadata */}
      {meta?.description && (
        <p className="text-xs text-brown3 leading-relaxed">{meta.description as string}</p>
      )}
    </section>
  );
}
