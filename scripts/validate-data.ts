// ── Dataset integrity check ──────────────────────────────────────────────────
// Offline, no network, runs in CI on every PR. Catches the class of bug that
// used to surface only as a Postgres constraint violation during a manual seed
// (duplicate ids), plus coordinate, type and provenance mistakes.
//
//   npm run validate
//
// Exits 1 on any ERROR. Warnings are reported but never fail the build.
import { bundledCompanies } from '../lib/companies';
import { COMPANY_PROFILES } from '../lib/company-profiles';
import { PEOPLE } from '../lib/people-data';
import { companyTypes, industryOrder } from '../lib/categories';
import { CITY_IDS, getCity } from '../lib/cities';
import type { AtsProvider } from '../lib/ats';
import type { CityConfig, CityId } from '../lib/city-config';
import type { AICompany, Industry } from '../lib/types';

const ATS_PROVIDERS: AtsProvider[] = [
  'ashby',
  'greenhouse',
  'lever',
  'smartrecruiters',
  'workable',
  'bamboohr',
  'ubisoft-mtl',
];

interface Bounds {
  label: string;
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
}

// Broad sanity bounds catch sign flips and pins in the wrong province. Core
// bounds are narrower and only warn: a regional map may legitimately include
// a company outside the urban centre.
const GEO_BOUNDS: Record<CityId, { region: Bounds; core: Bounds }> = {
  montreal: {
    region: { label: 'Québec', latMin: 45.0, latMax: 46.5, lngMin: -74.6, lngMax: -71.0 },
    core: { label: 'Greater Montréal', latMin: 45.35, latMax: 45.75, lngMin: -74.15, lngMax: -73.3 },
  },
  victoria: {
    region: { label: 'southern Vancouver Island', latMin: 48.1, latMax: 49.0, lngMin: -124.2, lngMax: -122.8 },
    core: { label: 'Greater Victoria', latMin: 48.3, latMax: 48.75, lngMin: -123.8, lngMax: -123.1 },
  },
  vancouver: {
    region: { label: 'southwest British Columbia', latMin: 48.8, latMax: 50.1, lngMin: -124.0, lngMax: -121.8 },
    core: { label: 'Metro Vancouver', latMin: 49.0, latMax: 49.5, lngMin: -123.5, lngMax: -122.4 },
  },
};

const companyRows = CITY_IDS.flatMap((cityId) => {
  const city = getCity(cityId);
  return bundledCompanies(cityId).map((company) => ({ cityId, city, company }));
});
const allCompanies = companyRows.map(({ company }) => company);

const errors: string[] = [];
/** Warnings are grouped by kind so the report reads as counts, not a wall. */
const warnings = new Map<string, string[]>();
const err = (m: string) => errors.push(m);
const warn = (kind: string, detail: string) => {
  const list = warnings.get(kind) ?? [];
  list.push(detail);
  warnings.set(kind, list);
};

const industryOf = (c: { industry?: Industry }, city: CityConfig): Industry =>
  c.industry ?? city.industries[0];
const isUrl = (u: string) => /^https?:\/\/[^\s"']+$/.test(u);
const inside = (lat: number, lng: number, bounds: Bounds) =>
  lat >= bounds.latMin && lat <= bounds.latMax && lng >= bounds.lngMin && lng <= bounds.lngMax;

// ── Companies ────────────────────────────────────────────────────────────────
const seenIds = new Map<string, string>();
const seenNames = new Map<string, string>();

for (const { cityId, city, company: c } of companyRows) {
  const at = `${cityId}/${c.id} (${c.name})`;
  const COMPANY_TYPES = companyTypes(city);
  const INDUSTRY_ORDER = industryOrder(city);
  const bounds = GEO_BOUNDS[cityId];

  // Identity — the duplicate that broke the seed.
  if (seenIds.has(c.id)) err(`duplicate id "${c.id}" — also used by ${seenIds.get(c.id)}`);
  else seenIds.set(c.id, c.name);

  // The same parent employer can legitimately have a record in several city
  // maps. Only flag duplicate display names inside the same city.
  const nameKey = `${cityId}:${c.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
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
    if (!inside(c.lat, c.lng, bounds.region)) {
      err(`${at}: coords ${c.lat},${c.lng} are outside ${bounds.region.label} — wrong city, sign flip, or transposed lat/lng?`);
    } else if (!inside(c.lat, c.lng, bounds.core)) {
      warn(`outside ${bounds.core.label}`, `${at} — ${c.neighborhood ?? 'no neighborhood'}`);
    }
  }

  // Type must exist and belong to the company's own industry layer.
  const def = COMPANY_TYPES[c.type];
  if (!def) {
    err(`${at}: unknown type "${c.type}"`);
  } else if (def.industry !== industryOf(c, city)) {
    err(`${at}: type "${c.type}" belongs to ${def.industry}, but industry is ${industryOf(c, city)}`);
  }
  if (c.industry && !INDUSTRY_ORDER.includes(c.industry)) err(`${at}: unknown industry "${c.industry}"`);

  // Secondary industries: a company's own product must substantively belong
  // there too — see the doc comment on AICompany.secondaryIndustries. The
  // structural checks below catch the mechanical ways this can go wrong; the
  // judgment call about whether a company genuinely belongs is a human one.
  if (c.secondaryIndustries) {
    if (c.secondaryIndustries.length === 0) warn('empty secondaryIndustries array', at);
    const seen = new Set<string>();
    for (const ind of c.secondaryIndustries) {
      if (!INDUSTRY_ORDER.includes(ind)) err(`${at}: unknown secondary industry "${ind}"`);
      if (ind === industryOf(c, city)) err(`${at}: secondary industry "${ind}" duplicates its own primary industry`);
      if (seen.has(ind)) err(`${at}: secondary industry "${ind}" listed twice`);
      seen.add(ind);
    }
  }

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
const companyIds = new Set(allCompanies.map((c) => c.id));
const seenPeople = new Set<string>();

for (const p of PEOPLE) {
  const at = `person ${p.id} (${p.name})`;
  if (seenPeople.has(p.id)) err(`duplicate person id "${p.id}"`);
  seenPeople.add(p.id);
  if (!companyIds.has(p.companyId)) err(`${at}: companyId "${p.companyId}" does not exist`);
  if (p.linkedinUrl && !isUrl(p.linkedinUrl)) err(`${at}: malformed linkedinUrl "${p.linkedinUrl}"`);
}

// ── Company profiles (founders + stories) ─────────────────────────────────────
// Enrichment lives in its own file (lib/company-profiles.ts), merged at load
// time by bundledCompanies(). Validate it here so a typo'd id or a malformed
// founder fails CI instead of silently vanishing from the merge.
const PERSON_ROLES = new Set(['founder', 'executive', 'hiring']);
let profilesWithPeople = 0;
let peopleTotal = 0;
for (const [id, profile] of Object.entries(COMPANY_PROFILES)) {
  const at = `profile "${id}"`;
  if (!companyIds.has(id)) err(`${at}: no company has this id — the profile will never merge`);
  if (profile.people?.length) profilesWithPeople++;
  for (const p of profile.people ?? []) {
    peopleTotal++;
    if (!p.name?.trim()) err(`${at}: a person has an empty name`);
    if (!p.title?.trim()) err(`${at}: person "${p.name}" has an empty title`);
    if (!PERSON_ROLES.has(p.role)) err(`${at}: person "${p.name}" has invalid role "${p.role}"`);
    if (p.linkedIn && !isUrl(p.linkedIn)) err(`${at}: person "${p.name}" linkedIn is not a URL — "${p.linkedIn}"`);
    if (p.linkedIn && !/linkedin\.com\//i.test(p.linkedIn)) {
      err(`${at}: person "${p.name}" linkedIn is not a linkedin.com URL — "${p.linkedIn}"`);
    }
  }
  if (profile.story !== undefined && !profile.story.trim()) err(`${at}: story is present but empty`);
  if (profile.notableClients?.some((s) => !s?.trim())) err(`${at}: a notableClients entry is empty`);
}

// ── Report ───────────────────────────────────────────────────────────────────
const citySummaries = CITY_IDS.map((cityId) => {
  const city = getCity(cityId);
  const companies = companyRows.filter((row) => row.cityId === cityId).map((row) => row.company);
  const byIndustry = industryOrder(city)
    .map((industry) => `${industry} ${companies.filter((c) => industryOf(c, city) === industry).length}`)
    .join('  ·  ');
  return `${city.name}: ${companies.length} companies  ·  ${byIndustry}`;
});

console.log(
  `\n${allCompanies.length} companies across ${CITY_IDS.length} cities  ·  ${PEOPLE.length} people  ·  ` +
    `${Object.keys(COMPANY_PROFILES).length} profiles (${profilesWithPeople} with people, ${peopleTotal} contacts)`,
);
console.log(`${citySummaries.join('\n')}\n`);

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
