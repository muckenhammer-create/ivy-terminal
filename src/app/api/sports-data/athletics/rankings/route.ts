import { NextRequest, NextResponse } from "next/server";
import { fetchWithCache, TTL } from "@/lib/sports-cache";

const API_KEY = process.env.WORLD_ATHLETICS_API_KEY;
const BASE = "https://worldathletics.org/api";

export async function GET(req: NextRequest) {
  const discipline = req.nextUrl.searchParams.get("discipline") || "100m";
  const gender = req.nextUrl.searchParams.get("gender") || "M";

  if (!API_KEY) {
    return NextResponse.json({ error: "WORLD_ATHLETICS_API_KEY not configured", data: null, source: "unavailable", fetched_at: null });
  }

  try {
    const result = await fetchWithCache(
      `athletics:rankings:${discipline}:${gender}`,
      "world_athletics",
      TTL.RANKINGS_WEEKLY,
      async () => {
        const res = await fetch(`${BASE}/rankings?discipline=${encodeURIComponent(discipline)}&gender=${gender}`, {
          headers: { "x-api-key": API_KEY! },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!Array.isArray(json.rankings)) return [];
        return json.rankings.slice(0, 50).map((r: Record<string, unknown>) => ({
          rank: r.rank,
          name: r.competitor_name || r.name,
          nationality: r.country_code,
          personal_best: r.personal_best || r.result,
          points: r.points,
        }));
      }
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch athletics rankings" }, { status: 500 });
  }
}
