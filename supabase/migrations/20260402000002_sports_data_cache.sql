CREATE TABLE sports_data_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text unique not null,
  provider text not null,
  data jsonb not null,
  fetched_at timestamptz default now(),
  expires_at timestamptz not null
);
CREATE INDEX ON sports_data_cache(cache_key);
CREATE INDEX ON sports_data_cache(expires_at);

-- Allow read/write from anon key
ALTER TABLE sports_data_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON sports_data_cache FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON sports_data_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON sports_data_cache FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON sports_data_cache FOR DELETE USING (true);
