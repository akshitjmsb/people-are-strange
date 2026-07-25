// ── Drift check: what the file says vs what the database serves ──────────────
// The API reads from Postgres while the dataset lives in lib/companies-data.ts,
// so the two can silently diverge — that's how gaming and lifesci shipped to
// production showing 0 companies. Run this any time the live counts look wrong.
//
//   npm run db:status
//
// Read-only. Exits 1 if the database is out of sync with the file.
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import { COMPANIES } from '../lib/companies-data';
import { companies } from '../lib/db/schema';
import { INDUSTRY_ORDER } from '../lib/categories';
import type { Industry } from '../lib/types';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');
  const db = drizzle(neon(url));

  const dbRows = await db.select().from(companies);
  const fileById = new Map(COMPANIES.map((c) => [c.id, c]));
  const dbById = new Map(dbRows.map((r) => [r.id, r]));

  const missing = [...fileById.keys()].filter((id) => !dbById.has(id));
  const extra = [...dbById.keys()].filter((id) => !fileById.has(id));

  // Compare the fields users actually see change.
  const drifted: string[] = [];
  for (const [id, f] of fileById) {
    const d = dbById.get(id);
    if (!d) continue;
    const diffs = (
      [
        ['name', f.name, d.name],
        ['industry', f.industry ?? 'ai', d.industry],
        ['type', f.type, d.type],
        ['careersUrl', f.careersUrl ?? null, d.careersUrl],
        ['website', f.website ?? null, d.website],
        ['hiring', f.hiring ?? null, d.hiring],
        ['status', f.status ?? null, d.status],
        ['oneLiner', f.oneLiner, d.oneLiner],
      ] as const
    ).filter(([, a, b]) => a !== b);
    if (diffs.length) drifted.push(`${id}: ${diffs.map(([k, a, b]) => `${k} file=${a} db=${b}`).join(' | ')}`);
  }

  console.log(`\nfile ${COMPANIES.length} companies  ·  db ${dbRows.length} rows`);
  for (const i of INDUSTRY_ORDER) {
    const f = COMPANIES.filter((c) => (c.industry ?? 'ai') === i).length;
    const d = dbRows.filter((r) => r.industry === (i as Industry)).length;
    console.log(`  ${i.padEnd(10)} file ${String(f).padStart(3)}   db ${String(d).padStart(3)}  ${f === d ? '✓' : '✗ DRIFT'}`);
  }
  console.log('');

  const problems = missing.length + extra.length + drifted.length;
  if (missing.length) console.log(`✗ ${missing.length} in file but NOT in db: ${missing.join(', ')}`);
  if (extra.length) console.log(`✗ ${extra.length} in db but NOT in file: ${extra.join(', ')}`);
  if (drifted.length) {
    console.log(`✗ ${drifted.length} row${drifted.length === 1 ? '' : 's'} differ:`);
    for (const d of drifted.slice(0, 20)) console.log(`  · ${d}`);
    if (drifted.length > 20) console.log(`  … ${drifted.length - 20} more`);
  }

  if (problems) {
    console.log(`\nRun \`npm run db:seed\` to sync.\n`);
    process.exit(1);
  }
  console.log('✓ database matches the dataset\n');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
