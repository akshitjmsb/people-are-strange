// ── Refresh live open-role counts ────────────────────────────────────────────
// Fetches every company that has an `ats` board reference and writes the
// Montreal / total counts onto its row. Runs on a schedule (see
// .github/workflows/refresh-roles.yml) so the map shows what's actually open
// today rather than whether someone once found a careers link.
//
//   npm run roles:refresh -- --dry    fetch and print, write nothing
//   npm run roles:refresh             fetch and persist
//
// A provider that errors leaves the previous counts untouched — a stale number
// beats blanking a company's roles because one board had a bad afternoon.
import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';

import { COMPANIES } from '../lib/companies-data';
import { companies } from '../lib/db/schema';
import { fetchRoleCounts } from '../lib/ats';

const dry = process.argv.includes('--dry');
const CONCURRENCY = 4;

interface Outcome {
  id: string;
  name: string;
  ok: boolean;
  montreal?: number;
  ambiguous?: number;
  total?: number;
  error?: string;
}

async function main() {
  const targets = COMPANIES.filter((c) => c.ats);
  if (!targets.length) {
    console.log('no companies have an `ats` reference — nothing to refresh.');
    return;
  }

  const results: Outcome[] = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (cursor < targets.length) {
        const c = targets[cursor++];
        try {
          const { montreal, ambiguous, total } = await fetchRoleCounts(c.ats!);
          results.push({ id: c.id, name: c.name, ok: true, montreal, ambiguous, total });
        } catch (e) {
          results.push({ id: c.id, name: c.name, ok: false, error: e instanceof Error ? e.message : String(e) });
        }
      }
    }),
  );

  results.sort((a, b) => (b.montreal ?? -1) - (a.montreal ?? -1));

  console.log(`\n${dry ? 'DRY RUN — ' : ''}fetched ${targets.length} boards\n`);
  console.log('  MTL  AMBIG  TOTAL   COMPANY');
  for (const r of results.filter((x) => x.ok)) {
    console.log(
      `  ${String(r.montreal).padStart(3)}  ${String(r.ambiguous).padStart(5)}  ${String(r.total).padStart(5)}   ${r.name}`,
    );
  }
  const failed = results.filter((x) => !x.ok);
  if (failed.length) {
    console.log(`\n  ${failed.length} board${failed.length === 1 ? '' : 's'} failed (previous counts kept):`);
    for (const r of failed) console.log(`    ${r.id}: ${r.error}`);
  }

  const totalMtl = results.filter((r) => r.ok).reduce((n, r) => n + (r.montreal ?? 0), 0);
  console.log(`\n  ${totalMtl} open roles in Montreal across ${results.filter((r) => r.ok).length} boards\n`);

  if (dry) return;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set.');
  const db = drizzle(neon(url));
  const fetchedAt = new Date().toISOString();

  let written = 0;
  for (const r of results) {
    if (!r.ok) continue; // keep whatever was there before
    await db
      .update(companies)
      .set({ openRolesMontreal: r.montreal, openRolesTotal: r.total, rolesFetchedAt: fetchedAt })
      .where(eq(companies.id, r.id));
    written++;
  }
  console.log(`✓ wrote counts for ${written} companies.\n`);

  // A board that starts failing silently would quietly freeze counts, so make
  // partial failure visible to CI without losing the successful writes.
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
