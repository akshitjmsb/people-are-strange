import { OAuth2Client } from 'google-auth-library';

export const GOOGLE_DOCS_READ_SCOPE = 'https://www.googleapis.com/auth/documents.readonly';
export const GOOGLE_OAUTH_SCOPES = ['openid', 'email', GOOGLE_DOCS_READ_SCOPE] as const;
export const GOOGLE_OAUTH_STATE_COOKIE = 'pas_google_oauth_state';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  ownerEmail: string;
  documentId: string;
  redirectUri: string;
}

export function googleOAuthConfig(origin?: string): GoogleOAuthConfig {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const ownerEmail = process.env.RESUME_OWNER_EMAIL;
  const documentId = process.env.PAS_RESUME_DOCUMENT_ID
    ?? '1Sz8ZeQ3tq2q1SOKLq2Zt5NLqlLOHxlZoYioQ2DoDhPc';
  const deploymentOrigin = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI
    ?? (origin ? `${origin}/api/google/callback` : undefined)
    ?? (deploymentOrigin ? `${deploymentOrigin}/api/google/callback` : undefined)
    ?? (process.env.NODE_ENV !== 'production' ? 'http://localhost:3000/api/google/callback' : undefined);

  if (!clientId || !clientSecret || !ownerEmail || !redirectUri) {
    throw new Error('Google resume sync is not fully configured');
  }
  return { clientId, clientSecret, ownerEmail: ownerEmail.trim().toLowerCase(), documentId, redirectUri };
}

export function googleOAuthClient(config: GoogleOAuthConfig): OAuth2Client {
  return new OAuth2Client(config.clientId, config.clientSecret, config.redirectUri);
}

export function googleResumeSyncConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID
    && process.env.GOOGLE_OAUTH_CLIENT_SECRET
    && process.env.RESUME_OWNER_EMAIL
    && process.env.RESUME_TOKEN_ENCRYPTION_KEY,
  );
}
