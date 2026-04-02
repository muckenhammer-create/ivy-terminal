import { NextRequest, NextResponse } from "next/server";

const SERVICE_UNAVAILABLE = {
  error: "Football data coming soon",
  data: null,
  source: "coming_soon" as const,
  fetched_at: null,
};

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  return NextResponse.json(SERVICE_UNAVAILABLE, { status: 503 });
}
