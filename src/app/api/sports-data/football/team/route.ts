import { NextRequest, NextResponse } from "next/server";
import { fetchWithCache, TTL } from "@/lib/sports-cache";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const BASE = "https://api-football-v3.p.rapidapi.com";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const season = req.nextUrl.searchParams.get("season") || new Date().getFullYear().toString();
  const league = req.nextUrl.searchParams.get("league") || "39"; // Default: Premier League

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (!RAPIDAPI_KEY) {
    return NextResponse.json({ error: "RAPIDAPI_KEY not configured", data: null, source: "unavailable", fetched_at: null });
  }

  try {
    const result = await fetchWithCache(
      `football:team:${id}:${season}:${league}`,
      "api-football",
      TTL.STANDINGS,
      async () => {
        const res = await fetch(`${BASE}/teams/statistics?team=${id}&season=${season}&league=${league}`, {
          headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY!,
            "X-RapidAPI-Host": "api-football-v3.p.rapidapi.com",
          },
        });
        const json = await res.json();
        const stats = json.response;
        if (!stats) return null;

        return {
          team: stats.team?.name,
          league: stats.league?.name,
          form: stats.form?.slice(-5),
          goals_for: stats.goals?.for?.total?.total,
          goals_against: stats.goals?.against?.total?.total,
          wins: stats.fixtures?.wins?.total,
          draws: stats.fixtures?.draws?.total,
          losses: stats.fixtures?.loses?.total,
          clean_sheets: stats.clean_sheet?.total,
        };
      }
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch team data" }, { status: 500 });
  }
}
