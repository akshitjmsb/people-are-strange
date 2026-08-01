// ── City configuration contract ──────────────────────────────────────────
// Every city-specific value lives behind this interface so the rest of the
// app never mentions a city by name. NEXT_PUBLIC_CITY selects which config
// to load at build time.

import type { Industry, CompanyType } from './types';

export type CityId = 'montreal' | 'victoria';

export interface TypeDef {
  key: CompanyType;
  label: string;
  emoji: string;
  color: string;
  industry: Industry;
}

export interface CityConfig {
  id: CityId;
  name: string;             // "Montréal" or "Victoria"
  tagline: string;          // one-line descriptor for the brand mark
  mapCenter: [number, number]; // [lat, lng]
  defaultZoom: number;
  themeColor: string;       // PWA theme-color hex

  // ── Industry layer setup ──────────────────────────────────────────
  industries: Industry[];
  industryMeta: Record<string, { label: string; emoji: string; color: string }>;
  companyTypes: Record<string, TypeDef>;
  /** Chip order per industry, plus an 'all' key for combined view. */
  typeOrder: Record<string, CompanyType[]>;
  domainLabels: Record<string, string>;

  // ── Neighborhoods ─────────────────────────────────────────────────
  canonicalNeighborhoods: Record<string, string>;

  // ── ATS locality matching ─────────────────────────────────────────
  /** Matches locations that are definitively "here" (this city / region). */
  localityPattern: RegExp;
  /** Matches locations that are "maybe" local (country-wide, remote, etc.). */
  localityAmbiguousPattern: RegExp;

  // ── Geo ────────────────────────────────────────────────────────────
  /** Longitude-to-latitude degree ratio at this city's latitude, used to
   *  make cluster polygons visually round on the map. = 1 / cos(lat). */
  lngScale: number;

  // ── Colors ─────────────────────────────────────────────────────────
  /** The city's own palette — like Montreal's "street art" colours. */
  cityPalette: Record<string, string>;
  /** The "neutral grid" accent for neighborhood chrome. */
  areaAccent: string;

  // ── Metadata / copy ────────────────────────────────────────────────
  metaTitle: string;
  metaDescription: string;
  loadingText: string;       // "Mapping Montréal…"
  csvPrefix: string;         // prefix for exported CSV filenames
}
