import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const API_KEY = process.env.HYPEAUDITOR_API_KEY;
const BASE = "https://api.hypeauditor.com/v2";

export async function POST(req: NextRequest) {
  const { opportunity_id } = await req.json();
  if (!opportunity_id) return NextResponse.json({ error: "opportunity_id required" }, { status: 400 });

  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  // Get the opportunity
  const { data: opp, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", opportunity_id)
    .single();

  if (error || !opp) {
    return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
  }

  if (!API_KEY) {
    // Return existing data unchanged
    return NextResponse.json({ data: opp, source: "existing", fetched_at: null });
  }

  try {
    const searchRes = await fetch(`${BASE}/search?query=${encodeURIComponent(opp.name)}&platform=instagram`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!searchRes.ok) {
      return NextResponse.json({ data: opp, source: "existing", fetched_at: null });
    }

    const searchData = await searchRes.json();
    const account = searchData.data?.[0];

    if (!account) {
      return NextResponse.json({ data: opp, source: "existing", fetched_at: null });
    }

    const reportRes = await fetch(`${BASE}/reports/instagram/${account.id}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (reportRes.ok) {
      const report = await reportRes.json();
      const data = report.data || report;

      const updatedAudience = {
        ...opp.audience,
        y1834: data.demographics?.age?.["18-34"] ?? opp.audience?.y1834,
        female: data.demographics?.gender?.female ?? opp.audience?.female,
        real: data.audience_quality_score ?? opp.audience?.real,
        followers: data.followers,
        engagement: data.engagement_rate,
      };

      await supabase
        .from("opportunities")
        .update({ audience: updatedAudience })
        .eq("id", opportunity_id);

      return NextResponse.json({
        data: { ...opp, audience: updatedAudience },
        source: "live",
        fetched_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ data: opp, source: "existing", fetched_at: null });
  } catch {
    return NextResponse.json({ data: opp, source: "existing", fetched_at: null });
  }
}
