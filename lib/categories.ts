// ── Categories — city-driven ─────────────────────────────────────────────
// All industry metadata, company type definitions, type orders, and domain
// labels are read from the active city config. This file re-exports them
// as the same shape the rest of the app expects.

import { getCity } from './cities';
import type { CityConfig, TypeDef } from './city-config';
import type { Domain, CompanyType, Industry } from './types';

export type { TypeDef };

// ── Re-exports from the active city ────────────────────────────────────

/** Per-industry identity — label, emoji and accent colour. */
export function getIndustryMeta(): CityConfig['industryMeta'] {
  return getCity().industryMeta;
}

/** The INDUSTRY_META constant for backward compat — delegates to city config.
 *  Components that import this at module level will get the build-time city. */
export const INDUSTRY_META = getCity().industryMeta;

/** Fixed display order for the active city's industries. */
export const INDUSTRY_ORDER: Industry[] = getCity().industries;

/** The neutral "city grid" accent for neighborhood chrome. */
export const AREA_ACCENT = getCity().areaAccent;

/** All company type definitions for the active city. */
export const COMPANY_TYPES: Record<string, TypeDef> = getCity().companyTypes;

/** Combined chip order across every industry (the 'all' lens). */
export const TYPE_ORDER: CompanyType[] = (getCity().typeOrder['all'] ?? []) as CompanyType[];

/** The chip order to show for a given industry selection. */
export function typeOrderFor(industry: Industry | 'all'): CompanyType[] {
  const orders = getCity().typeOrder;
  return (orders[industry] ?? orders['all'] ?? []) as CompanyType[];
}

export function typeDef(t: CompanyType): TypeDef {
  return COMPANY_TYPES[t] ?? (Object.values(COMPANY_TYPES)[0] as TypeDef);
}

export function typeColor(t: CompanyType): string {
  return typeDef(t).color;
}

// ── Domain labels ──────────────────────────────────────────────────────

export const DOMAIN_LABELS: Record<string, string> = getCity().domainLabels;

export function domainLabel(d: Domain): string {
  return DOMAIN_LABELS[d] ?? d;
}
