import { NextResponse } from 'next/server';

import { hasBearerSecret } from '@/lib/cron-auth';
import { db } from '@/lib/db';
import { getResumeSyncStatus, syncResumeProfile } from '@/lib/resume-sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function responseBody(status: Awaited<ReturnType<typeof getResumeSyncStatus>>) {
  return {
    state: status.state,
    connected: status.connected,
    checkedAt: status.checkedAt,
    syncedAt: status.syncedAt,
    requiresReconnect: status.requiresReconnect,
    usingLastKnownGood: status.usingLastKnownGood,
    failureKind: status.failureKind,
    error: status.error,
    source: {
      title: status.profile.source.title,
      url: status.profile.source.url,
      revision: status.profile.source.revisionId,
      syncedAt: status.profile.source.syncedAt,
    },
  };
}

export async function GET(request: Request) {
  try {
    const scheduled = hasBearerSecret(request, process.env.CRON_SECRET);
    const status = scheduled
      ? await syncResumeProfile(db, { force: true })
      : await getResumeSyncStatus(db);
    if (scheduled) console.log('[api/resume-sync] scheduled master PDF check finished:', status.state);
    return NextResponse.json(responseBody(status), {
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
    });
  } catch (error) {
    console.error('[api/resume-sync] status failed:', error);
    return NextResponse.json({ error: 'Resume sync status is temporarily unavailable.' }, {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}

export async function POST() {
  try {
    return NextResponse.json(responseBody(await syncResumeProfile(db)), {
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
    });
  } catch (error) {
    console.error('[api/resume-sync] retry failed:', error);
    return NextResponse.json({ error: 'Resume sync check is temporarily unavailable.' }, {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
