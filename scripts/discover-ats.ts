// ── ATS discovery probe ──────────────────────────────────────────────────────
// Feasibility check for live open-role counts. Scraping arbitrary careers pages
// is hopeless, but most companies sit on an applicant-tracking system with a
// public, unauthenticated JSON board API. This fetches each careers page,
// follows redirects, and sniffs the final URL + HTML for an ATS signature.
//
//   npx tsx scripts/discover-ats.ts
//
// Read-only and advisory: it prints what it found so the mapping can be
// reviewed by a human before anything is written into the dataset.
import { COMPANIES } from '../lib/companies-data';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const CONCURRENCY = 6;
const TIMEOUT_MS = 20_000;

/** Each pattern yields the board token we'd need to call the provider's API. */
const SIGNATURES: { provider: string; re: RegExp }[] = [
  { provider: 'greenhouse', re: /(?:job-)?boards(?:-api)?\.greenhouse\.io\/(?:embed\/job_board\?for=)?([a-z0-9_-]+)/i },
  { provider: 'greenhouse', re: /greenhouse\.io\/embed\/job_board\/js\?for=([a-z0-9_-]+)/i },
  { provider: 'lever', re: /jobs\.lever\.co\/([a-z0-9_-]+)/i },
  { provider: 'ashby', re: /jobs\.ashbyhq\.com\/([a-z0-9_.-]+)/i },
  { provider: 'workable', re: /apply\.workable\.com\/(?:api\/v[0-9]\/accounts\/)?([a-z0-9_-]+)/i },
  { provider: 'smartrecruiters', re: /(?:careers|jobs)\.smartrecruiters\.com\/([a-zA-Z0-9_-]+)/i },
  { provider: 'recruitee', re: /([a-z0-9-]+)\.recruitee\.com/i },
  { provider: 'teamtailor', re: /([a-z0-9-]+)\.teamtailor\.com/i },
  { provider: 'bamboohr', re: /([a-z0-9-]+)\.bamboohr\.com\/(?:careers|jobs)/i },
  { provider: 'personio', re: /([a-z0-9-]+)\.jobs\.personio\.(?:de|com)/i },
  { provider: 'workday', re: /([a-z0-9-]+)\.(wd[0-9]+)\.myworkdayjobs\.com/i },
  { provider: 'icims', re: /([a-z0-9-]+)\.icims\.com/i },
  { provider: 'taleo', re: /([a-z0-9-]+)\.taleo\.net/i },
  { provider: 'successfactors', re: /([a-z0-9-]+)\.(?:successfactors|sapsf)\.(?:com|eu)/i },
  { provider: 'jobvite', re: /jobs\.jobvite\.com\/([a-z0-9-]+)/i },
  { provider: 'eightfold', re: /([a-z0-9-]+)\.eightfold\.ai/i },
  { provider: 'phenom', re: /([a-z0-9-]+)\.phenompeople\.com/i },
];

interface Found {
  id: string;
  name: string;
  provider: string | null;
  token: string | null;
  finalUrl: string;
  status: number | null;
  note?: string;
}

function sniff(haystack: string): { provider: string; token: string } | null {
  for (const { provider, re } of SIGNATURES) {
    const m = haystack.match(re);
    if (m?.[1]) return { provider, token: m[1] };
  }
  return null;
}

async function probe(c: (typeof COMPANIES)[number]): Promise<Found> {
  const url = c.careersUrl!;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'user-agent': UA, accept: 'text/html,*/*' },
    });
    const body = await res.text();
    // Final URL first — a careers page that redirects straight to the ATS is
    // the cleanest signal. Then the HTML, which catches embedded boards.
    const hit = sniff(res.url) ?? sniff(body);
    return {
      id: c.id,
      name: c.name,
      provider: hit?.provider ?? null,
      token: hit?.token ?? null,
      finalUrl: res.url,
      status: res.status,
    };
  } catch (e) {
    return {
      id: c.id,
      name: c.name,
      provider: null,
      token: null,
      finalUrl: url,
      status: null,
      note: e instanceof Error ? e.name : 'failed',
    };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const targets = COMPANIES.filter((c) => c.careersUrl);
  const results: Found[] = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (cursor < targets.length) results.push(await probe(targets[cursor++]));
    }),
  );

  const resolved = results.filter((r) => r.provider);
  const unresolved = results.filter((r) => !r.provider);

  const byProvider = new Map<string, Found[]>();
  for (const r of resolved) byProvider.set(r.provider!, [...(byProvider.get(r.provider!) ?? []), r]);

  console.log(`\nprobed ${results.length} careers pages`);
  console.log(`  ✓ ${resolved.length} resolved to an ATS`);
  console.log(`  · ${unresolved.length} unresolved\n`);

  console.log('BY PROVIDER');
  for (const [p, list] of [...byProvider].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${String(list.length).padStart(3)} ${p}`);
    for (const r of list) console.log(`        ${r.id.padEnd(28)} token=${r.token}`);
  }

  console.log('\nUNRESOLVED');
  for (const r of unresolved.sort((a, b) => a.id.localeCompare(b.id))) {
    console.log(`  ${r.id.padEnd(28)} ${r.status ?? r.note}  ${r.finalUrl.slice(0, 72)}`);
  }
  console.log('');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
