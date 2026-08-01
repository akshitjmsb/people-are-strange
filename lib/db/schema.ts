// ── Drizzle schema: the companies table ──────────────────────────────────────
// Mirrors the `AICompany` shape from lib/types.ts. Scalar fields map to plain
// columns; the multi-value fields (aiDomains, industries, tags, sources) are
// Postgres text[] arrays, and the nested `funding` object is stored as jsonb.
// `locationPrecision` is intentionally NOT stored — it's derived at read time
// from whether a verified street `address` exists (see lib/companies.ts).
//
// One table holds every city's rows; `city` is the discriminator. Everything
// that reads or writes it MUST scope by city — see the API route's filter and
// the city-scoped prune in scripts/seed.ts.

import { pgTable, text, doublePrecision, integer, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import type { Domain, CompanyType, Funding, Industry } from '../types';
import type { CityId } from '../city-config';

export const companies = pgTable('companies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  aka: text('aka'),

  // Which city map this row belongs to. Defaults to 'montreal' so the 160
  // pre-existing rows backfill correctly on migration with no data step —
  // the whole table was Montreal before this column existed.
  city: text('city').$type<CityId>().notNull().default('montreal'),

  // Which industry layer this company belongs to. Existing rows backfill to
  // 'ai' via the column default.
  industry: text('industry').$type<Industry>().notNull().default('ai'),

  // Other industry lenses this company is also genuinely native to — see the
  // doc comment on AICompany.secondaryIndustries in lib/types.ts.
  secondaryIndustries: text('secondary_industries').array().$type<Industry[]>(),

  // Map position (real Montreal coordinates).
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  address: text('address'),
  neighborhood: text('neighborhood'),

  // What it is.
  type: text('type').$type<CompanyType>().notNull(),
  oneLiner: text('one_liner').notNull(),
  problem: text('problem'),
  solution: text('solution'),

  // What they work on.
  aiDomains: text('ai_domains').array().$type<Domain[]>().notNull(),
  industries: text('industries').array(),
  tags: text('tags').array(),

  // Signals.
  founded: integer('founded'),
  headcount: text('headcount'),
  funding: jsonb('funding').$type<Funding>(),
  hiring: boolean('hiring'),
  careersUrl: text('careers_url'),
  notable: text('notable'),
  status: text('status'),

  // Live open-role counts, written only by scripts/refresh-roles.ts on a
  // schedule. NOT part of the curated dataset, so the seed deliberately leaves
  // these columns alone (see ROLE_COLUMNS in scripts/seed.ts) — otherwise every
  // deploy would blank them until the next refresh ran.
  openRolesMontreal: integer('open_roles_montreal'),
  openRolesTotal: integer('open_roles_total'),
  rolesFetchedAt: text('roles_fetched_at'),

  // Provenance.
  website: text('website'),
  linkedin: text('linkedin'),
  sources: text('sources').array(),
  verifiedAt: text('verified_at'),
}, (t) => ({
  // Every read is scoped by city, so it's the one column worth indexing.
  cityIdx: index('companies_city_idx').on(t.city),
}));

export type CompanyRow = typeof companies.$inferSelect;
export type NewCompanyRow = typeof companies.$inferInsert;
