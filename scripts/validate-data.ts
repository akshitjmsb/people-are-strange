// ── Dataset integrity check ──────────────────────────────────────────────────
// Offline, no network, runs in CI on every PR. Catches the class of bug that
// used to surface only as a Postgres constraint violation during a manual seed
// (duplicate ids), plus coordinate, type and provenance mistakes.
//
//   npm run validate
//
// Exits 1 on any ERROR. Warnings are reported but never fail the build.
import { COMPANIES } from '../lib/companies-data';
import { PEOPLE } from '../lib/people-data';
import { COMPANY_TYPES, INDUSTRY_ORDER } from '../lib/categories';
import type { AtsProvider } from '../lib/ats';
import type { Industry } from '../lib/types';

const ATS_PROVIDERS: AtsProvider[] = [
  'ashby',
  'greenhouse',
  'lever',
  'smartrecruiters',
  'workable',
  'bamboohr',
  'ubisoft-mtl',
];

// Impossible-coordinate bounds: anything outside this is a sign flip, a
// transposed lat/lng, a 0/0, or a pin in another province.
const QUEBEC = { latMin: 45.0, latMax: 46.5, lngMin: -74.6, lngMax: -71.0 };
// Greater Montreal proper. Outside this is legitimate (the Québec aerospace
// corridor reaches Bromont and Sherbrooke) but worth surfacing on an MTL map.
const METRO = { latMin: 45.35, latMax: 45.75, lngMin: -74.15, lngMax: -73.3 };

const errors: string[] = [];
/** Warnings are grouped by kind so the report reads as counts, not a wall. */
const warnings = new Map<string, string[]>();
const err = (m: string) => errors.push(m);
const warn = (kind: string, detail: string) => {
  const list = warnings.get(kind) ?? [];
  list.push(detail);
  warnings.set(kind, list);
};

const industryOf = (c: { industry?: Industry }): Industry => c.industry ?? 'ai';
const isUrl = (u: string) => /^https?:\/\/[^\s"']+$/.test(u);

// ── Companies ────────────────────────────────────────────────────────────────
const seenIds = new Map<string, string>();
const seenNames = new Map<string, string>();

for (const c of COMPANIES) {
  const at = `${c.id} (${c.name})`;

  // Identity — the duplicate that broke the seed.
  if (seenIds.has(c.id)) err(`duplicate id "${c.id}" — also used by ${seenIds.get(c.id)}`);
  else seenIds.set(c.id, c.name);

  const nameKey = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (seenNames.has(nameKey)) warn('duplicate name', `"${c.name}" — also ${seenNames.get(nameKey)}`);
  else seenNames.set(nameKey, c.id);

  if (!c.id.match(/^[a-z0-9-]+$/)) err(`${at}: id must be lowercase kebab-case`);

  // Required content.
  if (!c.name?.trim()) err(`${at}: empty name`);
  if (!c.oneLiner?.trim()) err(`${at}: empty oneLiner`);
  if (!Array.isArray(c.aiDomains) || c.aiDomains.length === 0) err(`${at}: no domains`);

  // Geography.
  if (typeof c.lat !== 'number' || typeof c.lng !== 'number' || Number.isNaN(c.lat) || Number.isNaN(c.lng)) {
    err(`${at}: lat/lng must be numbers`);
  } else {
    if (c.lat < QUEBEC.latMin || c.lat > QUEBEC.latMax || c.lng < QUEBEC.lngMin || c.lng > QUEBEC.lngMax) {
      err(`${at}: coords ${c.lat},${c.lng} are outside Québec — sign flip or transposed lat/lng?`);
    } else if (c.lat < METRO.latMin || c.lat > METRO.latMax || c.lng < METRO.lngMin || c.lng > METRO.lngMax) {
      warn('outside Greater Montreal', `${at} — ${c.neighborhood ?? 'no neighborhood'}`);
    }
  }

  // Type must exist and belong to the company's own industry layer.
  const def = COMPANY_TYPES[c.type];
  if (!def) {
    err(`${at}: unknown type "${c.type}"`);
  } else if (def.industry !== industryOf(c)) {
    err(`${at}: type "${c.type}" belongs to ${def.industry}, but industry is ${industryOf(c)}`);
  }
  if (c.industry && !INDUSTRY_ORDER.includes(c.industry)) err(`${at}: unknown industry "${c.industry}"`);

  // Links well-formed (liveness is checked separately, see check-links.ts).
  for (const [field, val] of [
    ['website', c.website],
    ['careersUrl', c.careersUrl],
    ['linkedin', c.linkedin],
  ] as const) {
    if (val && !isUrl(val)) err(`${at}: ${field} is not a valid URL — "${val}"`);
  }
  for (const s of c.sources ?? []) if (!isUrl(s)) err(`${at}: malformed source URL "${s}"`);
  if (!c.sources?.length) warn('no sources', at);

  // Signals.
  if (c.hiring && !c.careersUrl) warn('hiring:true but no careersUrl', at);

  // ATS board reference — a typo'd provider silently drops the company from
  // the role refresh, so it fails the build rather than going unnoticed.
  if (c.ats) {
    if (!ATS_PROVIDERS.includes(c.ats.provider)) {
      err(`${at}: unknown ats provider "${c.ats.provider}" (known: ${ATS_PROVIDERS.join(', ')})`);
    }
    if (!c.ats.token?.trim()) err(`${at}: ats reference has an empty token`);
    if (!c.careersUrl) warn('ats board but no careersUrl', at);
  }
  // Live counts are written by the refresh job, never by hand.
  if (c.openRolesMontreal !== undefined || c.openRolesTotal !== undefined) {
    err(`${at}: open-role counts must not be hand-edited into the dataset — they live in the database`);
  }
  if (c.founded && (c.founded < 1800 || c.founded > new Date().getFullYear())) {
    err(`${at}: implausible founded year ${c.founded}`);
  }
  if (c.verifiedAt && !/^\d{4}-\d{2}$/.test(c.verifiedAt)) {
    err(`${at}: verifiedAt must be YYYY-MM — got "${c.verifiedAt}"`);
  }
  if (!c.verifiedAt) warn('no verifiedAt', at);
}

// ── People ───────────────────────────────────────────────────────────────────
const companyIds = new Set(COMPANIES.map((c) => c.id));
const seenPeople = new Set<string>();

for (const p of PEOPLE) {
  const at = `person ${p.id} (${p.name})`;
  if (seenPeople.has(p.id)) err(`duplicate person id "${p.id}"`);
  seenPeople.add(p.id);
  if (!companyIds.has(p.companyId)) err(`${at}: companyId "${p.companyId}" does not exist`);
  if (p.linkedinUrl && !isUrl(p.linkedinUrl)) err(`${at}: malformed linkedinUrl "${p.linkedinUrl}"`);
}

// ── Report ───────────────────────────────────────────────────────────────────
const byIndustry = INDUSTRY_ORDER.map((i) => {
  const n = COMPANIES.filter((c) => industryOf(c) === i).length;
  return `${i} ${n}`;
}).join('  ·  ');

console.log(`\n${COMPANIES.length} companies  ·  ${PEOPLE.length} people`);
console.log(`${byIndustry}\n`);

const warnTotal = [...warnings.values()].reduce((n, l) => n + l.length, 0);
if (warnTotal) {
  console.log(`⚠ ${warnTotal} warning${warnTotal === 1 ? '' : 's'} (coverage gaps — not blocking)`);
  // Grouped by kind: the counts are the signal, the examples are context.
  for (const [kind, list] of [...warnings].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${String(list.length).padStart(4)} × ${kind}`);
    for (const d of list.slice(0, 3)) console.log(`         ${d}`);
    if (list.length > 3) console.log(`         … ${list.length - 3} more`);
  }
  console.log('');
}

if (errors.length) {
  console.error(`✗ ${errors.length} error${errors.length === 1 ? '' : 's'}`);
  for (const e of errors) console.error(`  · ${e}`);
  console.error('');
  process.exit(1);
}

console.log('✓ dataset valid\n');
