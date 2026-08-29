import type { GoogleDriveConnectionRow } from './db/schema';
import { googleOAuthClient, googleOAuthConfig } from './google-oauth';
import { decryptSecret } from './resume-crypto';

export async function getGoogleDriveAccessToken(connection: GoogleDriveConnectionRow): Promise<string> {
  const config = googleOAuthConfig();
  const oauth = googleOAuthClient(config);
  oauth.setCredentials({
    refresh_token: decryptSecret({
      ciphertext: connection.encryptedRefreshToken,
      iv: connection.tokenIv,
      authTag: connection.tokenAuthTag,
    }),
  });
  const accessToken = await oauth.getAccessToken();
  if (!accessToken.token) throw new Error('Google did not issue an access token');
  return accessToken.token;
}
