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
    const from = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&from=${from}&sortBy=relevancy&pageSize=5&apiKey=${apiKey}`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();

    const queryWords = q.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const filtered = (data.articles ?? []).filter((a: { title?: string; description?: string }) => {
      const text = `${a.title ?? ""} ${a.description ?? ""}`.toLowerCase();
      return queryWords.some((w) => text.includes(w));
    });

    return NextResponse.json({ articles: filtered });
  } catch {
    return NextResponse.json({ articles: [] });
  }
}
