import { COMPANIES } from './companies-data';
import type { AICompany } from './types';

export interface LoadResult {
  companies: AICompany[];
  source: 'db' | 'local';
}

/**
 * Truth-in-mapping: a pin is only "exact" when we have a verified street
 * address. Otherwise it's neighbourhood-level and the UI says so. Also
 * normalizes the industry so legacy rows without one read as 'ai'.
 */
function normalize(companies: AICompany[]): AICompany[] {
  return companies.map((c) => ({
    ...c,
    industry: c.industry ?? 'ai',
    locationPrecision: (c.address ? 'exact' : 'approximate') as 'exact' | 'approximate',
  }));
}

/**
 * Load the Montreal companies (AI + aerospace). Queries the Neon Postgres
 * database via the `/api/companies` route. If that fails (network, missing
 * DATABASE_URL, empty table), it falls back to the bundled dataset so the map
 * always renders. Pass an `industry` to fetch just one layer.
 */
export async function loadCompanies(industry?: 'ai' | 'aerospace'): Promise<LoadResult> {
  const url = industry ? `/api/companies?industry=${industry}` : '/api/companies';
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`/api/companies responded ${res.status}`);
    const json = (await res.json()) as { companies?: AICompany[] };
    if (!json.companies?.length) throw new Error('no companies returned');
    return { companies: normalize(json.companies), source: 'db' };
  } catch (err) {
    console.warn('[companies] DB load failed, using bundled dataset:', err);
    const local = industry
      ? COMPANIES.filter((c) => (c.industry ?? 'ai') === industry)
      : COMPANIES;
    return { companies: normalize(local), source: 'local' };
  }
}
