import { latLngToCell } from 'h3-js';
import type { H3Resolution, HexCell, POI, POICategory } from './types';

// H3 resolutions used by the app:
//   res 9  → ~150 m hexes, street level (zoomed in)
//   res 7  → ~1.2 km hexes, island overview (zoomed out)
export const RES_FINE: H3Resolution = 9;
export const RES_COARSE: H3Resolution = 7;

/** Index a lat/lng into an H3 cell at the given resolution. */
export function latLngToH3(lat: number, lng: number, res: H3Resolution): string {
  return latLngToCell(lat, lng, res);
}

/** Pick the right H3 resolution for the current map zoom. */
export function resolutionForZoom(zoom: number): H3Resolution {
  return zoom >= 13.5 ? RES_FINE : RES_COARSE;
}

/** Read the pre-computed H3 id off a POI for the chosen resolution. */
export function hexIdForPoi(poi: POI, res: H3Resolution): string {
  return res === RES_FINE ? poi.h3_res9 : poi.h3_res7;
}

/**
 * Aggregate POIs into H3 cells at the given resolution.
 * Returns one HexCell per occupied hexagon, with count + dominant category.
 */
export function aggregateToHexes(pois: POI[], res: H3Resolution): HexCell[] {
  const byHex = new Map<string, POI[]>();
  for (const poi of pois) {
    const hex = hexIdForPoi(poi, res) || latLngToH3(poi.lat, poi.lng, res);
    const bucket = byHex.get(hex);
    if (bucket) bucket.push(poi);
    else byHex.set(hex, [poi]);
  }

  const cells: HexCell[] = [];
  for (const [hexId, group] of byHex) {
    const counts = new Map<POICategory, number>();
    for (const p of group) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);

    let dominantCategory: POICategory = group[0].category;
    let best = 0;
    for (const [cat, n] of counts) {
      if (n > best) {
        best = n;
        dominantCategory = cat;
      }
    }

    cells.push({
      hexId,
      count: group.length,
      categories: Array.from(counts.keys()),
      dominantCategory,
    });
  }
  return cells;
}

/** All POIs that fall inside a given hexagon at a resolution. */
export function getHexPOIs(pois: POI[], hexId: string, res: H3Resolution): POI[] {
  return pois.filter((p) => hexIdForPoi(p, res) === hexId);
}

/** Largest POI count across cells — used to scale color/elevation ramps. */
export function maxCount(cells: HexCell[]): number {
  return cells.reduce((m, c) => Math.max(m, c.count), 0);
}
