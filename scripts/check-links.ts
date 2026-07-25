// ── Link-rot check ───────────────────────────────────────────────────────────
// Careers pages move constantly; a 404 careers link is worse than no link at
// all. This hits the network, so it runs on a schedule (not on every PR, where
// a flaky host would block an unrelated change).
//
//   npm run check:links            website + careersUrl
//   npm run check:links -- --all   also every source URL
//
// Exits 1 only on CONFIRMED dead (404/410). Bot-walls (403/405/429) are
// reported separately and never fail the run — Cloudflare blocking a datacenter
// IP says nothing about whether the page exists.
import { COMPANIES } from '../lib/companies-data';

const CONCURRENCY = 8;
const TIMEOUT_MS = 15_000;
// A real browser UA gets past the laziest bot walls; the rest we report as
// inconclusive rather than pretend to know.
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

interface Target {
  company: string;
  field: string;
  url: string;
}

interface Result extends Target {
  status: number | null;
  note?: string;
}

const checkAllSources = process.argv.includes('--all');

const targets: Target[] = [];
for (const c of COMPANIES) {
  if (c.website) targets.push({ company: c.id, field: 'website', url: c.website });
  if (c.careersUrl) targets.push({ company: c.id, field: 'careersUrl', url: c.careersUrl });
  if (checkAllSources) {
    for (const s of c.sources ?? []) targets.push({ company: c.id, field: 'source', url: s });
  }
}

async function probe(t: Target): Promise<Result> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    // Some hosts reject HEAD outright; GET is slower but far fewer false deads.
    const res = await fetch(t.url, {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'user-agent': UA, accept: 'text/html,*/*' },
    });
    return { ...t, status: res.status };
  } catch (e) {
    return { ...t, status: null, note: e instanceof Error ? e.name : 'fetch failed' };
  } finally {
    clearTimeout(timer);
  }
}

async function run() {
  const results: Result[] = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (cursor < targets.length) {
        const t = targets[cursor++];
        results.push(await probe(t));
      }
    }),
  );

  const dead = results.filter((r) => r.status === 404 || r.status === 410);
  const blocked = results.filter((r) => r.status !== null && [401, 403, 405, 429].includes(r.status));
  const unreachable = results.filter((r) => r.status === null);
  const serverErr = results.filter((r) => r.status !== null && r.status >= 500);
  const ok = results.length - dead.length - blocked.length - unreachable.length - serverErr.length;

  console.log(`\nchecked ${results.length} links across ${COMPANIES.length} companies`);
  console.log(`  ✓ ${ok} ok`);
  if (blocked.length) console.log(`  ? ${blocked.length} bot-walled (inconclusive)`);
  if (unreachable.length) console.log(`  ? ${unreachable.length} unreachable (timeout/DNS)`);
  if (serverErr.length) console.log(`  ? ${serverErr.length} server error (5xx)`);
  console.log(`  ✗ ${dead.length} dead\n`);

  if (dead.length) {
    console.log('DEAD LINKS');
    for (const r of dead.sort((a, b) => a.company.localeCompare(b.company))) {
      console.log(`  ${r.status}  ${r.company}.${r.field}  ${r.url}`);
    }
    console.log('');
  }

  // Surfaced for context but never fatal — these need a human to eyeball.
  for (const [label, list] of [
    ['BOT-WALLED', blocked],
    ['UNREACHABLE', unreachable],
    ['SERVER ERROR', serverErr],
  ] as const) {
    if (!list.length) continue;
    console.log(label);
    for (const r of list.sort((a, b) => a.company.localeCompare(b.company))) {
      console.log(`  ${r.status ?? r.note}  ${r.company}.${r.field}  ${r.url}`);
    }
    console.log('');
  }

  if (dead.length) process.exit(1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
