import { OAuth2Client } from 'google-auth-library';

export const GOOGLE_DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
export const GOOGLE_OAUTH_SCOPES = ['openid', 'email', GOOGLE_DRIVE_FILE_SCOPE] as const;
export const GOOGLE_OAUTH_STATE_COOKIE = 'pas_google_oauth_state';
export const PAS_RESUME_MASTER_PDF_ID = '1kYGzulxSB2IzTGVUNvkZLWY8cSP-aCne';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  ownerEmail: string;
  masterPdfFileId: string;
  redirectUri: string;
}

export function googleOAuthConfig(origin?: string): GoogleOAuthConfig {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const ownerEmail = process.env.RESUME_OWNER_EMAIL;
  const masterPdfFileId = process.env.PAS_RESUME_MASTER_PDF_ID
    ?? PAS_RESUME_MASTER_PDF_ID;
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
  return {
    clientId,
    clientSecret,
    ownerEmail: ownerEmail.trim().toLowerCase(),
    masterPdfFileId,
    redirectUri,
  };
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

export function hasGoogleDriveFileScope(scopes: readonly string[]): boolean {
  return scopes.includes(GOOGLE_DRIVE_FILE_SCOPE);
}
