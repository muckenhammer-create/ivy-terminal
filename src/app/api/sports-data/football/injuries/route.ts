import { NextRequest, NextResponse } from "next/server";
import { fetchWithCache, TTL } from "@/lib/sports-cache";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const BASE = "https://api-football-v3.p.rapidapi.com";

export async function GET(req: NextRequest) {
  const league = req.nextUrl.searchParams.get("league") || "39";
  const season = req.nextUrl.searchParams.get("season") || new Date().getFullYear().toString();

  if (!RAPIDAPI_KEY) {
    return NextResponse.json({ error: "RAPIDAPI_KEY not configured", data: null, source: "unavailable", fetched_at: null });
  }

  try {
    const result = await fetchWithCache(
      `football:injuries:${league}:${season}`,
      "api-football",
      TTL.STANDINGS,
      async () => {
        const res = await fetch(`${BASE}/injuries?league=${league}&season=${season}`, {
          headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY!,
            "X-RapidAPI-Host": "api-football-v3.p.rapidapi.com",
          },
        });
        const json = await res.json();
        if (!Array.isArray(json.response)) return [];

        return json.response.map((entry: Record<string, Record<string, unknown>>) => ({
          player_name: entry.player?.name,
          player_id: entry.player?.id,
          team: entry.team?.name,
          type: entry.player?.type,
          reason: entry.player?.reason,
        }));
      }
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch injury data" }, { status: 500 });
  }
}
