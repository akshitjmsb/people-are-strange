import { SEED_POIS, type SeedPOI } from './seed-data';
import { latLngToH3, RES_COARSE, RES_FINE } from './h3-utils';
import { supabase } from './supabase';
import type { POI } from './types';

/** Turn a coordinate-only seed entry into a full POI with H3 indexes. */
function seedToPOI(seed: SeedPOI, idx: number): POI {
  return {
    id: `seed-${idx}`,
    name: seed.name,
    category: seed.category,
    subcategory: seed.subcategory,
    description: seed.description,
    lat: seed.lat,
    lng: seed.lng,
    address: seed.address,
    tags: seed.tags,
    source: seed.source,
    h3_res9: latLngToH3(seed.lat, seed.lng, RES_FINE),
    h3_res7: latLngToH3(seed.lat, seed.lng, RES_COARSE),
  };
}

/** The bundled Montreal dataset, fully indexed — used as the offline fallback. */
export const LOCAL_POIS: POI[] = SEED_POIS.map(seedToPOI);

export interface LoadResult {
  pois: POI[];
  source: 'supabase' | 'local';
}

/**
 * Load POIs. Tries Supabase first; if it's unreachable, still restoring, or
 * returns nothing, falls back to the bundled Montreal seed dataset so the map
 * is never empty.
 */
export async function loadPOIs(): Promise<LoadResult> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('pois')
        .select('id,name,category,subcategory,description,lat,lng,h3_res9,h3_res7,address,tags,source')
        .limit(5000);

      if (!error && data && data.length > 0) {
        return { pois: data as POI[], source: 'supabase' };
      }
    } catch {
      // network / restoring — fall through to local
    }
  }
  return { pois: LOCAL_POIS, source: 'local' };
}
