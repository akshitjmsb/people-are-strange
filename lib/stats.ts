// ── Ecosystem statistics ─────────────────────────────────────────────────
// Roll a set of companies up into the numbers the dashboard shows: totals,
// funding, per-industry and per-type splits, a founding-era histogram, hiring
// heat and the densest neighborhoods. All derived from the existing fields, so
// it works identically against the live DB or the bundled offline dataset.

import { canonicalNeighborhood } from './neighborhoods';
import { parseFundingAmount } from './funding';
import type { AICompany, CompanyType, Industry } from './types';

export interface FoundingBucket {
  label: string;
  count: number;
}

export interface EcosystemStats {
  total: number;
  hiringCount: number;
  totalFunding: number; // raw dollars
  fundedCount: number; // companies with a known raised amount
  neighborhoodCount: number;
  perIndustry: Record<Industry, number>;
  perType: { type: CompanyType; count: number }[];
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

export function buildEcosystemStats(companies: AICompany[]): EcosystemStats {
  const perIndustry: Record<Industry, number> = { ai: 0, aerospace: 0, energy: 0, marine: 0, gaming: 0 };
  const typeCounts = new Map<CompanyType, number>();
  const neighborhoods = new Map<string, number>();
  const founding = ERAS.map((e) => ({ label: e.label, count: 0 }));

  let hiringCount = 0;
  let totalFunding = 0;
  let fundedCount = 0;
  let oldestFounded: number | null = null;

  for (const c of companies) {
    perIndustry[industryOf(c)] += 1;
    typeCounts.set(c.type, (typeCounts.get(c.type) ?? 0) + 1);

    if (c.hiring) hiringCount += 1;

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
    totalFunding,
    fundedCount,
    neighborhoodCount: neighborhoods.size,
    perIndustry,
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
