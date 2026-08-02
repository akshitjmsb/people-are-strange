// ── List / table sorting ─────────────────────────────────────────────────
// Comparators for the list view. Money and headcount are stored as human
// strings, so we parse them to numbers to sort meaningfully; unknown values
// always sink to the bottom regardless of direction.

import { typeDef } from './categories';
import type { CityConfig } from './city-config';
import { parseFundingAmount } from './funding';
import { distanceKm, type LatLng } from './geo';
import type { AICompany } from './types';

export type SortKey = 'name' | 'industry' | 'founded' | 'funding' | 'headcount' | 'distance';
export type SortDir = 'asc' | 'desc';

export const SORT_LABELS: Record<SortKey, string> = {
  name: 'Name',
  industry: 'Industry',
  founded: 'Founded',
  funding: 'Funding',
  headcount: 'Team',
  distance: 'Near me',
};

/** Lower bound of a "51-200"/"1000+" style headcount band, for ranking. */
export function headcountRank(raw?: string): number {
  if (!raw) return -1;
  const m = raw.replace(/,/g, '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : -1;
}

const industryOf = (c: AICompany) => c.industry ?? 'ai';

/**
 * Sort a copy of the companies by the given key/direction. `name` sorts
 * alphabetically; every other key sorts by its metric with a stable name
 * tiebreak, and missing values (no founded year, no funding, no headcount)
 * are pinned last in both directions. `distance` needs an `origin` (the
 * user's location) — without one it falls back to name order.
 */
export function sortCompanies(
  city: CityConfig,
  companies: AICompany[],
  key: SortKey,
  dir: SortDir,
  origin?: LatLng | null,
): AICompany[] {
  const sign = dir === 'asc' ? 1 : -1;
  const byName = (a: AICompany, b: AICompany) => a.name.localeCompare(b.name);

  // Missing-value sentinel: pull rows with no value to the end either way.
  const missing = dir === 'asc' ? Infinity : -Infinity;

  return [...companies].sort((a, b) => {
    switch (key) {
      case 'name':
        return sign * byName(a, b);
      case 'industry': {
        const ai = industryOf(a);
        const bi = industryOf(b);
        if (ai !== bi) return sign * ai.localeCompare(bi);
        // within an industry, group by type label, then name
        const at = typeDef(city, a.type).label;
        const bt = typeDef(city, b.type).label;
        return sign * (at.localeCompare(bt) || byName(a, b)) || byName(a, b);
      }
      case 'founded': {
        const av = a.founded ?? missing;
        const bv = b.founded ?? missing;
        return av === bv ? byName(a, b) : sign * (av - bv);
      }
      case 'funding': {
        const av = a.funding?.totalRaised ? parseFundingAmount(a.funding.totalRaised) : missing;
        const bv = b.funding?.totalRaised ? parseFundingAmount(b.funding.totalRaised) : missing;
        return av === bv ? byName(a, b) : sign * (av - bv);
      }
      case 'headcount': {
        const ar = headcountRank(a.headcount);
        const br = headcountRank(b.headcount);
        const av = ar < 0 ? missing : ar;
        const bv = br < 0 ? missing : br;
        return av === bv ? byName(a, b) : sign * (av - bv);
      }
      case 'distance': {
        if (!origin) return byName(a, b);
        const av = distanceKm(origin, a);
        const bv = distanceKm(origin, b);
        return av === bv ? byName(a, b) : sign * (av - bv);
      }
    }
  });
}
