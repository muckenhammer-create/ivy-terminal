import { NextRequest, NextResponse } from "next/server";
import { fetchWithCache, TTL } from "@/lib/sports-cache";

const BASE = "https://api.openf1.org/v1";

export async function GET(req: NextRequest) {
  const season = req.nextUrl.searchParams.get("season") || new Date().getFullYear().toString();

  try {
    const result = await fetchWithCache(
      `openf1:standings:${season}`,
      "openf1",
      TTL.STANDINGS,
      async () => {
        // Get latest session to find recent results
        const sessionsRes = await fetch(`${BASE}/sessions?year=${season}&session_type=Race`);
        const sessions = await sessionsRes.json();
        if (!Array.isArray(sessions) || sessions.length === 0) return [];

        const latestSession = sessions[sessions.length - 1];
        const sessionKey = latestSession.session_key;

        // Get position data for the latest race
        const posRes = await fetch(`${BASE}/position?session_key=${sessionKey}`);
        const positions = await posRes.json();
        if (!Array.isArray(positions)) return [];

        // Get final positions (last entry per driver)
        const driverPositions = new Map<number, number>();
        for (const p of positions) {
          driverPositions.set(p.driver_number as number, p.position as number);
        }

        // Get driver info
        const driversRes = await fetch(`${BASE}/drivers?session_key=${sessionKey}`);
        const drivers = await driversRes.json();
        if (!Array.isArray(drivers)) return [];

        return drivers
          .map((d: Record<string, unknown>) => ({
            driver_number: d.driver_number,
            name: `${d.first_name} ${d.last_name}`,
            team: d.team_name,
            last_race_position: driverPositions.get(d.driver_number as number) ?? null,
            last_race: latestSession.meeting_name,
          }))
          .sort((a: { last_race_position: number | null }, b: { last_race_position: number | null }) =>
            (a.last_race_position ?? 99) - (b.last_race_position ?? 99)
          );
      }
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch F1 standings" }, { status: 500 });
  }
}
