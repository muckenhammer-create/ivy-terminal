import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { opportunity_id } = await req.json();
  if (!opportunity_id) return NextResponse.json({ error: "opportunity_id required" }, { status: 400 });

  return NextResponse.json(
    { error: "Social data sync coming soon", data: null, source: "coming_soon", fetched_at: null },
    { status: 503 }
  );
}
