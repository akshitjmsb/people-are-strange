// ── Ecosystem statistics ─────────────────────────────────────────────────
// Roll a set of companies up into the numbers the dashboard shows: totals,
// funding, per-industry and per-type splits, a founding-era histogram, hiring
// heat and the densest neighborhoods. All derived from the existing fields, so
// it works identically against the live DB or the bundled offline dataset.

import { canonicalNeighborhood } from './neighborhoods';
import { parseFundingAmount } from './funding';
import { INDUSTRY_ORDER } from './categories';
import type { AICompany, CompanyType, Industry } from './types';

export interface FoundingBucket {
  label: string;
  count: number;
}

export interface EcosystemStats {
  total: number;
  hiringCount: number;
  /** Live postings whose location names Montreal, summed across every company
   *  whose ATS board we poll. Zero boards polled → 0, so the dashboard reads
   *  `liveBoards` alongside it rather than showing a bare, meaningless 0. */
  openRolesMontreal: number;
  liveBoards: number;
  totalFunding: number; // raw dollars
  fundedCount: number; // companies with a known raised amount
  neighborhoodCount: number;
  /** Per industry, counting a company once for its primary industry and once
   *  more for each secondary one it carries — so a cross-listed company (e.g.
   *  an AI-native biotech) shows up in both bars. Can sum to more than
   *  `total`; that overlap is the point, not a bug. */
  perIndustry: Record<Industry, number>;
  perType: { type: CompanyType; count: number }[];
  /** Within a specific industry lens (see `lens` param below), how many of the
   *  companies present are here only via secondaryIndustries — i.e. their
   *  primary home is a different industry. 0 when no lens was given. */
  crossListedCount: number;
  founding: FoundingBucket[];
  oldestFounded: number | null;
  topNeighborhoods: { name: string; count: number }[];
}

const industryOf = (c: AICompany): Industry => c.industry ?? 'ai';

// Founding eras chosen to fit the data: a century-old aerospace base through to
// this decade's AI startups.
const ERAS: { label: string; test: (y: number) => boolean }[] = [
  { label: '<1980', test: (y) => y < 1980 },
  { label: '80s', test: (y) => y >= 1980 && y < 1990 },
  { label: '90s', test: (y) => y >= 1990 && y < 2000 },
  { label: '00s', test: (y) => y >= 2000 && y < 2010 },
  { label: '10s', test: (y) => y >= 2010 && y < 2020 },
  { label: '20s', test: (y) => y >= 2020 },
];

/**
 * @param lens When set, `companies` is assumed already narrowed to this
 *   industry (primary or secondary) — used only to compute `crossListedCount`,
 *   i.e. how many are here solely via secondaryIndustries.
 */
export function buildEcosystemStats(companies: AICompany[], lens?: Industry): EcosystemStats {
  // Seed a zero for every industry the active city declares, so a per-industry
  // bucket exists no matter which city this build is (a hardcoded Montreal set
  // would leave other cities' industries undefined → NaN).
  const perIndustry = Object.fromEntries(
    INDUSTRY_ORDER.map((i) => [i, 0]),
  ) as Record<Industry, number>;
  const typeCounts = new Map<CompanyType, number>();
  const neighborhoods = new Map<string, number>();
  const founding = ERAS.map((e) => ({ label: e.label, count: 0 }));

  let hiringCount = 0;
  let totalFunding = 0;
  let fundedCount = 0;
  let oldestFounded: number | null = null;
  let openRolesMontreal = 0;
  let liveBoards = 0;
  let crossListedCount = 0;

  for (const c of companies) {
    perIndustry[industryOf(c)] += 1;
    for (const ind of c.secondaryIndustries ?? []) perIndustry[ind] += 1;
    typeCounts.set(c.type, (typeCounts.get(c.type) ?? 0) + 1);

    if (lens && industryOf(c) !== lens) crossListedCount += 1;

    if (c.hiring) hiringCount += 1;

    if (c.openRolesMontreal !== undefined) {
      liveBoards += 1;
      openRolesMontreal += c.openRolesMontreal;
    }

    const raised = parseFundingAmount(c.funding?.totalRaised);
    if (raised > 0) {
      totalFunding += raised;
      fundedCount += 1;
    }

    if (typeof c.founded === 'number') {
      oldestFounded = oldestFounded === null ? c.founded : Math.min(oldestFounded, c.founded);
      const era = ERAS.findIndex((e) => e.test(c.founded as number));
      if (era >= 0) founding[era].count += 1;
    }

    const area = canonicalNeighborhood(c.neighborhood);
    if (area) neighborhoods.set(area, (neighborhoods.get(area) ?? 0) + 1);
  }

  return {
    total: companies.length,
    hiringCount,
    openRolesMontreal,
    liveBoards,
    totalFunding,
    fundedCount,
    neighborhoodCount: neighborhoods.size,
    perIndustry,
    crossListedCount,
    perType: [...typeCounts.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    founding,
    oldestFounded,
    topNeighborhoods: [...neighborhoods.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  };
}
