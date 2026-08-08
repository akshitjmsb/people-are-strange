import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { refreshRoles, latestRun } from '@/lib/refresh';
import type { RefreshRunRow } from '@/lib/db/schema';
import { syncResumeProfile } from '@/lib/resume-sync';

// ── Refresh endpoint ─────────────────────────────────────────────────────────
// The Vercel-native door to the refresh engine (lib/refresh.ts). Two callers:
//
//   • Vercel Cron  — the daily job in vercel.json hits GET /api/refresh with
//     `Authorization: Bearer $CRON_SECRET` (Vercel injects it automatically
//     when CRON_SECRET is set on the project).
//   • Admin        — a human runs the same refresh on demand with the same
//     bearer token, via GET or POST.
//
// An *unauthenticated* GET is not an error: it returns the freshness summary
// (when the data was last refreshed and how it went), which is public and
// read-only. That's the endpoint the app can poll to tell job hunters how
// current the numbers are. Only the mutation is gated.
//
// The GitHub Action path (scripts/refresh-roles.ts) still exists and runs the
// same engine; this endpoint is the platform-native equivalent, not a
// replacement — nothing about the static-data + seed.ts baseline changes.

// Node runtime: the engine uses node:crypto and the Neon serverless driver.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Scraping a couple hundred third-party boards can take a while; give it room
// well beyond the default. Also pinned in vercel.json for the deployed function.
export const maxDuration = 300;

// The cron runs daily. After 36 hours, at least one refresh was missed — worth
// flagging rather than quietly presenting aging job postings as current.
const STALE_AFTER_MS = 36 * 60 * 60 * 1000;

/** Constant-time bearer check against CRON_SECRET (Vercel's cron convention),
 *  falling back to REFRESH_SECRET for a human-held admin token. With neither
 *  configured we refuse to mutate rather than defaulting open — an unprotected
 *  refresh trigger is a free way to hammer every board on the internet. */
function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET ?? process.env.REFRESH_SECRET;
  if (!secret) return false;
  const header = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Shape the app consumes to render a "data last updated …" line. */
function freshnessBody(run: RefreshRunRow | null) {
  if (!run) return { refreshed: false as const };
  const at = run.finishedAt ?? run.startedAt;
  const ageMs = Date.now() - new Date(at).getTime();
  return {
    refreshed: true as const,
    kind: run.kind,
    status: run.status,
    trigger: run.trigger,
    lastRefreshed: at,
    ageSeconds: Math.round(ageMs / 1000),
    stale: ageMs > STALE_AFTER_MS,
    companiesRefreshed: run.companiesRefreshed,
    boardsOk: run.boardsOk,
    boardsFailed: run.boardsFailed,
    rolesDelta: run.rolesDelta,
  };
}

/** Run the refresh and shape the response. `?dry=1` fetches and diffs without
 *  writing — handy for verifying auth and board health without touching data. */
async function runRefresh(req: Request, trigger: 'cron' | 'manual') {
  const dryRun = new URL(req.url).searchParams.get('dry') === '1';
  try {
    const [result, resume] = await Promise.all([
      refreshRoles(db, { trigger, dryRun }),
      syncResumeProfile(db),
    ]);
    // A run where every board failed is a real failure, even though it was
    // handled — surface it as 500 so a cron alert can catch a total outage.
    const httpStatus = result.status === 'error' ? 500 : 200;
    return NextResponse.json({ ...result, resumeSync: resume }, {
      status: httpStatus,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[api/refresh] refresh failed:', err);
    return NextResponse.json(
      { error: 'refresh failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

// Vercel Cron and the admin GET trigger both land here. Without a valid bearer
// this is the public freshness read — never a mutation.
export async function GET(req: Request) {
  if (isAuthorized(req)) return runRefresh(req, 'cron');

  try {
    return NextResponse.json(freshnessBody(await latestRun(db)), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[api/refresh] freshness read failed:', err);
    return NextResponse.json({ error: 'freshness unavailable' }, { status: 503 });
  }
}

// Explicit mutation verb for the admin trigger. Always requires the bearer.
export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return runRefresh(req, 'manual');
}
