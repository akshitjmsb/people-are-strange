// Syncs the `companies` table to the hand-curated dataset in
// lib/companies-data.ts. Runs by hand (`npm run db:seed`) and automatically as
// a post-build step on production deploys, so shipping data changes and
// serving them can't drift apart — the failure that shipped gaming/lifesci to
// production showing 0 companies.
//
// Idempotent and non-destructive: rows are upserted and stale ids pruned, so
// there is never a moment where the table is empty (the old delete-all-then-
// insert left exactly that window, and a concurrent request would see a blank
// map).
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { notInArray, sql } from 'drizzle-orm';

import { COMPANIES } from '../lib/companies-data';
import { companies, type NewCompanyRow } from '../lib/db/schema';

// Postgres caps bind parameters per statement; 26 columns × 50 rows stays well
// clear of it. The whole dataset in one INSERT blew that limit at 161 rows.
const BATCH = 50;

async function main() {
  // `npm run build` passes --on-deploy so the sync happens on a production
  // Vercel build and nowhere else. Without this guard a local `npm run build`
  // on a work-in-progress branch would quietly push that branch's dataset to
  // the live database. A bare `npm run db:seed` always syncs, by intent.
  if (process.argv.includes('--on-deploy')) {
    const vercelEnv = process.env.VERCEL_ENV;
    if (vercelEnv !== 'production') {
      console.log(`↷ not a production deploy (VERCEL_ENV=${vercelEnv ?? 'unset'}) — skipping db sync.`);
      return;
    }
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    // Don't brick a deploy over a missing build-time env var, but make the
    // drift impossible to miss in the log.
    console.warn('⚠ DATABASE_URL is not set — SKIPPING db sync. The live site will serve stale data.');
    if (process.env.VERCEL) return;
    throw new Error('DATABASE_URL is not set.');
  }

  const db = drizzle(neon(url));

  const rows: NewCompanyRow[] = COMPANIES.map((c) => ({
    id: c.id,
    name: c.name,
    aka: c.aka ?? null,
    industry: c.industry ?? 'ai',
    secondaryIndustries: c.secondaryIndustries ?? null,
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
    careersUrl: c.careersUrl ?? null,
    notable: c.notable ?? null,
    status: c.status ?? null,
    website: c.website ?? null,
    linkedin: c.linkedin ?? null,
    sources: c.sources ?? null,
    verifiedAt: c.verifiedAt ?? null,
  }));

  // Guard against the duplicate-id class of bug reaching the database, where
  // it surfaces as an opaque constraint violation mid-seed. (scripts/
  // validate-data.ts catches this in CI first; this is the backstop.)
  const ids = rows.map((r) => r.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) throw new Error(`duplicate company ids in dataset: ${[...new Set(dupes)].join(', ')}`);

  // On conflict, take the incoming row's value for every column but the key.
  // Must reference `excluded.<db_column>` — pointing at the table's own column
  // would set each field to itself and silently no-op every update.
  //
  // ROLE_COLUMNS are owned by scripts/refresh-roles.ts, not by this file. They
  // are excluded from both the INSERT and the UPDATE: the dataset carries no
  // values for them, so including them would overwrite live open-role counts
  // with NULL on every single deploy.
  const ROLE_COLUMNS = new Set(['openRolesMontreal', 'openRolesTotal', 'rolesFetchedAt']);

  const overwrite = Object.fromEntries(
    (Object.keys(companies) as (keyof typeof companies)[])
      .filter((k) => k !== 'id' && !ROLE_COLUMNS.has(k as string))
      .map((k) => {
        const dbName = (companies[k] as unknown as { name: string }).name;
        return [k, sql`excluded.${sql.identifier(dbName)}`];
      }),
  );

  for (let i = 0; i < rows.length; i += BATCH) {
    await db
      .insert(companies)
      .values(rows.slice(i, i + BATCH))
      .onConflictDoUpdate({ target: companies.id, set: overwrite });
  }

  // Drop anything no longer in the dataset (renamed ids, removed companies).
  const pruned = await db.delete(companies).where(notInArray(companies.id, ids)).returning({ id: companies.id });

  console.log(`✓ Synced ${rows.length} companies${pruned.length ? ` · pruned ${pruned.length}: ${pruned.map((p) => p.id).join(', ')}` : ''}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
