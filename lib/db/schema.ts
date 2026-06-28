// ── Drizzle schema: the Montreal AI companies table ──────────────────────────
// Mirrors the `AICompany` shape from lib/types.ts. Scalar fields map to plain
// columns; the multi-value fields (aiDomains, industries, tags, sources) are
// Postgres text[] arrays, and the nested `funding` object is stored as jsonb.
// `locationPrecision` is intentionally NOT stored — it's derived at read time
// from whether a verified street `address` exists (see lib/companies.ts).

import { pgTable, text, doublePrecision, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import type { Domain, CompanyType, Funding, Industry } from '../types';

export const companies = pgTable('companies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  aka: text('aka'),

  // Which industry layer this company belongs to. Existing rows backfill to
  // 'ai' via the column default.
  industry: text('industry').$type<Industry>().notNull().default('ai'),

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
  notable: text('notable'),
  status: text('status'),

  // Provenance.
  website: text('website'),
  linkedin: text('linkedin'),
  sources: text('sources').array(),
});

export type CompanyRow = typeof companies.$inferSelect;
export type NewCompanyRow = typeof companies.$inferInsert;
