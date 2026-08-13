import { COMPANIES as MONTREAL_COMPANIES } from './companies-data';
import { COMPANIES as VANCOUVER_COMPANIES } from './companies-data-vancouver';
import { COMPANIES as VANCOUVER_ECOSYSTEM_COMPANIES } from './companies-data-vancouver-ecosystem';
import { COMPANIES as VANCOUVER_HIGH_TECH_COMPANIES } from './companies-data-vancouver-high-tech';
import { COMPANIES as VICTORIA_COMPANIES } from './companies-data-victoria';
import { COMPANY_PROFILES } from './company-profiles';
import { getCity, DEFAULT_CITY_ID } from './cities';
import type { AICompany, Industry } from './types';
import type { CityId } from './city-config';

/** Bundled dataset per city. A registry, not a branch: adding a city means
 *  adding a line here and a data file — no feature code changes. scripts/seed.ts
 *  reads the same map, so what we seed and what the client falls back to can
 *  never drift apart. */
const DATASETS: Record<CityId, AICompany[]> = {
  montreal: MONTREAL_COMPANIES,
  victoria: VICTORIA_COMPANIES,
  vancouver: [...VANCOUVER_COMPANIES, ...VANCOUVER_ECOSYSTEM_COMPANIES, ...VANCOUVER_HIGH_TECH_COMPANIES],
};

export function bundledCompanies(city: CityId): AICompany[] {
  const dataset = DATASETS[city] ?? DATASETS[DEFAULT_CITY_ID];
  // Merge in the founder/story enrichment (lib/company-profiles.ts). A profile
  // only ever adds the rich-card fields; a company without one is unchanged.
  return dataset.map((c) => {
    const profile = COMPANY_PROFILES[c.id];
    return profile ? { ...c, ...profile } : c;
  });
}

export interface LoadResult {
  companies: AICompany[];
  source: 'db' | 'local';
}

/**
 * Truth-in-mapping: a pin is only "exact" when we have a verified street
 * address. Otherwise it's neighbourhood-level and the UI says so. Also
 * normalizes the industry so legacy rows without one default to the city's
 * first industry (Montreal → 'ai', Victoria/Vancouver → 'tech').
 */
function normalize(cityId: CityId, companies: AICompany[]): AICompany[] {
  const fallbackIndustry = getCity(cityId).industries[0];
  return companies.map((c) => ({
    ...c,
    industry: c.industry ?? fallbackIndustry,
    locationPrecision: (c.address ? 'exact' : 'approximate') as 'exact' | 'approximate',
  }));
}

const FETCH_TIMEOUT_MS = 6000;
const RETRIES = 1;

/** Fetch with a hard timeout so a hanging DB/network never blanks the map. */
async function fetchWithTimeout(url: string): Promise<Response> {
  return fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
}

async function fetchCompanies(url: string): Promise<AICompany[]> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) throw new Error(`/api/companies responded ${res.status}`);
      const json = (await res.json()) as { companies?: AICompany[] };
      if (!json.companies?.length) throw new Error('no companies returned');
      return json.companies;
    } catch (err) {
      lastErr = err;
      // brief pause before the retry; the first failure is often transient
      if (attempt < RETRIES) await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw lastErr;
}

/**
 * Load a city's companies. Queries the Neon Postgres database via the
 * `/api/companies` route with a timeout and one retry. If that fails
 * (network, missing DATABASE_URL, empty table), it falls back to the bundled
 * dataset so the map always renders. Pass an `industry` to fetch one layer.
 */
export async function loadCompanies(cityId: CityId, industry?: Industry): Promise<LoadResult> {
  const params = new URLSearchParams({ city: cityId });
  if (industry) params.set('industry', industry);
  const url = `/api/companies?${params.toString()}`;
  try {
    const companies = await fetchCompanies(url);
    return { companies: normalize(cityId, companies), source: 'db' };
  } catch (err) {
    console.warn('[companies] DB load failed, using bundled dataset:', err);
    const all = bundledCompanies(cityId);
    const local = industry ? all.filter((c) => c.industry === industry) : all;
    return { companies: normalize(cityId, local), source: 'local' };
  }
}
