-- ─────────────────────────────────────────────────────────────────────────
-- People Are Strange MTL — core schema
-- POIs indexed by H3, with materialized hex summaries for fast aggregation.
-- NOTE: the Supabase project is restoring — apply this once it's back online.
-- ─────────────────────────────────────────────────────────────────────────

-- PostGIS for the generated point geometry + spatial index.
create extension if not exists postgis;

-- POI categories.
do $$ begin
  create type poi_category as enum (
    'company', 'job', 'restaurant', 'cafe', 'bar',
    'park', 'culture', 'shopping', 'transit', 'health',
    'education', 'entertainment', 'service', 'other'
  );
exception
  when duplicate_object then null;
end $$;

-- Main POIs table.
create table if not exists pois (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category poi_category not null default 'other',
  subcategory text,
  description text,
  lat double precision not null,
  lng double precision not null,
  geom geometry(Point, 4326) generated always as (st_setsrid(st_makepoint(lng, lat), 4326)) stored,
  h3_res9 text not null,
  h3_res7 text not null,
  address text,
  tags text[],
  source text,          -- 'overture', 'osm', 'jobbank', 'manual'
  source_id text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes.
create index if not exists pois_geom_idx on pois using gist(geom);
create index if not exists pois_h3_res9_idx on pois(h3_res9);
create index if not exists pois_h3_res7_idx on pois(h3_res7);
create index if not exists pois_category_idx on pois(category);

-- H3 aggregation views — one row per occupied hex.
create materialized view if not exists hex_summary_res7 as
select
  h3_res7 as hex_id,
  count(*) as poi_count,
  array_agg(distinct category) as categories,
  mode() within group (order by category) as dominant_category
from pois
group by h3_res7;

create materialized view if not exists hex_summary_res9 as
select
  h3_res9 as hex_id,
  count(*) as poi_count,
  array_agg(distinct category) as categories,
  mode() within group (order by category) as dominant_category
from pois
group by h3_res9;

create unique index if not exists hex_summary_res7_idx on hex_summary_res7(hex_id);
create unique index if not exists hex_summary_res9_idx on hex_summary_res9(hex_id);

-- Refresh helper — call after bulk inserts.
create or replace function refresh_hex_summaries() returns void as $$
begin
  refresh materialized view concurrently hex_summary_res7;
  refresh materialized view concurrently hex_summary_res9;
end;
$$ language plpgsql;

-- Row Level Security: public read access (anon key), writes via service role only.
alter table pois enable row level security;

do $$ begin
  create policy "pois are publicly readable" on pois for select using (true);
exception
  when duplicate_object then null;
end $$;
