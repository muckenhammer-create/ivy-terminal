import { NextRequest, NextResponse } from "next/server";
import { fetchWithCache, TTL } from "@/lib/sports-cache";

const API_KEY = process.env.WORLD_ATHLETICS_API_KEY;
const BASE = "https://worldathletics.org/api";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  if (!API_KEY) {
    return NextResponse.json({ error: "WORLD_ATHLETICS_API_KEY not configured", data: null, source: "unavailable", fetched_at: null });
  }

  try {
    const result = await fetchWithCache(
      `athletics:athlete:${name.toLowerCase()}`,
      "world_athletics",
      TTL.PLAYER_STATS,
      async () => {
        const res = await fetch(`${BASE}/athletes?name=${encodeURIComponent(name)}`, {
          headers: { "x-api-key": API_KEY! },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const athlete = json.athletes?.[0] || json.results?.[0];
        if (!athlete) return null;
        return {
          name: athlete.name || athlete.full_name,
          nationality: athlete.country_code,
          discipline: athlete.discipline || athlete.primary_discipline,
          personal_bests: athlete.personal_bests || [],
          recent_results: athlete.recent_results?.slice(0, 5) || [],
        };
      }
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch athlete data" }, { status: 500 });
  }
}
