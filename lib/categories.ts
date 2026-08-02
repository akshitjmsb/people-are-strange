// ── Categories — city-driven ─────────────────────────────────────────────
// Every value here is a function of a CityConfig, never a module-level
// constant. Constants were evaluated once at import time, which froze the
// whole bundle to one city — the reason a single deployment could not serve
// Montréal and Victoria at the same time.
//
// Client components get their city from useCity(); server code passes one in.

import type { CityConfig, TypeDef } from './city-config';
import type { Domain, CompanyType, Industry } from './types';

export type { TypeDef };

/** Per-industry identity — label, emoji and accent colour. */
export function getIndustryMeta(city: CityConfig): CityConfig['industryMeta'] {
  return city.industryMeta;
}

/** Fixed display order for this city's industries. */
export function industryOrder(city: CityConfig): Industry[] {
  return city.industries;
}

/** The neutral "city grid" accent for neighborhood chrome. */
export function areaAccent(city: CityConfig): string {
  return city.areaAccent;
}

/** All company type definitions for this city. */
export function companyTypes(city: CityConfig): Record<string, TypeDef> {
  return city.companyTypes;
}

/** Combined chip order across every industry (the 'all' lens). */
export function typeOrder(city: CityConfig): CompanyType[] {
  return (city.typeOrder['all'] ?? []) as CompanyType[];
}

/** The chip order to show for a given industry selection. */
export function typeOrderFor(city: CityConfig, industry: Industry | 'all'): CompanyType[] {
  const orders = city.typeOrder;
  return (orders[industry] ?? orders['all'] ?? []) as CompanyType[];
}

export function typeDef(city: CityConfig, t: CompanyType): TypeDef {
  const types = city.companyTypes;
  return types[t] ?? (Object.values(types)[0] as TypeDef);
}

export function typeColor(city: CityConfig, t: CompanyType): string {
  return typeDef(city, t).color;
}

// ── Domain labels ──────────────────────────────────────────────────────

export function domainLabels(city: CityConfig): Record<string, string> {
  return city.domainLabels;
}

export function domainLabel(city: CityConfig, d: Domain): string {
  return city.domainLabels[d] ?? d;
}
