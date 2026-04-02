import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Football data sync coming soon" },
    { status: 503 }
  );
}
