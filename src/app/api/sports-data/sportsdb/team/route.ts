import { NextRequest, NextResponse } from "next/server";
import { fetchWithCache, TTL } from "@/lib/sports-cache";

const API_KEY = process.env.THESPORTSDB_API_KEY || "3";
const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  try {
    const result = await fetchWithCache(
      `sportsdb:team:${name.toLowerCase()}`,
      "thesportsdb",
      TTL.STATIC_METADATA,
      async () => {
        const res = await fetch(`${BASE}/searchteams.php?t=${encodeURIComponent(name)}`);
        const json = await res.json();
        const team = json.teams?.[0];
        if (!team) return null;
        return {
          name: team.strTeam,
          league: team.strLeague,
          founded: team.intFormedYear,
          stadium: team.strStadium,
          stadium_capacity: team.intStadiumCapacity,
          description: team.strDescriptionEN?.slice(0, 500),
          logo: team.strBadge,
          banner: team.strTeamBanner,
          social: {
            website: team.strWebsite,
            twitter: team.strTwitter,
            instagram: team.strInstagram,
            youtube: team.strYoutube,
          },
        };
      }
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch team data" }, { status: 500 });
  }
}
