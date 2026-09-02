import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * A Google OAuth client ID is public configuration. Gmail access tokens stay
 * in the browser and are never sent to this route or any other PAS endpoint.
 */
export async function GET() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'Google browser authorization is not configured.' }, {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  return NextResponse.json({ clientId }, {
    headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
  });
}
