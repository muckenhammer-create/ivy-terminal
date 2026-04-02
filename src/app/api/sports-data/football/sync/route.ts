import { NextResponse } from "next/server";

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const BASE = "https://api-football-v3.p.rapidapi.com";

const PLAYER_ID_MAP: Record<string, number> = {
  "Kylian Mbappé": 278,
  "Erling Haaland": 1100,
  "Jude Bellingham": 19871,
  "Mohamed Salah": 306,
  "Harry Kane": 184,
  "Vinícius Jr.": 47370,
  "Pedri": 322549,
  "Bukayo Saka": 726,
  "Phil Foden": 184941,
  "Rodri": 2295,
};

export async function POST() {
  if (!RAPIDAPI_KEY) {
    return NextResponse.json({ error: "RAPIDAPI_KEY not configured" }, { status: 503 });
  }

  const season = new Date().getFullYear().toString();
  const results: Array<{ name: string; status: string; data?: unknown }> = [];

  for (const [name, playerId] of Object.entries(PLAYER_ID_MAP)) {
    try {
      const res = await fetch(`${BASE}/players?id=${playerId}&season=${season}`, {
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "api-football-v3.p.rapidapi.com",
        },
      });
      const json = await res.json();
      const player = json.response?.[0];
      const stats = player?.statistics?.[0];

      results.push({
        name,
        status: player ? "synced" : "not_found",
        data: stats
          ? {
              goals: stats.goals?.total,
              assists: stats.goals?.assists,
              appearances: stats.games?.appearences,
              rating: stats.games?.rating,
              injured: player.player?.injured,
            }
          : null,
      });

      // Rate limit: 100ms between requests
      await new Promise((r) => setTimeout(r, 100));
    } catch {
      results.push({ name, status: "error" });
    }
  }

  return NextResponse.json({ synced: results.length, results });
}
