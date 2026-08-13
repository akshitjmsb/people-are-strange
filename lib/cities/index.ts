// ── City selector ────────────────────────────────────────────────────────
// One deployment serves every city. The city comes from the /[city] route
// segment, so this is a pure lookup — never a memoized global. Memoizing it
// was what made a build single-city: server requests for two different
// cities would have raced on the same cached value.

import type { CityConfig, CityId } from '../city-config';
import { montreal } from './montreal';
import { vancouver } from './vancouver';
import { victoria } from './victoria';

const CITIES: Record<CityId, CityConfig> = { montreal, victoria, vancouver };

/** Every city this build knows about, in display order. */
export const CITY_IDS = Object.keys(CITIES) as CityId[];

/** Where `/` sends visitors. NEXT_PUBLIC_CITY still selects it, so existing
 *  deployments keep landing on the city they always did. */
export const DEFAULT_CITY_ID: CityId = isCityId(process.env.NEXT_PUBLIC_CITY)
  ? process.env.NEXT_PUBLIC_CITY
  : 'montreal';

export function isCityId(value: unknown): value is CityId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(CITIES, value);
}

/** Config for a city. Unknown or missing ids fall back to the default so a
 *  bad URL renders a real map instead of throwing. */
export function getCity(id?: unknown): CityConfig {
  return isCityId(id) ? CITIES[id] : CITIES[DEFAULT_CITY_ID];
}

export type { CityConfig, CityId } from '../city-config';
