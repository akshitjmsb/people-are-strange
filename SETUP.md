# People Are Strange — Setup Guide

## Step 1: Supabase (myverse-free)

Go to **[supabase.com/dashboard](https://supabase.com/dashboard)** → your free project → **SQL Editor** → paste and run the following:

### 1a. Schema

```sql
-- Companies
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  industry text,
  size_tier text check (size_tier in ('startup', 'smb', 'scaleup', 'enterprise')),
  description text,
  website text,
  linkedin_url text,
  hq_address text,
  tags text[],
  hiring_active boolean default false,
  founded_year int,
  last_enriched_at timestamptz,
  created_at timestamptz default now()
);

-- People
create table people (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  title text,
  role_type text check (role_type in ('founder', 'recruiter', 'hiring_manager', 'team_lead', 'investor')),
  linkedin_url text,
  avatar_initials text,
  is_active_signal boolean default false,
  last_active_note text,
  created_at timestamptz default now()
);

-- Job Postings
create table job_postings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  title text not null,
  department text,
  location text,
  remote_type text check (remote_type in ('onsite', 'hybrid', 'remote')),
  posted_at timestamptz,
  source_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Signals
create table signals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  signal_type text check (signal_type in ('hiring', 'funding', 'news', 'expansion', 'quiet')),
  summary text,
  source_url text,
  detected_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Outreach History (Phase 3 scaffold)
create table outreach (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  intent text check (intent in ('job_seeker', 'networking', 'bd')),
  drafted_message text,
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes
create index on companies(industry);
create index on companies(hiring_active);
create index on people(company_id);
create index on people(role_type);
create index on job_postings(company_id);
create index on signals(company_id);
create index on signals(detected_at desc);

-- Full text search
alter table companies add column fts tsvector
  generated always as (
    to_tsvector('english', coalesce(name,'') || ' ' || coalesce(industry,'') || ' ' || coalesce(description,''))
  ) stored;
create index on companies using gin(fts);
```

### 1b. Seed Data (50 companies)

```sql
insert into companies (name, slug, industry, size_tier, description, tags, hiring_active) values
('Mila – Quebec AI Institute', 'mila', 'Tech & AI', 'enterprise', 'World-leading AI research institute, home to Yoshua Bengio. Trains hundreds of ML researchers yearly.', ARRAY['Deep Learning','Research','Academic'], true),
('Lightspeed Commerce', 'lightspeed', 'Tech & AI', 'enterprise', 'Cloud POS & payments for retail and hospitality. HQ on McGill College Ave.', ARRAY['SaaS','Payments','TSX/NYSE'], false),
('GSoft', 'gsoft', 'Tech & AI', 'scaleup', 'Productivity & collaboration tools. Makes Workleap and Officevibe. Proudly Montreal-born.', ARRAY['HR Tech','SaaS','B2B'], true),
('Botpress', 'botpress', 'Tech & AI', 'startup', 'Enterprise AI agent platform. 500k+ users, millions of bots deployed worldwide.', ARRAY['AI Agents','LLM','Series A'], true),
('CGI Group', 'cgi', 'Tech & AI', 'enterprise', 'One of the world''s largest IT consulting firms. 80k+ employees globally, HQ in Montreal.', ARRAY['Consulting','Enterprise IT','TSX/NYSE'], true),
('Hopper', 'hopper', 'Tech & AI', 'scaleup', 'AI-powered travel booking app. One of Canada''s most valuable private tech companies.', ARRAY['Travel Tech','AI','Unicorn'], true),
('Mistplay', 'mistplay', 'Tech & AI', 'scaleup', 'Mobile gaming loyalty platform. 9M+ users, one of North America''s fastest growing apps.', ARRAY['Gaming','ML','Consumer'], true),
('Google Montreal', 'google-montreal', 'Tech & AI', 'enterprise', 'Downtown office focused on AI research and Chrome engineering. Key global node.', ARRAY['Big Tech','AI Research','Remote OK'], true),
('Microsoft Montreal', 'microsoft-montreal', 'Tech & AI', 'enterprise', '$500M CAD cloud & AI infrastructure investment in Quebec. Growing downtown presence.', ARRAY['Cloud','AI','Big Tech'], true),
('BrainBox AI', 'brainbox-ai', 'Tech & AI', 'startup', 'AI for autonomous building management. Reducing energy use in commercial real estate.', ARRAY['CleanTech','AI','Proptech'], true),
('Nuvei', 'nuvei', 'Tech & AI', 'enterprise', 'Global payment technology company HQ in Montreal. Processes digital commerce worldwide.', ARRAY['Fintech','Payments','TSX/NASDAQ'], true),
('UKG', 'ukg', 'Tech & AI', 'enterprise', 'HR & workforce management software. Major Montreal office after Kronos merger.', ARRAY['HR Tech','Enterprise','SaaS'], true),
('Dataiku', 'dataiku', 'Tech & AI', 'scaleup', 'Universal AI platform for enterprise teams. 700+ enterprise customers globally.', ARRAY['AI Platform','Data Science','Series F'], true),
('Valsoft / Aspire', 'valsoft', 'Tech & AI', 'scaleup', 'Acquires and grows vertical SaaS businesses. $150M deal in 2024. Quietly a major player.', ARRAY['Private Equity','SaaS','Acquirer'], true),
('National Bank of Canada', 'national-bank', 'Finance & Fintech', 'enterprise', 'One of Canada''s big six banks. HQ downtown, 300 tech roles planned. French-first culture.', ARRAY['Banking','French-first','TSX'], true),
('Desjardins', 'desjardins', 'Finance & Fintech', 'enterprise', 'World''s largest financial cooperative. Major Montreal offices, bilingual workforce.', ARRAY['Banking','Insurance','Cooperative'], true),
('BMO Financial Group', 'bmo', 'Finance & Fintech', 'enterprise', 'Historic Montreal presence at Place d''Armes. Major employer across finance and tech.', ARRAY['Banking','Wealth Mgmt','TSX/NYSE'], true),
('Inovia Capital', 'inovia', 'Finance & Fintech', 'smb', 'Canada''s largest VC firm. Backs Montreal startups from seed to IPO. Operator-led.', ARRAY['Venture Capital','Multi-stage'], true),
('DRW / Cumberland', 'drw', 'Finance & Fintech', 'scaleup', 'Global trading firm. Crypto, ETFs, and high-frequency trading from Montreal office.', ARRAY['Trading','Crypto','Quant'], true),
('PayFacto', 'payfacto', 'Finance & Fintech', 'startup', 'Integrated payment solutions for Canadian businesses. Fintech roots, downtown office.', ARRAY['Payments','SMB'], false),
('Real Ventures', 'real-ventures', 'Finance & Fintech', 'smb', 'Cornerstone of Canada''s startup ecosystem for 10+ years. Notman House partner.', ARRAY['Venture Capital','Seed'], false),
('Wealthsimple', 'wealthsimple', 'Finance & Fintech', 'scaleup', 'Canada''s leading digital investment platform. Major Montreal tech team.', ARRAY['WealthTech','Consumer'], true),
('Ubisoft Montreal', 'ubisoft', 'Gaming & Creative', 'enterprise', 'One of the world''s largest game studios. Assassin''s Creed, Far Cry, Watch Dogs all born here.', ARRAY['AAA Gaming','5000+ employees'], true),
('Electronic Arts Montreal', 'ea-montreal', 'Gaming & Creative', 'enterprise', 'EA''s Canadian studio. Sports games and mobile titles. Major downtown employer.', ARRAY['AAA Gaming','Mobile'], true),
('Warner Bros. Games Montreal', 'wb-games', 'Gaming & Creative', 'enterprise', 'Batman Arkham series and Gotham Knights studio. Part of global WB Games network.', ARRAY['AAA Gaming','DC Universe'], true),
('Rodeo FX', 'rodeo-fx', 'Gaming & Creative', 'scaleup', 'Oscar-winning VFX studio. Credits include Game of Thrones, The Mandalorian, Dune.', ARRAY['VFX','Film','Award-winning'], true),
('Unity Technologies Montreal', 'unity-montreal', 'Gaming & Creative', 'enterprise', 'Game engine R&D office. Working on the platform powering billions of mobile game downloads.', ARRAY['Game Engine','3D/AR/VR'], true),
('Valnet Concept', 'valnet', 'Gaming & Creative', 'scaleup', 'Digital media powerhouse. Owns ScreenRant, Collider, TheGamer and 20+ online brands.', ARRAY['Media','Digital Publishing'], true),
('Quebecor / TVA Group', 'quebecor', 'Gaming & Creative', 'enterprise', 'Major Canadian media and telecom. Broadcasting, mobile, and publishing from downtown MTL.', ARRAY['Media','Telecom','TSX'], true),
('Solotech', 'solotech', 'Gaming & Creative', 'scaleup', 'Global AV equipment and live event production. Concerts, hybrid events, and enterprise AV.', ARRAY['AV / Events','Hybrid Work'], true),
('Dialogue Health', 'dialogue', 'Health & Life Sciences', 'scaleup', 'Virtual care for Canadians. Mental health, primary care, and employee wellness. Series B.', ARRAY['Telehealth','AI','B2B'], true),
('Endo / Paladin Pharma', 'paladin-pharma', 'Health & Life Sciences', 'enterprise', 'Biotech and pharma. Endocrinology, urology, and orthopedics. ~3000 employees worldwide.', ARRAY['Pharma','Biotech','Specialty'], true),
('Imeka', 'imeka', 'Health & Life Sciences', 'startup', 'Neurotech startup applying AI to brain imaging. Pushing boundaries in cognitive health.', ARRAY['Neurotech','AI','Startup'], true),
('McGill University Health Centre', 'muhc', 'Health & Life Sciences', 'enterprise', 'One of Canada''s top academic medical centres. Major downtown employer and research hub.', ARRAY['Healthcare','Research','Academic'], true),
('Moderna Quebec', 'moderna-quebec', 'Health & Life Sciences', 'enterprise', 'New vaccine manufacturing facility in Montreal. Global health infrastructure investment.', ARRAY['Biotech','Vaccines','Manufacturing'], true),
('Benchmark Systems', 'benchmark-systems', 'Health & Life Sciences', 'smb', 'Healthcare IT and clinical data management. Supporting hospitals across Quebec and Canada.', ARRAY['Health IT','SaaS'], false),
('AmorChem', 'amorchem', 'Health & Life Sciences', 'smb', 'Biotech-focused VC fund. Bridges academic research to commercial life sciences ventures.', ARRAY['VC','Biotech','Deep Tech'], false),
('Bombardier', 'bombardier', 'Aerospace & Engineering', 'enterprise', 'Global business jet manufacturer. Challenger and Global series. 16k+ employees in Quebec.', ARRAY['Aerospace','Aviation','TSX'], true),
('CN Rail', 'cn-rail', 'Aerospace & Engineering', 'enterprise', 'Backbone of the Canadian economy. Downtown HQ. Moves $250B worth of goods annually.', ARRAY['Logistics','Rail','TSX/NYSE'], true),
('Lockheed Martin Canada', 'lockheed-martin', 'Aerospace & Engineering', 'enterprise', 'Defense and aerospace. Major Montreal engineering hub for systems and electronics.', ARRAY['Defense','Aerospace'], true),
('CAE Inc.', 'cae', 'Aerospace & Engineering', 'enterprise', 'Global leader in flight simulation and pilot training. HQ in Montreal. Publicly traded.', ARRAY['Simulation','Defense','TSX/NYSE'], true),
('Stelia Aerospace', 'stelia', 'Aerospace & Engineering', 'enterprise', 'Airbus subsidiary building aircraft structures and interiors. Major Montreal presence.', ARRAY['Aerospace','Manufacturing'], true),
('ALDO Group', 'aldo', 'Retail & Consumer', 'enterprise', 'Global footwear chain founded in Montreal in 1972. 1600+ stores worldwide. HQ downtown.', ARRAY['Retail','Fashion','Global'], true),
('Dollarama', 'dollarama', 'Retail & Consumer', 'enterprise', 'Canada''s largest dollar store chain. 1000+ locations, HQ in Montreal. Consistent growth story.', ARRAY['Retail','Value','TSX'], true),
('Moment Factory', 'moment-factory', 'Retail & Consumer', 'scaleup', 'Immersive multimedia experience studio. Does airports, concerts, theme parks worldwide.', ARRAY['Creative Tech','Immersive','B2B'], true),
('Reitmans Canada', 'reitmans', 'Retail & Consumer', 'enterprise', 'Canadian women''s fashion retailer. Multiple banners, HQ in Montreal. Over 100 years old.', ARRAY['Fashion','Retail'], true),
('Stingray Group', 'stingray', 'Retail & Consumer', 'scaleup', 'Music, media, and retail solutions company. Background music in 5000+ businesses worldwide.', ARRAY['Media','Music Tech','TSX'], true),
('BCE / Bell Canada', 'bell', 'Telecom & Infrastructure', 'enterprise', 'Canada''s largest telecom. Historic Bell Building downtown. R&D and French media ops in MTL.', ARRAY['Telecom','Media','TSX/NYSE'], true),
('Telus Digital', 'telus-digital', 'Telecom & Infrastructure', 'enterprise', 'Digital services and AI arm of Telus. Growing Montreal tech team for CX and AI products.', ARRAY['Telecom','AI','Digital Services'], true),
('IBM Montreal', 'ibm-montreal', 'Telecom & Infrastructure', 'enterprise', 'Cloud Multizone Region launch in 2024. Enterprise AI and hybrid cloud for Quebec clients.', ARRAY['Cloud','Enterprise AI','Big Tech'], true);
```

---

## Step 2: Get your Supabase credentials

In your Supabase dashboard → **Settings → API**:

- Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (for Phase 4)

Paste them into `.env.local`.

---

## Step 3: Install and run locally

```bash
cd people-are-strange-mtl
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 4: Deploy to Vercel

```bash
npx vercel --team akshit-guptas-projects-add2f9c0
```

Or connect via [vercel.com/new](https://vercel.com/new) → import from GitHub → add env vars.

**Suggested project name:** `people-are-strange-mtl`
**Suggested domain:** `peoplearestrange.vercel.app`

Add these env vars in Vercel dashboard (Settings → Environment Variables):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 5: Delete the accidentally-created paid Supabase project

Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **people-are-strange-mtl** (under myverse-paid) → **Settings → Danger Zone → Delete project**.

This stops any billing on the paid org.

---

## Phase 3 checklist (future)

- [ ] Add `ANTHROPIC_API_KEY` to `.env.local`
- [ ] Wire `SayHelloButton` → `IntentSheet` → Claude API call in `/app/api/draft-message/route.ts`
- [ ] Enable `SayHelloButton` (remove `disabled` prop)

## Phase 4 checklist (future)

- [ ] Add enrichment agent using `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Populate `people`, `job_postings`, `signals` tables via LinkedIn / web scraping
