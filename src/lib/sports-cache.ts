import { supabase } from "./supabase";

interface CacheEntry {
  data: unknown;
  source: "live" | "cache";
  fetched_at: string;
}

export async function getCached(cacheKey: string): Promise<CacheEntry | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("sports_data_cache")
    .select("data, fetched_at, expires_at")
    .eq("cache_key", cacheKey)
    .single();

  if (error || !data) return null;

  const isExpired = new Date(data.expires_at) < new Date();
  if (isExpired) return null;

  return { data: data.data, source: "cache", fetched_at: data.fetched_at };
}

export async function getCachedStale(cacheKey: string): Promise<CacheEntry | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("sports_data_cache")
    .select("data, fetched_at")
    .eq("cache_key", cacheKey)
    .single();

  if (error || !data) return null;
  return { data: data.data, source: "cache", fetched_at: data.fetched_at };
}

export async function setCache(
  cacheKey: string,
  provider: string,
  data: unknown,
  ttlSeconds: number
): Promise<void> {
  if (!supabase) return;

  const expires_at = new Date(Date.now() + ttlSeconds * 1000).toISOString();

  await supabase
    .from("sports_data_cache")
    .upsert(
      { cache_key: cacheKey, provider, data, fetched_at: new Date().toISOString(), expires_at },
      { onConflict: "cache_key" }
    );
}

export async function fetchWithCache<T>(
  cacheKey: string,
  provider: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<CacheEntry> {
  // Try fresh cache first
  const cached = await getCached(cacheKey);
  if (cached) return cached;

  // Fetch fresh data
  try {
    const freshData = await fetcher();
    await setCache(cacheKey, provider, freshData, ttlSeconds);
    return { data: freshData, source: "live", fetched_at: new Date().toISOString() };
  } catch (err) {
    // Fall back to stale cache on failure
    const stale = await getCachedStale(cacheKey);
    if (stale) return stale;
    throw err;
  }
}

// TTL constants in seconds
export const TTL = {
  PLAYER_STATS: 24 * 60 * 60,       // 24 hours
  STANDINGS: 6 * 60 * 60,            // 6 hours
  LIVE_MATCH: 5 * 60,                // 5 minutes
  SOCIAL: 7 * 24 * 60 * 60,          // 7 days
  STATIC_METADATA: 30 * 24 * 60 * 60, // 30 days
  RANKINGS_WEEKLY: 7 * 24 * 60 * 60, // 7 days
} as const;
