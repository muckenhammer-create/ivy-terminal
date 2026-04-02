import { NextRequest, NextResponse } from "next/server";
import { fetchWithCache, TTL } from "@/lib/sports-cache";

const BASE = "https://api.openf1.org/v1";

export async function GET(req: NextRequest) {
  const season = req.nextUrl.searchParams.get("season") || new Date().getFullYear().toString();

  try {
    const result = await fetchWithCache(
      `openf1:drivers:${season}`,
      "openf1",
      TTL.PLAYER_STATS,
      async () => {
        const res = await fetch(`${BASE}/drivers?session_key=latest`);
        const drivers = await res.json();
        if (!Array.isArray(drivers)) return [];
        return drivers.map((d: Record<string, unknown>) => ({
          driver_number: d.driver_number,
          name: `${d.first_name} ${d.last_name}`,
          team: d.team_name,
          country_code: d.country_code,
          headshot_url: d.headshot_url,
        }));
      }
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch F1 drivers" }, { status: 500 });
  }
}
