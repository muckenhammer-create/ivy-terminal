import { NextRequest, NextResponse } from "next/server";
import { fetchWithCache } from "@/lib/sports-cache";

const BASE = "https://api.openf1.org/v1";
const ONE_HOUR = 60 * 60;

export async function GET(req: NextRequest) {
  const year = req.nextUrl.searchParams.get("year") || new Date().getFullYear().toString();

  try {
    const result = await fetchWithCache(
      `openf1:sessions:${year}`,
      "openf1",
      ONE_HOUR,
      async () => {
        const res = await fetch(`${BASE}/sessions?year=${year}`);
        const sessions = await res.json();
        if (!Array.isArray(sessions)) return [];
        return sessions.map((s: Record<string, unknown>) => ({
          session_key: s.session_key,
          session_name: s.session_name,
          session_type: s.session_type,
          meeting_name: s.meeting_name,
          location: s.location,
          country_name: s.country_name,
          date_start: s.date_start,
          date_end: s.date_end,
        }));
      }
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch F1 sessions" }, { status: 500 });
  }
}
