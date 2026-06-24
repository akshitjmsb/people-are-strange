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
  return { companies: COMPANIES, source: 'local' };
}
