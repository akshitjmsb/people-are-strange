'use client';

// ── Category bundle bound to the active city ─────────────────────────────
// lib/categories.ts holds pure functions of a CityConfig. Components would
// otherwise have to thread the city through every call, so this hook binds
// them once and hands back the same names the components already use.
//
// Server code (API routes, scripts) should call lib/categories.ts directly.

import { useMemo } from 'react';
import { useCity } from './city-context';
import * as cat from './categories';
import type { TypeDef } from './city-config';
import type { CompanyType, Domain, Industry } from './types';

export interface CategoryBundle {
  INDUSTRY_META: ReturnType<typeof cat.getIndustryMeta>;
  INDUSTRY_ORDER: Industry[];
  AREA_ACCENT: string;
  COMPANY_TYPES: Record<string, TypeDef>;
  TYPE_ORDER: CompanyType[];
  DOMAIN_LABELS: Record<string, string>;
  typeOrderFor: (industry: Industry | 'all') => CompanyType[];
  typeDef: (t: CompanyType) => TypeDef;
  typeColor: (t: CompanyType) => string;
  domainLabel: (d: Domain) => string;
}

export function useCategories(): CategoryBundle {
  const city = useCity();
  return useMemo(
    () => ({
      INDUSTRY_META: cat.getIndustryMeta(city),
      INDUSTRY_ORDER: cat.industryOrder(city),
      AREA_ACCENT: cat.areaAccent(city),
      COMPANY_TYPES: cat.companyTypes(city),
      TYPE_ORDER: cat.typeOrder(city),
      DOMAIN_LABELS: cat.domainLabels(city),
      typeOrderFor: (industry: Industry | 'all') => cat.typeOrderFor(city, industry),
      typeDef: (t: CompanyType) => cat.typeDef(city, t),
      typeColor: (t: CompanyType) => cat.typeColor(city, t),
      domainLabel: (d: Domain) => cat.domainLabel(city, d),
    }),
    [city],
  );
}
