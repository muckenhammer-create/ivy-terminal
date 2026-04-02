import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  return NextResponse.json(
    { error: "Athletics data coming soon", data: null, source: "coming_soon", fetched_at: null },
    { status: 503 }
  );
}
