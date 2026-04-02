import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  void req;
  return NextResponse.json(
    { error: "Athletics rankings coming soon", data: null, source: "coming_soon", fetched_at: null },
    { status: 503 }
  );
}
