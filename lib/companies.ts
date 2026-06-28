import { COMPANIES } from './companies-data';
import type { AICompany } from './types';

export interface LoadResult {
  companies: AICompany[];
  source: 'db' | 'local';
}

/**
 * Truth-in-mapping: a pin is only "exact" when we have a verified street
 * address. Otherwise it's neighbourhood-level and the UI says so.
 */
function withPrecision(companies: AICompany[]): AICompany[] {
  return companies.map((c) => ({
    ...c,
    locationPrecision: (c.address ? 'exact' : 'approximate') as 'exact' | 'approximate',
  }));
}

/**
 * Load the Montreal AI companies. Queries the Neon Postgres database via the
 * `/api/companies` route. If that fails (network, missing DATABASE_URL, empty
 * table), it falls back to the bundled dataset so the map always renders.
 */
export async function loadCompanies(): Promise<LoadResult> {
  try {
    const res = await fetch('/api/companies', { cache: 'no-store' });
    if (!res.ok) throw new Error(`/api/companies responded ${res.status}`);
    const json = (await res.json()) as { companies?: AICompany[] };
    if (!json.companies?.length) throw new Error('no companies returned');
    return { companies: withPrecision(json.companies), source: 'db' };
  } catch (err) {
    console.warn('[companies] DB load failed, using bundled dataset:', err);
    return { companies: withPrecision(COMPANIES), source: 'local' };
  }
}
