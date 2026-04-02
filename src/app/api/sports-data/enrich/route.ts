import { NextRequest, NextResponse } from "next/server";
import { fetchWithCache, TTL } from "@/lib/sports-cache";

const THESPORTSDB_KEY = process.env.THESPORTSDB_API_KEY || "3";

const F1_DRIVERS = [
  "Max Verstappen", "Lewis Hamilton", "Charles Leclerc",
  "Lando Norris", "George Russell", "Carlos Sainz Jr.", "Fernando Alonso",
];

async function enrichF1Driver(name: string) {
  return fetchWithCache(`openf1:driver:${name.toLowerCase()}`, "openf1", TTL.STANDINGS, async () => {
    const res = await fetch("https://api.openf1.org/v1/drivers?session_key=latest");
    const drivers = await res.json();
    if (!Array.isArray(drivers)) return null;
    const driver = drivers.find((d: Record<string, unknown>) =>
      `${d.first_name} ${d.last_name}`.toLowerCase() === name.toLowerCase()
    );
    if (!driver) return null;
    return { name: `${driver.first_name} ${driver.last_name}`, team: driver.team_name, number: driver.driver_number };
  });
}

async function enrichMetadata(name: string, type: string) {
  const endpoint = type === "athlete" ? "searchplayers.php?p" : "searchteams.php?t";
  return fetchWithCache(`sportsdb:${type}:${name.toLowerCase()}`, "thesportsdb", TTL.STATIC_METADATA, async () => {
    const res = await fetch(`https://www.thesportsdb.com/api/v1/json/${THESPORTSDB_KEY}/${endpoint}=${encodeURIComponent(name)}`);
    const json = await res.json();
    const item = type === "athlete" ? json.player?.[0] : json.teams?.[0];
    if (!item) return null;
    return type === "athlete"
      ? { thumbnail: item.strThumb, cutout: item.strCutout, description: item.strDescriptionEN?.slice(0, 300) }
      : { logo: item.strBadge, banner: item.strTeamBanner, description: item.strDescriptionEN?.slice(0, 300), stadium: item.strStadium };
  });
}

export async function POST(req: NextRequest) {
  const { opportunityId, name, type, sport } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const enrichments: Record<string, unknown> = {};

  try {
    // Always try TheSportsDB metadata
    const meta = await enrichMetadata(name, type || "athlete");
    if (meta) enrichments.metadata = meta;

    // Sport-specific enrichment
    const sportLower = (sport || "").toLowerCase();

    if (sportLower === "motorsport" && F1_DRIVERS.includes(name)) {
      const f1 = await enrichF1Driver(name);
      if (f1) enrichments.live_stats = f1;
    }

    if (sportLower === "tennis") {
      // Try tennis rankings
      const rankings = await fetchWithCache("tennis:atp:rankings", "tennis_abstract", TTL.RANKINGS_WEEKLY, async () => {
        const res = await fetch("https://raw.githubusercontent.com/JeffSackmann/tennis_atp/master/atp_rankings_current.csv");
        const csv = await res.text();
        return csv.split("\n").slice(1, 101).map((line) => {
          const [date, rank, id, pts] = line.split(",");
          return { ranking_date: date, rank: parseInt(rank), player_id: parseInt(id), points: parseInt(pts) };
        });
      });
      if (rankings) enrichments.rankings = rankings;
    }

    return NextResponse.json({
      opportunity_id: opportunityId,
      enrichments,
      source: Object.keys(enrichments).length > 0 ? "live" : "none",
      fetched_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      opportunity_id: opportunityId,
      enrichments: {},
      source: "error",
      fetched_at: new Date().toISOString(),
    });
  }
}
