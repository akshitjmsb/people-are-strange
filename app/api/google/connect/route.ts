import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

import {
  GOOGLE_OAUTH_SCOPES,
  GOOGLE_OAUTH_STATE_COOKIE,
  googleOAuthClient,
  googleOAuthConfig,
} from '@/lib/google-oauth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const config = googleOAuthConfig(req.nextUrl.origin);
    const callbackOrigin = new URL(config.redirectUri).origin;
    if (req.nextUrl.origin !== callbackOrigin) {
      return NextResponse.redirect(new URL('/api/google/connect', callbackOrigin), {
        headers: { 'Cache-Control': 'no-store' },
      });
    }
    const state = randomBytes(32).toString('base64url');
    const authUrl = googleOAuthClient(config).generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent select_account',
      scope: [...GOOGLE_OAUTH_SCOPES],
      state,
      include_granted_scopes: true,
    });
    const response = NextResponse.redirect(authUrl);
    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: new URL(config.redirectUri).protocol === 'https:',
      path: '/',
      maxAge: 15 * 60,
      priority: 'high',
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    console.error('[google/connect] OAuth setup failed:', error instanceof Error ? error.message : error);
    return NextResponse.redirect(new URL('/settings/resume?error=missing_config', req.url));
  }
}
