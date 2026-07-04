import { COMPANIES } from './companies-data';
import type { AICompany, Industry } from './types';

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
 * Load the Montreal companies (AI + aerospace). Queries the Neon Postgres
 * database via the `/api/companies` route with a timeout and one retry. If
 * that fails (network, missing DATABASE_URL, empty table), it falls back to
 * the bundled dataset so the map always renders. Pass an `industry` to fetch
 * just one layer.
 */
export async function loadCompanies(industry?: Industry): Promise<LoadResult> {
  const url = industry ? `/api/companies?industry=${industry}` : '/api/companies';
  try {
    const companies = await fetchCompanies(url);
    return { companies: normalize(companies), source: 'db' };
  } catch (err) {
    console.warn('[companies] DB load failed, using bundled dataset:', err);
    const local = industry
      ? COMPANIES.filter((c) => (c.industry ?? 'ai') === industry)
      : COMPANIES;
    return { companies: normalize(local), source: 'local' };
  }
}
