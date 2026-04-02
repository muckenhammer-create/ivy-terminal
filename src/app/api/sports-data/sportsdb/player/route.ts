import { NextRequest, NextResponse } from "next/server";
import { fetchWithCache, TTL } from "@/lib/sports-cache";

const API_KEY = process.env.THESPORTSDB_API_KEY || "3";
const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  try {
    const result = await fetchWithCache(
      `sportsdb:player:${name.toLowerCase()}`,
      "thesportsdb",
      TTL.STATIC_METADATA,
      async () => {
        const res = await fetch(`${BASE}/searchplayers.php?p=${encodeURIComponent(name)}`);
        const json = await res.json();
        const player = json.player?.[0];
        if (!player) return null;
        return {
          name: player.strPlayer,
          team: player.strTeam,
          nationality: player.strNationality,
          position: player.strPosition,
          born: player.dateBorn,
          description: player.strDescriptionEN?.slice(0, 500),
          thumbnail: player.strThumb,
          cutout: player.strCutout,
          sport: player.strSport,
        };
      }
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch player data" }, { status: 500 });
  }
}
