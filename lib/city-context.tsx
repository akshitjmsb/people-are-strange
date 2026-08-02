'use client';

// ── Active city, for client components ───────────────────────────────────
// The provider takes a city *id*, not a CityConfig: CityConfig holds RegExp
// values (localityPattern) which cannot cross the server→client boundary.
// The id is a plain string, so it serializes, and the config is resolved
// on the client from the same registry.

import { createContext, useContext, useMemo } from 'react';
import { getCity, DEFAULT_CITY_ID } from './cities';
import type { CityConfig, CityId } from './city-config';

const CityContext = createContext<CityId>(DEFAULT_CITY_ID);

export function CityProvider({ cityId, children }: { cityId: CityId; children: React.ReactNode }) {
  return <CityContext.Provider value={cityId}>{children}</CityContext.Provider>;
}

/** The active city's full config. Memoized per id so consumers can rely on a
 *  stable reference in dependency arrays. */
export function useCity(): CityConfig {
  const id = useContext(CityContext);
  return useMemo(() => getCity(id), [id]);
}

/** Just the id — for building links and API query strings. */
export function useCityId(): CityId {
  return useContext(CityContext);
}
