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
import type { Domain, CompanyType, Funding, KeyPerson, Industry } from '../types';
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
  // Rich-card profile fields. `people` is a jsonb array of {name,title,role,
  // linkedIn?} — founders, execs, and hiring contacts; the rest are plain
  // scalars. All nullable — a company with no verified people simply has none.
  fundingStage: text('funding_stage'),
  people: jsonb('people').$type<KeyPerson[]>(),
  story: text('story'),
  notableClients: text('notable_clients').array(),
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

// ── Refresh run log ──────────────────────────────────────────────────────────
// One row per data-refresh run (see lib/refresh.ts). Two jobs at once:
//
//   1. Freshness — the newest finished row of a given `kind` is "when this data
//      was last updated", which the app can surface to job hunters. This is a
//      single, authoritative timestamp; the per-company `rolesFetchedAt` on the
//      companies table stays as the finer-grained, per-board signal.
//   2. Changelog — `summary` records what actually changed on that run (which
//      companies' counts moved, and by how much), so a stale or misbehaving
//      board is visible after the fact instead of silently freezing numbers.
//
// `kind` is deliberately open-ended: the roles refresh writes 'roles' today,
// and the same table will hold 'links' (link-rot sweeps) and 'intake' (staging
// queue promotions) as those land — see the extension notes in lib/refresh.ts.
export type RefreshKind = 'roles' | 'links' | 'intake';
export type RefreshStatus = 'ok' | 'partial' | 'error';
export type RefreshTrigger = 'cron' | 'manual' | 'cli';

export const refreshRuns = pgTable('refresh_runs', {
  // Opaque uuid; the run's identity is its timestamp, but a stable key lets the
  // app link to a specific run without depending on clock resolution.
  id: text('id').primaryKey(),
  kind: text('kind').$type<RefreshKind>().notNull().default('roles'),
  status: text('status').$type<RefreshStatus>().notNull(),
  trigger: text('trigger').$type<RefreshTrigger>().notNull(),

  startedAt: text('started_at').notNull(),
  // Null while a run is in flight; set on completion (success or handled error).
  finishedAt: text('finished_at'),

  // How the run went, in numbers. `boardsFailed` > 0 with status 'partial' is
  // the normal "one host had a bad afternoon" case — those companies keep their
  // previous counts rather than being blanked.
  companiesRefreshed: integer('companies_refreshed').notNull().default(0),
  boardsOk: integer('boards_ok').notNull().default(0),
  boardsFailed: integer('boards_failed').notNull().default(0),
  // Net change in locally-countable open roles across the whole run.
  rolesDelta: integer('roles_delta'),

  // The changelog: per-company count movements and the list of failed boards.
  // Shape is RefreshSummary in lib/refresh.ts; stored as jsonb so it can grow
  // (e.g. dead links, promoted companies) without a migration each time.
  summary: jsonb('summary'),
  // Populated only when the whole run failed (status 'error').
  error: text('error'),
}, (t) => ({
  // "Newest run of this kind" is the one hot query (freshness banner + admin),
  // so index the two columns it filters and orders by.
  kindStartedIdx: index('refresh_runs_kind_started_idx').on(t.kind, t.startedAt),
}));

export type RefreshRunRow = typeof refreshRuns.$inferSelect;
export type NewRefreshRunRow = typeof refreshRuns.$inferInsert;
