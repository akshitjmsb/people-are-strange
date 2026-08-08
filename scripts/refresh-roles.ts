// ── Refresh live open-role counts (CLI / GitHub Action) ──────────────────────
// A thin wrapper over lib/refresh.ts so this command and the Vercel Cron
// endpoint (app/api/refresh) run the exact same engine — the counts can't
// depend on which door triggered the refresh.
//
//   npm run roles:refresh -- --dry    fetch and print, write nothing
//   npm run roles:refresh             fetch, persist, and log the run
//
// A provider that errors leaves the previous counts untouched — a stale number
// beats blanking a company's roles because one board had a bad afternoon. The
// run itself is recorded in refresh_runs either way, so a slowly-rotting board
// is visible in the history rather than silently freezing its count.
import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../lib/db';
import { refreshRoles } from '../lib/refresh';

const dry = process.argv.includes('--dry');

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set.');

  const r = await refreshRoles(db, { trigger: 'cli', dryRun: dry });

  console.log(`\n${dry ? 'DRY RUN — ' : ''}fetched ${r.boardsTotal} boards\n`);

  // The changelog: companies whose counts moved (or were fetched for the first
  // time). A quiet run — every board unchanged — prints no rows, which is the
  // honest signal that nothing changed.
  if (r.changes.length) {
    console.log('  ΔMTL   MTL  TOTAL   COMPANY');
    for (const c of [...r.changes].sort((a, b) => b.deltaMontreal - a.deltaMontreal)) {
      const delta = c.firstFetch ? 'new' : (c.deltaMontreal >= 0 ? '+' : '') + c.deltaMontreal;
      console.log(
        `  ${delta.padStart(4)}  ${String(c.after.montreal).padStart(4)}  ${String(c.after.total).padStart(5)}   ${c.name}`,
      );
    }
  } else {
    console.log('  no count changes since the last refresh.');
  }

  if (r.failures.length) {
    console.log(`\n  ${r.failures.length} board${r.failures.length === 1 ? '' : 's'} failed (previous counts kept):`);
    for (const f of r.failures) console.log(`    ${f.id}: ${f.error}`);
  }

  console.log(
    `\n  status: ${r.status} · ${r.postingsSeen} postings seen · ${r.postingsClosed} closed · ${r.companiesRefreshed} companies written · net ${r.rolesDelta >= 0 ? '+' : ''}${r.rolesDelta} Montreal roles\n`,
  );

  // A board that starts failing silently would quietly freeze counts, so make
  // partial failure visible to CI without losing the successful writes.
  if (r.status !== 'ok') process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
