-- ─── Enums ────────────────────────────────────────────────────────────────────
create type size_tier    as enum ('startup', 'smb', 'scaleup', 'enterprise');
create type role_type    as enum ('founder', 'recruiter', 'hiring_manager', 'team_lead', 'investor');
create type remote_type  as enum ('onsite', 'hybrid', 'remote');
create type signal_type  as enum ('hiring', 'funding', 'news', 'expansion', 'quiet');
create type outreach_intent as enum ('job_seeker', 'networking', 'bd');

-- ─── Companies ────────────────────────────────────────────────────────────────
create table companies (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  industry         text,
  size_tier        size_tier,
  description      text,
  website          text,
  linkedin_url     text,
  hq_address       text,
  tags             text[],
  hiring_active    boolean not null default false,
  founded_year     int,
  last_enriched_at timestamptz,
  created_at       timestamptz not null default now()
);

-- ─── People ───────────────────────────────────────────────────────────────────
create table people (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references companies(id) on delete cascade,
  name              text not null,
  title             text,
  role_type         role_type,
  linkedin_url      text,
  avatar_initials   text,
  is_active_signal  boolean not null default false,
  last_active_note  text,
  created_at        timestamptz not null default now()
);

-- ─── Job Postings ─────────────────────────────────────────────────────────────
create table job_postings (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  title       text not null,
  department  text,
  location    text,
  remote_type remote_type,
  posted_at   timestamptz,
  source_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── Signals ──────────────────────────────────────────────────────────────────
create table signals (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  signal_type signal_type,
  summary     text,
  source_url  text,
  detected_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- ─── Outreach ─────────────────────────────────────────────────────────────────
create table outreach (
  id               uuid primary key default gen_random_uuid(),
  person_id        uuid not null references people(id) on delete cascade,
  company_id       uuid not null references companies(id) on delete cascade,
  intent           outreach_intent,
  drafted_message  text,
  sent_at          timestamptz,
  created_at       timestamptz not null default now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
create index on people(company_id);
create index on job_postings(company_id);
create index on signals(company_id);
create index on signals(detected_at desc);
create index on outreach(person_id);
create index on outreach(company_id);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
alter table companies    enable row level security;
alter table people       enable row level security;
alter table job_postings enable row level security;
alter table signals      enable row level security;
alter table outreach     enable row level security;

-- Allow anon read access for now (tighten when auth is added)
create policy "public read companies"    on companies    for select using (true);
create policy "public read people"       on people       for select using (true);
create policy "public read job_postings" on job_postings for select using (true);
create policy "public read signals"      on signals      for select using (true);
create policy "public read outreach"     on outreach     for select using (true);
