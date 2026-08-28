import { NextResponse } from 'next/server';

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
  };
}

export async function GET() {
  try {
    return NextResponse.json(responseBody(await getResumeSyncStatus(db)), {
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
