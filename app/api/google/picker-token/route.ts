import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { googleDriveConnections } from '@/lib/db/schema';
import { getGoogleDriveAccessToken } from '@/lib/google-drive-access';
import { googleOAuthConfig, hasGoogleDriveFileScope } from '@/lib/google-oauth';
import { RESUME_PICKER_SESSION_COOKIE, verifyResumePickerSession } from '@/lib/resume-picker-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = verifyResumePickerSession(req.cookies.get(RESUME_PICKER_SESSION_COOKIE)?.value);
  if (!session) return failure('The secure file-selection session expired. Reconnect Google.', 401);

  const [connection] = await db.select().from(googleDriveConnections)
    .where(eq(googleDriveConnections.id, 'primary')).limit(1);
  if (!connection || connection.ownerEmail !== session.email || !hasGoogleDriveFileScope(connection.scopes)) {
    return failure('The secure Google connection could not be verified.', 401);
  }

  const developerKey = process.env.GOOGLE_PICKER_API_KEY;
  if (!developerKey) return failure('Google Picker is not configured. Add GOOGLE_PICKER_API_KEY and redeploy.', 503);

  try {
    const config = googleOAuthConfig();
    const appId = process.env.GOOGLE_PICKER_APP_ID ?? config.clientId.split('-')[0];
    const accessToken = await getGoogleDriveAccessToken(connection);
    return NextResponse.json({
      accessToken,
      developerKey,
      appId,
      expectedFileId: config.masterPdfFileId,
      expectedFileName: 'PAS_Resume_MASTER.pdf',
    }, { headers: noStoreHeaders() });
  } catch (error) {
    console.error('[google/picker-token] token minting failed:', error instanceof Error ? error.message : error);
    return failure('Google authorization needs to be renewed.', 401);
  }
}

function failure(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: noStoreHeaders() });
}

function noStoreHeaders() {
  return { 'Cache-Control': 'private, no-store, max-age=0' };
}
