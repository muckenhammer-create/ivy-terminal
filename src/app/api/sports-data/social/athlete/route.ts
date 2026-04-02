import { NextRequest, NextResponse } from "next/server";
import { fetchWithCache, TTL } from "@/lib/sports-cache";

const API_KEY = process.env.HYPEAUDITOR_API_KEY;
const BASE = "https://api.hypeauditor.com/v2";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  const platform = req.nextUrl.searchParams.get("platform") || "instagram";

  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  if (!API_KEY) {
    return NextResponse.json({ error: "HYPEAUDITOR_API_KEY not configured", data: null, source: "unavailable", fetched_at: null });
  }

  try {
    const result = await fetchWithCache(
      `social:${platform}:${name.toLowerCase()}`,
      "hypeauditor",
      TTL.SOCIAL,
      async () => {
        const searchRes = await fetch(`${BASE}/search?query=${encodeURIComponent(name)}&platform=${platform}`, {
          headers: { Authorization: `Bearer ${API_KEY}` },
        });
        if (!searchRes.ok) throw new Error(`HTTP ${searchRes.status}`);
        const searchData = await searchRes.json();
        const account = searchData.data?.[0];
        if (!account) return null;

        // Fetch detailed report
        const reportRes = await fetch(`${BASE}/reports/${platform}/${account.id}`, {
          headers: { Authorization: `Bearer ${API_KEY}` },
        });
        if (!reportRes.ok) return { username: account.username, followers: account.followers };

        const report = await reportRes.json();
        const data = report.data || report;

        return {
          username: account.username,
          followers: data.followers || account.followers,
          engagement_rate: data.engagement_rate,
          audience_quality_score: data.audience_quality_score || data.aq_score,
          audience_demographics: {
            age_18_34_pct: data.demographics?.age?.["18-34"] || null,
            female_pct: data.demographics?.gender?.female || null,
            top_countries: data.demographics?.countries?.slice(0, 5) || [],
            income_estimate: data.demographics?.income_level || null,
          },
        };
      }
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch social data" }, { status: 500 });
  }
}
