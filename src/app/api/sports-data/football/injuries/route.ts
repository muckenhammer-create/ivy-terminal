import { NextRequest, NextResponse } from "next/server";

const SERVICE_UNAVAILABLE = {
  error: "Football injury data coming soon",
  data: null,
  source: "coming_soon" as const,
  fetched_at: null,
};

export async function GET(req: NextRequest) {
  void req;
  return NextResponse.json(SERVICE_UNAVAILABLE, { status: 503 });
}
