import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  const apiKey = process.env.NEWS_API_KEY;

  if (!q) {
    return NextResponse.json({ articles: [] });
  }

  if (!apiKey) {
    return NextResponse.json({ articles: [] });
  }

  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return NextResponse.json({ articles: data.articles ?? [] });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
