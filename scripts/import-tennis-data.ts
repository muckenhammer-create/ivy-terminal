/**
 * Tennis Data Import Script
 * Fetches ATP and WTA rankings from Jeff Sackmann's GitHub datasets
 * and caches them in Supabase sports_data_cache.
 *
 * Usage: npx tsx scripts/import-tennis-data.ts
 */

const ATP_URL = "https://raw.githubusercontent.com/JeffSackmann/tennis_atp/master/atp_rankings_current.csv";
const WTA_URL = "https://raw.githubusercontent.com/JeffSackmann/tennis_wta/master/wta_rankings_current.csv";

async function importRankings(tour: "atp" | "wta") {
  const url = tour === "atp" ? ATP_URL : WTA_URL;
  console.log(`Fetching ${tour.toUpperCase()} rankings...`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: HTTP ${res.status}`);

  const csv = await res.text();
  const lines = csv.trim().split("\n");
  const rows = lines.slice(1).map((line) => {
    const [ranking_date, rank, player_id, points] = line.split(",");
    return { ranking_date, rank: parseInt(rank), player_id: parseInt(player_id), points: parseInt(points) };
  });

  // Get latest date's rankings (top 100)
  const latestDate = rows[0]?.ranking_date;
  const latestRankings = rows.filter((r) => r.ranking_date === latestDate).slice(0, 100);

  console.log(`  Found ${latestRankings.length} rankings for date ${latestDate}`);

  // Store in Supabase if env vars are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey && supabaseUrl !== "https://your-project.supabase.co") {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const cacheKey = `tennis_${tour}_rankings`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from("sports_data_cache")
      .upsert(
        {
          cache_key: cacheKey,
          provider: "tennis_abstract",
          data: latestRankings,
          fetched_at: new Date().toISOString(),
          expires_at: expiresAt,
        },
        { onConflict: "cache_key" }
      );

    if (error) {
      console.error(`  Error storing ${tour} rankings:`, error.message);
    } else {
      console.log(`  Stored ${tour} rankings in Supabase (expires: ${expiresAt})`);
    }
  } else {
    console.log("  Supabase not configured — printing top 10:");
    latestRankings.slice(0, 10).forEach((r) => {
      console.log(`    #${r.rank} — Player ID: ${r.player_id} (${r.points} pts)`);
    });
  }

  return latestRankings;
}

async function main() {
  console.log("Tennis Data Import\n");
  await importRankings("atp");
  console.log();
  await importRankings("wta");
  console.log("\nDone.");
}

main().catch(console.error);
