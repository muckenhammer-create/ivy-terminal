import { NextRequest, NextResponse } from "next/server";
import { SEED_OPPORTUNITIES } from "@/lib/seed";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  let results = [...SEED_OPPORTUNITIES];

  const types = searchParams.get("types");
  if (types) {
    const typeArr = types.split(",");
    results = results.filter((o) => typeArr.includes(o.type));
  }

  const sports = searchParams.get("sports");
  if (sports) {
    const sportArr = sports.split(",");
    results = results.filter((o) => sportArr.includes(o.sport));
  }

  const trend = searchParams.get("trend");
  if (trend) {
    results = results.filter((o) => o.trend_dir === trend);
  }

  const geos = searchParams.get("geos");
  if (geos) {
    const geoArr = geos.split(",");
    results = results.filter((o) => o.geo.some((g) => geoArr.includes(g)));
  }

  const search = searchParams.get("search");
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.sport.toLowerCase().includes(q) ||
        o.meta.toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return NextResponse.json(results);
}
