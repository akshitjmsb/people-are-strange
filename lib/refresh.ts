// ── Data-refresh engine ──────────────────────────────────────────────────────
// The single place that knows how to bring the database's live signals back in
// sync with the world. Both entry points call in here so they can never drift:
//
//   • scripts/refresh-roles.ts  — CLI / GitHub Action (`npm run roles:refresh`)
//   • app/api/refresh/route.ts  — Vercel Cron + authenticated admin trigger
//
// Today it refreshes open-role counts from each company's ATS board. It is
// written so the next signals slot in beside it without reshaping anything:
//
//   • Link-rot   — scripts/check-links.ts already probes website/careers URLs;
//                  folding it in means a `refreshLinks()` that writes a dead-link
//                  flag and logs a run of kind 'links'.
//   • Closures   — a company that 404s everywhere and has an empty board for N
//                  runs is a closure candidate; the run log is where that signal
//                  would accumulate.
//   • Intake     — a staging/review queue of new companies would promote rows
//                  here and log a run of kind 'intake'.
//
// Each of those is a new function that fetches, diffs against the DB, writes,
// and appends a refresh_runs row — the same four beats as refreshRoles below.
//
// Design rules that keep "stale data breaks the system" from biting:
//   • A board that errors leaves its previous counts untouched. A week-old
//     number beats a blank company, and blanking on a transient 503 is exactly
//     how a "live" label starts lying.
//   • Every write is an UPDATE keyed by id — running twice is a no-op, never a
//     duplicate. The only row a run *adds* is its own entry in refresh_runs.
//   • The run is logged even when boards fail, so a slowly-rotting board is
//     visible in the history instead of silently freezing its counts.

import { randomUUID } from 'node:crypto';
import { and, desc, eq, notInArray } from 'drizzle-orm';

import type { DB } from './db';
import {
  companies,
  jobPostings,
  refreshRuns,
  type RefreshKind,
  type RefreshTrigger,
} from './db/schema';
import { bundledCompanies } from './companies';
import { getCity, CITY_IDS } from './cities';
import { fetchRoleCounts, type Posting } from './ats';
import type { CityId } from './city-config';

/** Concurrent board fetches. Boards are third-party hosts; a handful at a time
 *  is polite and still finishes ~200 companies well inside a function budget. */
const DEFAULT_CONCURRENCY = 4;

interface Counts {
  montreal: number;
  total: number;
}

/** One company whose count moved (or was fetched for the first time). This is
 *  the changelog the request asked for: "companies with updated counts", and
 *  the sign of `deltaMontreal` is the "roles found / roles closed" signal. It's
 *  count-level by design — we store counts, not individual postings, so we
 *  report movement rather than naming each role. Persisting postings for true
 *  per-role diffs is a future extension (a `postings` table), not needed to
 *  tell a job hunter whether a company is hiring more or less than last week. */
export interface RoleChange {
  id: string;
  name: string;
  city: CityId;
  /** Prior counts, or null when this is the first time we've fetched the board. */
  before: Counts | null;
  after: Counts;
  deltaMontreal: number;
  deltaTotal: number;
  firstFetch: boolean;
}

/** Persisted verbatim into refresh_runs.summary (jsonb). Kept small and stable:
 *  the movements that happened and the boards that didn't answer. */
export interface RefreshSummary {
  changes: RoleChange[];
  failures: { id: string; error: string }[];
  postingsSeen: number;
  postingsClosed: number;
}

export interface RefreshResult extends RefreshSummary {
  runId: string;
  kind: 'roles';
  status: 'ok' | 'partial' | 'error';
  trigger: RefreshTrigger;
  dryRun: boolean;
  startedAt: string;
  finishedAt: string;
  boardsTotal: number;
  boardsOk: number;
  boardsFailed: number;
  companiesRefreshed: number;
  postingsSeen: number;
  postingsClosed: number;
  /** Net movement in locally-countable open roles, across boards we have prior
   *  counts for (first fetches are excluded so a cold start doesn't read as a
   *  hiring spike). */
  rolesDelta: number;
}

export interface RefreshOptions {
  trigger: RefreshTrigger;
  /** Fetch and diff, but write nothing — no count updates, no run logged. */
  dryRun?: boolean;
  concurrency?: number;
}

interface Target {
  id: string;
  name: string;
  city: CityId;
  ats: NonNullable<ReturnType<typeof bundledCompanies>[number]['ats']>;
}

/** Every company across every city that carries an ATS board reference. The
 *  loop over CITY_IDS mirrors scripts/seed.ts: one deployment serves every
 *  city, so a refresh covers every city too. Each target keeps its own city so
 *  postings are graded against the right locality patterns. */
function collectTargets(): Target[] {
  const out: Target[] = [];
  for (const cityId of CITY_IDS) {
    for (const c of bundledCompanies(cityId)) {
      if (c.ats) out.push({ id: c.id, name: c.name, city: cityId, ats: c.ats });
    }
  }
  return out;
}

/** Current stored counts, keyed by id, so we can diff and report what moved.
 *  `null` counts (never fetched) map to a null entry — distinct from a real 0. */
async function readCurrentCounts(db: DB): Promise<Map<string, Counts | null>> {
  const rows = await db
    .select({
      id: companies.id,
      montreal: companies.openRolesMontreal,
      total: companies.openRolesTotal,
    })
    .from(companies);
  const map = new Map<string, Counts | null>();
  for (const r of rows) {
    map.set(
      r.id,
      r.montreal == null && r.total == null
        ? null
        : { montreal: r.montreal ?? 0, total: r.total ?? 0 },
    );
  }
  return map;
}

interface Fetched {
  target: Target;
  ok: boolean;
  counts?: Counts;
  postings?: Posting[];
  error?: string;
}

/** Fetch every target's board with a bounded worker pool. A board that throws
 *  is recorded as a failure and skipped on write — never fatal to the run. */
async function fetchAll(targets: Target[], concurrency: number): Promise<Fetched[]> {
  const results: Fetched[] = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, targets.length) }, async () => {
      while (cursor < targets.length) {
        const target = targets[cursor++];
        try {
          const { montreal, total, postings } = await fetchRoleCounts(getCity(target.city), target.ats);
          results.push({ target, ok: true, counts: { montreal, total }, postings });
        } catch (e) {
          results.push({ target, ok: false, error: e instanceof Error ? e.message : String(e) });
        }
      }
    }),
  );
  return results;
}

/**
 * Refresh live open-role counts for every company with an ATS board, diff the
 * result against what's stored, persist the changes, and log the run.
 *
 * Idempotent: writes are keyed UPDATEs, so a second run over unchanged boards
 * writes the same numbers and logs a run with an empty changelog. Failures are
 * isolated per board — the rest of the run still lands.
 */
export async function refreshRoles(db: DB, opts: RefreshOptions): Promise<RefreshResult> {
  const { trigger, dryRun = false, concurrency = DEFAULT_CONCURRENCY } = opts;
  const runId = randomUUID();
  const startedAt = new Date().toISOString();

  const targets = collectTargets();
  const current = await readCurrentCounts(db);
  const fetched = targets.length ? await fetchAll(targets, concurrency) : [];

  const changes: RoleChange[] = [];
  const failures: { id: string; error: string }[] = [];
  let rolesDelta = 0;

  for (const f of fetched) {
    if (!f.ok || !f.counts) {
      failures.push({ id: f.target.id, error: f.error ?? 'unknown error' });
      continue;
    }
    const before = current.get(f.target.id) ?? null;
    const after = f.counts;
    const deltaMontreal = after.montreal - (before?.montreal ?? 0);
    const deltaTotal = after.total - (before?.total ?? 0);
    const firstFetch = before === null;

    // Only a genuine movement (or a first-ever fetch) is worth logging; a board
    // that returned the same numbers isn't news.
    if (firstFetch || deltaMontreal !== 0 || deltaTotal !== 0) {
      changes.push({
        id: f.target.id,
        name: f.target.name,
        city: f.target.city,
        before,
        after,
        deltaMontreal,
        deltaTotal,
        firstFetch,
      });
    }
    if (!firstFetch) rolesDelta += deltaMontreal;
  }

  const boardsOk = fetched.filter((f) => f.ok).length;
  const boardsFailed = fetched.length - boardsOk;
  const status: RefreshResult['status'] =
    boardsFailed === 0 ? 'ok' : boardsOk === 0 ? 'error' : 'partial';

  let companiesRefreshed = 0;
  const postingsSeen = fetched.reduce(
    (total, item) => total + (item.ok ? item.postings?.length ?? 0 : 0),
    0,
  );
  let postingsClosed = 0;
  if (!dryRun) {
    const fetchedAt = new Date().toISOString();
    // Sequential, isolated writes: a single failed UPDATE can't roll back the
    // rest of the run's counts. There are a few hundred rows at most.
    for (const f of fetched) {
      if (!f.ok || !f.counts) continue; // keep whatever was there before
      try {
        await db
          .update(companies)
          .set({
            openRolesMontreal: f.counts.montreal,
            openRolesTotal: f.counts.total,
            rolesFetchedAt: fetchedAt,
          })
          .where(eq(companies.id, f.target.id));

        const seenIds: string[] = [];
        for (const posting of f.postings ?? []) {
          const id = `${f.target.id}:${f.target.ats.provider}:${posting.externalId}`;
          seenIds.push(id);
          await db
            .insert(jobPostings)
            .values({
              id,
              externalId: posting.externalId,
              companyId: f.target.id,
              city: f.target.city,
              provider: f.target.ats.provider,
              title: posting.title,
              location: posting.location,
              locality: posting.locality,
              url: posting.url,
              description: posting.description ?? null,
              department: posting.department ?? null,
              employmentType: posting.employmentType ?? null,
              workplaceType: posting.workplaceType ?? null,
              publishedAt: posting.publishedAt ?? null,
              firstSeenAt: fetchedAt,
              lastSeenAt: fetchedAt,
              closedAt: null,
              active: true,
            })
            .onConflictDoUpdate({
              target: jobPostings.id,
              set: {
                title: posting.title,
                location: posting.location,
                locality: posting.locality,
                url: posting.url,
                description: posting.description ?? null,
                department: posting.department ?? null,
                employmentType: posting.employmentType ?? null,
                workplaceType: posting.workplaceType ?? null,
                publishedAt: posting.publishedAt ?? null,
                lastSeenAt: fetchedAt,
                closedAt: null,
                active: true,
              },
            });
        }

        // Only close roles after this provider answered successfully. A board
        // outage never makes every job disappear. The company/provider scope
        // also prevents one board from closing another board's records.
        const closeScope = [
          eq(jobPostings.companyId, f.target.id),
          eq(jobPostings.provider, f.target.ats.provider),
          eq(jobPostings.active, true),
        ];
        const closed = await db
          .update(jobPostings)
          .set({ active: false, closedAt: fetchedAt })
          .where(and(...closeScope, ...(seenIds.length ? [notInArray(jobPostings.id, seenIds)] : [])))
          .returning({ id: jobPostings.id });
        postingsClosed += closed.length;
        companiesRefreshed++;
      } catch (e) {
        failures.push({
          id: f.target.id,
          error: `db write failed: ${e instanceof Error ? e.message : String(e)}`,
        });
      }
    }
  }

  const finishedAt = new Date().toISOString();

  const result: RefreshResult = {
    runId,
    kind: 'roles',
    status,
    trigger,
    dryRun,
    startedAt,
    finishedAt,
    boardsTotal: targets.length,
    boardsOk,
    boardsFailed,
    companiesRefreshed,
    postingsSeen,
    postingsClosed,
    rolesDelta,
    changes,
    failures,
  };

  if (!dryRun) {
    const summary: RefreshSummary = { changes, failures, postingsSeen, postingsClosed };
    await db.insert(refreshRuns).values({
      id: runId,
      kind: 'roles',
      status,
      trigger,
      startedAt,
      finishedAt,
      companiesRefreshed,
      boardsOk,
      boardsFailed,
      rolesDelta,
      summary,
      error: status === 'error' ? `all ${boardsFailed} boards failed` : null,
    });
  }

  return result;
}

/** The most recent run of a given kind — the app's answer to "when was this
 *  data last updated?". Null before the first run has ever completed. Safe to
 *  call unauthenticated: it reads the run log, never the boards. */
export async function latestRun(db: DB, kind: RefreshKind = 'roles') {
  const [row] = await db
    .select()
    .from(refreshRuns)
    .where(eq(refreshRuns.kind, kind))
    .orderBy(desc(refreshRuns.startedAt))
    .limit(1);
  return row ?? null;
}
