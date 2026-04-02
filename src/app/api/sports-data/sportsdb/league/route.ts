import { NextRequest, NextResponse } from "next/server";
import { fetchWithCache, TTL } from "@/lib/sports-cache";

const API_KEY = process.env.THESPORTSDB_API_KEY || "3";
const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  try {
    const result = await fetchWithCache(
      `sportsdb:league:${name.toLowerCase()}`,
      "thesportsdb",
      TTL.STATIC_METADATA,
      async () => {
        const res = await fetch(`${BASE}/search_all_leagues.php?s=${encodeURIComponent(name)}`);
        const json = await res.json();
        const league = json.countrys?.[0];
        if (!league) return null;
        return {
          name: league.strLeague,
          sport: league.strSport,
          country: league.strCountry,
          founded: league.intFormedYear,
          description: league.strDescriptionEN?.slice(0, 500),
          badge: league.strBadge,
          current_season: league.strCurrentSeason,
        };
      }
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch league data" }, { status: 500 });
  }
}
