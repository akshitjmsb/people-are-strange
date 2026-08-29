import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { googleDriveConnections, resumeProfiles } from '@/lib/db/schema';
import { googleOAuthConfig, hasGoogleDriveFileScope } from '@/lib/google-oauth';
import { RESUME_PICKER_SESSION_COOKIE, verifyResumePickerSession } from '@/lib/resume-picker-session';
import { syncResumeProfile } from '@/lib/resume-sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = verifyResumePickerSession(req.cookies.get(RESUME_PICKER_SESSION_COOKIE)?.value);
  if (!session) return failure('The secure file-selection session expired. Reconnect Google.', 401);

  let fileId: unknown;
  try {
    ({ fileId } = await req.json() as { fileId?: unknown });
  } catch {
    return failure('Invalid file selection.', 400);
  }
  const config = googleOAuthConfig(req.nextUrl.origin);
  if (fileId !== config.masterPdfFileId) {
    return failure('Select PAS_Resume_MASTER.pdf. PAS rejects every other Drive file.', 400);
  }

  const [connection] = await db.select().from(googleDriveConnections)
    .where(eq(googleDriveConnections.id, 'primary')).limit(1);
  if (!connection || connection.ownerEmail !== session.email || !hasGoogleDriveFileScope(connection.scopes)) {
    return failure('The secure Google connection could not be verified.', 401);
  }

  const now = new Date().toISOString();
  await Promise.all([
    db.update(googleDriveConnections).set({ updatedAt: now, lastError: null })
      .where(eq(googleDriveConnections.id, 'primary')),
    db.update(resumeProfiles).set({ lastError: null })
      .where(eq(resumeProfiles.id, 'primary')),
  ]);
  const sync = await syncResumeProfile(db, { force: true });
  if (sync.state !== 'current' && sync.state !== 'updated') {
    return failure(sync.error ?? 'PAS could not verify the selected master PDF.', 422);
  }

  const response = NextResponse.json({ state: sync.state }, { headers: noStoreHeaders() });
  response.cookies.delete(RESUME_PICKER_SESSION_COOKIE);
  return response;
}

function failure(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStoreHeaders() });
}

function noStoreHeaders() {
  return { 'Cache-Control': 'private, no-store, max-age=0' };
}
