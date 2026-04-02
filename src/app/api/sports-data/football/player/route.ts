import { NextRequest, NextResponse } from "next/server";
import { fetchWithCache, TTL } from "@/lib/sports-cache";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const BASE = "https://api-football-v3.p.rapidapi.com";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const season = req.nextUrl.searchParams.get("season") || new Date().getFullYear().toString();

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (!RAPIDAPI_KEY) {
    return NextResponse.json({ error: "RAPIDAPI_KEY not configured", data: null, source: "unavailable", fetched_at: null });
  }

  try {
    const result = await fetchWithCache(
      `football:player:${id}:${season}`,
      "api-football",
      TTL.PLAYER_STATS,
      async () => {
        const res = await fetch(`${BASE}/players?id=${id}&season=${season}`, {
          headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY!,
            "X-RapidAPI-Host": "api-football-v3.p.rapidapi.com",
          },
        });
        const json = await res.json();
        const player = json.response?.[0];
        if (!player) return null;

        const stats = player.statistics?.[0];
        return {
          name: player.player?.name,
          age: player.player?.age,
          nationality: player.player?.nationality,
          photo: player.player?.photo,
          team: stats?.team?.name,
          league: stats?.league?.name,
          appearances: stats?.games?.appearences,
          goals: stats?.goals?.total,
          assists: stats?.goals?.assists,
          rating: stats?.games?.rating ? parseFloat(stats.games.rating) : null,
          injured: player.player?.injured ?? false,
          injury_type: null,
          form_score: stats?.games?.rating ? Math.round(parseFloat(stats.games.rating) * 10) : null,
        };
      }
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch player data" }, { status: 500 });
  }
}
