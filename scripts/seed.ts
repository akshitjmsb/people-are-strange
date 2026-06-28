// Seeds the `companies` table from the hand-curated dataset in
// lib/companies-data.ts. Idempotent: clears the table, then bulk-inserts, so it
// can be re-run safely whenever the source dataset changes.
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import { COMPANIES } from '../lib/companies-data';
import { companies, type NewCompanyRow } from '../lib/db/schema';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');
  const db = drizzle(neon(url));

  const rows: NewCompanyRow[] = COMPANIES.map((c) => ({
    id: c.id,
    name: c.name,
    aka: c.aka ?? null,
    industry: c.industry ?? 'ai',
    lat: c.lat,
    lng: c.lng,
    address: c.address ?? null,
    neighborhood: c.neighborhood ?? null,
    type: c.type,
    oneLiner: c.oneLiner,
    problem: c.problem ?? null,
    solution: c.solution ?? null,
    aiDomains: c.aiDomains,
    industries: c.industries ?? null,
    tags: c.tags ?? null,
    founded: c.founded ?? null,
    headcount: c.headcount ?? null,
    funding: c.funding ?? null,
    hiring: c.hiring ?? null,
    notable: c.notable ?? null,
    status: c.status ?? null,
    website: c.website ?? null,
    linkedin: c.linkedin ?? null,
    sources: c.sources ?? null,
  }));

  await db.delete(companies);
  await db.insert(companies).values(rows);

  console.log(`✓ Seeded ${rows.length} companies.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
