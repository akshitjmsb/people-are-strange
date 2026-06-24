import { COMPANIES } from './companies-data';
import type { AICompany } from './types';

export interface LoadResult {
  companies: AICompany[];
  source: 'local';
}

/**
 * Load the Montreal AI companies. Currently served from the bundled, hand-
 * curated + web-researched dataset so the map works fully offline. (A Supabase
 * backend can be wired in later behind this same interface.)
 */
export async function loadCompanies(): Promise<LoadResult> {
  // Truth-in-mapping: a pin is only "exact" when we have a verified street
  // address. Otherwise it's neighbourhood-level and the UI says so.
  const companies = COMPANIES.map((c) => ({
    ...c,
    locationPrecision: (c.address ? 'exact' : 'approximate') as 'exact' | 'approximate',
  }));
  return { companies, source: 'local' };
}
