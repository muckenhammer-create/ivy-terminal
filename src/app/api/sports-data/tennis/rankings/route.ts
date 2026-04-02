import { NextRequest, NextResponse } from "next/server";
import { fetchWithCache, TTL } from "@/lib/sports-cache";

const ATP_URL = "https://raw.githubusercontent.com/JeffSackmann/tennis_atp/master/atp_rankings_current.csv";
const WTA_URL = "https://raw.githubusercontent.com/JeffSackmann/tennis_wta/master/wta_rankings_current.csv";

function parseRankingsCsv(csv: string): Array<{ ranking_date: string; rank: number; player_id: number; points: number }> {
  const lines = csv.trim().split("\n");
  const rows = lines.slice(1).map((line) => {
    const [ranking_date, rank, player_id, points] = line.split(",");
    return { ranking_date, rank: parseInt(rank), player_id: parseInt(player_id), points: parseInt(points) };
  });
  // Get latest date's rankings
  const latestDate = rows[0]?.ranking_date;
  return rows.filter((r) => r.ranking_date === latestDate).slice(0, 100);
}

export async function GET(req: NextRequest) {
  const tour = req.nextUrl.searchParams.get("tour") || "atp";
  const url = tour === "wta" ? WTA_URL : ATP_URL;

  try {
    const result = await fetchWithCache(
      `tennis:${tour}:rankings`,
      "tennis_abstract",
      TTL.RANKINGS_WEEKLY,
      async () => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const csv = await res.text();
        return parseRankingsCsv(csv);
      }
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch tennis rankings" }, { status: 500 });
  }
}
