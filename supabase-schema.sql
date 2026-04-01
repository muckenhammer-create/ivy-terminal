-- IVY Database Schema for Supabase

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('athlete', 'club', 'event', 'league', 'grassroots')),
  sport text not null,
  name text not null,
  meta text,
  trend_dir text not null check (trend_dir in ('up', 'flat', 'down')),
  reach text,
  geo text[] default '{}',
  excl boolean default false,
  cat_fit jsonb default '{}',
  audience jsonb default '{}',
  budget_min integer default 0,
  budget_max integer default 0,
  tags text[] default '{}',
  highlights text[] default '{}',
  risks text[] default '{}',
  partners text[] default '{}',
  rights text[] default '{}'
);

create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  opportunity_id text not null,
  brand_category text,
  email text not null,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);

-- Enable RLS
alter table enquiries enable row level security;

-- Allow inserts from anon key
create policy "Allow public inserts" on enquiries
  for insert with check (true);
