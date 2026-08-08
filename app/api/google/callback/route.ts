import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { googleDriveConnections } from '@/lib/db/schema';
import {
  GOOGLE_OAUTH_SCOPES,
  GOOGLE_OAUTH_STATE_COOKIE,
  googleOAuthClient,
  googleOAuthConfig,
} from '@/lib/google-oauth';
import { encryptSecret } from '@/lib/resume-crypto';
import { syncResumeProfile } from '@/lib/resume-sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function matchesState(expected: string | undefined, actual: string | null): boolean {
  if (!expected || !actual) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(actual);
  return a.length === b.length && timingSafeEqual(a, b);
}

function finish(req: NextRequest, query: string) {
  const response = NextResponse.redirect(new URL(`/settings/resume?${query}`, req.url));
  response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
  return response;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const expectedState = req.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  if (!code || !matchesState(expectedState, state)) return finish(req, 'error=invalid_state');

  try {
    const config = googleOAuthConfig(req.nextUrl.origin);
    const oauth = googleOAuthClient(config);
    const { tokens } = await oauth.getToken(code);
    if (!tokens.refresh_token || !tokens.access_token) {
      return finish(req, 'error=missing_refresh_token');
    }

    const userResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
      cache: 'no-store',
    });
    if (!userResponse.ok) return finish(req, 'error=identity_check_failed');
    const user = await userResponse.json() as { email?: string; email_verified?: boolean };
    const email = user.email?.trim().toLowerCase();
    if (!email || user.email_verified === false || email !== config.ownerEmail) {
      await oauth.revokeToken(tokens.access_token).catch(() => undefined);
      return finish(req, 'error=wrong_account');
    }

    const now = new Date().toISOString();
    const encrypted = encryptSecret(tokens.refresh_token);
    const scopes = tokens.scope?.split(/\s+/).filter(Boolean) ?? [...GOOGLE_OAUTH_SCOPES];
    const [savedConnection] = await db.insert(googleDriveConnections).values({
      id: 'primary',
      ownerEmail: email,
      encryptedRefreshToken: encrypted.ciphertext,
      tokenIv: encrypted.iv,
      tokenAuthTag: encrypted.authTag,
      scopes,
      connectedAt: now,
      updatedAt: now,
      lastError: null,
    }).onConflictDoUpdate({
      target: googleDriveConnections.id,
      set: {
        ownerEmail: email,
        encryptedRefreshToken: encrypted.ciphertext,
        tokenIv: encrypted.iv,
        tokenAuthTag: encrypted.authTag,
        scopes,
        updatedAt: now,
        lastError: null,
      },
    }).returning({ id: googleDriveConnections.id });
    if (!savedConnection) throw new Error('Google connection was not persisted');
    console.log('[google/callback] encrypted Google connection persisted');

    const sync = await syncResumeProfile(db);
    console.log('[google/callback] initial resume sync finished:', sync.state);
    return finish(
      req,
      sync.state === 'current' || sync.state === 'updated'
        ? 'connected=1'
        : 'error=sync_failed',
    );
  } catch (error) {
    console.error('[google/callback] OAuth callback failed:', error instanceof Error ? error.message : error);
    return finish(req, 'error=callback_failed');
  }
}
