// ── Neighborhood clusters ────────────────────────────────────────────────
// The raw `neighborhood` field is free text with lots of near-duplicates
// ("Downtown / McGill", "McGill / Downtown", "Downtown / Concordia" are all
// downtown). We fold those into canonical clusters, then derive each cluster's
// centroid and a soft boundary polygon straight from its members' coordinates
// — so neighborhoods like Mile-Ex, Griffintown and the Port become tappable
// spatial clusters without hand-drawn boundaries.

import type { CompanyType, Industry } from './types';
import type { AICompany } from './types';
import { parseFundingAmount } from './funding';
import type { CityConfig } from './city-config';

/** Map a raw neighborhood string to its canonical cluster (or null). */
export function canonicalNeighborhood(city: CityConfig, raw?: string | null): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (!t) return null;
  return city.canonicalNeighborhoods[t] ?? t;
}

/** URL-safe slug for a canonical neighborhood name ("Mile-Ex" → "mile-ex",
 *  "Côte-des-Neiges" → "cote-des-neiges", "Old Montreal & Old Port" →
 *  "old-montreal-and-old-port"). Used for shareable deep links. */
export function neighborhoodSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Resolve a URL slug back to the canonical neighborhood name present in the
 *  data, or null if no cluster matches. */
export function resolveNeighborhoodSlug(
  city: CityConfig,
  slug: string,
  companies: AICompany[],
): string | null {
  const target = slug.toLowerCase();
  const seen = new Set<string>();
  for (const c of companies) {
    const name = canonicalNeighborhood(city, c.neighborhood);
    if (!name || seen.has(name)) continue;
    seen.add(name);
    if (neighborhoodSlug(name) === target) return name;
  }
  return null;
}

export interface NeighborhoodCluster {
  name: string;
  companies: AICompany[];
  count: number;
  hiringCount: number;
  totalFunding: number; // raw dollars
  /** Company types present, most common first. */
  topTypes: { type: CompanyType; count: number }[];
  /** Industries present, most common first. */
  topIndustries: { industry: Industry; count: number }[];
  centroid: [number, number]; // [lng, lat]
  /** Soft boundary polygon ([lng,lat] ring) derived from the members. */
  polygon: [number, number][];
  bounds: [[number, number], [number, number]]; // [[minLng,minLat],[maxLng,maxLat]]
}

const industryOf = (c: AICompany): Industry => c.industry ?? 'ai';

/** Build the canonical neighborhood clusters for a set of companies, richest
 *  first. Each cluster carries aggregate stats and a map boundary. */
export function buildNeighborhoodClusters(
  city: CityConfig,
  companies: AICompany[],
): NeighborhoodCluster[] {
  const groups = new Map<string, AICompany[]>();
  for (const c of companies) {
    const name = canonicalNeighborhood(city, c.neighborhood);
    if (!name) continue;
    const g = groups.get(name);
    if (g) g.push(c);
    else groups.set(name, [c]);
  }

  const clusters: NeighborhoodCluster[] = [];
  for (const [name, members] of groups) {
    const pts = members.map((c) => [c.lng, c.lat] as [number, number]);
    const centroid = centroidOf(pts);

    const typeCounts = new Map<CompanyType, number>();
    const industryCounts = new Map<Industry, number>();
    let hiringCount = 0;
    let totalFunding = 0;
    for (const c of members) {
      typeCounts.set(c.type, (typeCounts.get(c.type) ?? 0) + 1);
      const ind = industryOf(c);
      industryCounts.set(ind, (industryCounts.get(ind) ?? 0) + 1);
      if (c.hiring) hiringCount += 1;
      totalFunding += parseFundingAmount(c.funding?.totalRaised);
    }

    clusters.push({
      name,
      companies: members,
      count: members.length,
      hiringCount,
      totalFunding,
      topTypes: [...typeCounts.entries()]
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      topIndustries: [...industryCounts.entries()]
        .map(([industry, count]) => ({ industry, count }))
        .sort((a, b) => b.count - a.count),
      centroid,
      polygon: clusterPolygon(city, pts, centroid),
      bounds: boundsOf(pts),
    });
  }

  return clusters.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// ── Geometry ─────────────────────────────────────────────────────────────

function centroidOf(pts: [number, number][]): [number, number] {
  let x = 0;
  let y = 0;
  for (const [px, py] of pts) {
    x += px;
    y += py;
  }
  return [x / pts.length, y / pts.length];
}

function boundsOf(pts: [number, number][]): [[number, number], [number, number]] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return [
    [minX, minY],
    [maxX, maxY],
  ];
}

/** Andrew's monotone-chain convex hull. Returns the hull ring (CCW). */
function convexHull(points: [number, number][]): [number, number][] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;
  const cross = (o: number[], a: number[], b: number[]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const lower: [number, number][] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: [number, number][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

// Longitude degrees are shorter than latitude degrees; the ratio depends on
// the city's latitude, so it is passed in rather than frozen at import.
const MIN_RADIUS_DEG = 0.0045; // ~0.5 km — keeps tiny clusters visible

function dedupe(pts: [number, number][]): [number, number][] {
  const seen = new Set<string>();
  const out: [number, number][] = [];
  for (const p of pts) {
    const k = `${p[0].toFixed(5)},${p[1].toFixed(5)}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out;
}

function ellipse(lngScale: number, center: [number, number], r: number, n = 28): [number, number][] {
  const ring: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    ring.push([center[0] + Math.cos(a) * r * lngScale, center[1] + Math.sin(a) * r]);
  }
  return ring;
}

/** Push a ring outward from its centre and enforce a minimum radius, so the
 *  boundary hugs the members with a little breathing room. */
function inflate(
  ring: [number, number][],
  center: [number, number],
  pad: number,
  minR: number,
): [number, number][] {
  return ring.map(([x, y]) => {
    const dx = x - center[0];
    const dy = y - center[1];
    const d = Math.hypot(dx, dy) || 1e-9;
    const nd = Math.max(d * pad, minR);
    return [center[0] + (dx / d) * nd, center[1] + (dy / d) * nd] as [number, number];
  });
}

/** A soft boundary polygon for a cluster's points: a padded convex hull when
 *  there are enough distinct points, otherwise a circle around the centroid. */
export function clusterPolygon(
  city: CityConfig,
  points: [number, number][],
  centroid: [number, number],
): [number, number][] {
  const uniq = dedupe(points);
  if (uniq.length >= 3) {
    const hull = convexHull(uniq);
    if (hull.length >= 3) return inflate(hull, centroidOf(hull), 1.22, MIN_RADIUS_DEG);
  }
  // 1–2 points: size a circle to the spread (or the minimum).
  let maxD = MIN_RADIUS_DEG;
  for (const p of uniq) {
    maxD = Math.max(maxD, Math.hypot(p[0] - centroid[0], p[1] - centroid[1]) + MIN_RADIUS_DEG);
  }
  return ellipse(city.lngScale, centroid, maxD);
}
