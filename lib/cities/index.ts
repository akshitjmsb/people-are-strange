// ── City selector ────────────────────────────────────────────────────────
// Reads NEXT_PUBLIC_CITY at build time and returns the matching config.
// Defaults to Montreal so existing deployments are unaffected.

import type { CityConfig, CityId } from '../city-config';
import { montreal } from './montreal';
import { victoria } from './victoria';

const CITIES: Record<CityId, CityConfig> = { montreal, victoria };

let _cached: CityConfig | null = null;

/** The active city config for this build. Memoized — safe to call anywhere. */
export function getCity(): CityConfig {
  if (_cached) return _cached;
  const id = (process.env.NEXT_PUBLIC_CITY || 'montreal') as CityId;
  _cached = CITIES[id] ?? CITIES.montreal;
  return _cached;
}

export type { CityConfig, CityId } from '../city-config';
