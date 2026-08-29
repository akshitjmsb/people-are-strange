import { eq } from 'drizzle-orm';

import {
  CANDIDATE_PROFILE,
  CANDIDATE_PROFILE_PARSER_VERSION,
  buildCandidateProfileFromResume,
  type CandidateProfile,
} from './candidate-profile';
import { db, type DB } from './db';
import { googleDriveConnections, resumeProfiles, type ResumeSyncStatus } from './db/schema';
import {
  googleOAuthClient,
  googleOAuthConfig,
  hasGoogleDriveFileScope,
} from './google-oauth';
import { extractResumePdfText, masterPdfRevision, validateResumePdf } from './pdf-resume';
import { decryptSecret } from './resume-crypto';
import {
  ResumeSyncFailure,
  checkedRecently,
  classifyResumeSyncFailure,
  publicResumeSyncError,
  retryableGoogleStatus,
  storedResumeSyncError,
  storedResumeSyncFailureKind,
  type ResumeSyncFailureKind,
} from './resume-sync-policy';

const CONNECTION_ID = 'primary';

interface GoogleDriveFile {
  id?: string;
  name?: string;
  mimeType?: string;
  modifiedTime?: string;
  md5Checksum?: string;
  size?: string;
  trashed?: boolean;
}

export type ResumeSyncState = 'current' | 'updated' | 'degraded' | 'selection_required' | 'reconnect_required' | 'not_connected';

export interface ResumeSyncResult {
  state: ResumeSyncState;
  connected: boolean;
  profile: CandidateProfile;
  checkedAt: string | null;
  syncedAt: string | null;
  requiresReconnect: boolean;
  usingLastKnownGood: boolean;
  failureKind?: ResumeSyncFailureKind;
  error?: string;
}

export interface ResumeSyncOptions {
  force?: boolean;
  minimumIntervalMs?: number;
}

const DEFAULT_MINIMUM_INTERVAL_MS = 60_000;
const GOOGLE_TIMEOUT_MS = 12_000;
const GOOGLE_FETCH_ATTEMPTS = 3;
let syncInFlight: Promise<ResumeSyncResult> | null = null;

function safeError(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 500);
  return String(error).slice(0, 500);
}

async function currentRows(database: DB) {
  const [[connection], [stored]] = await Promise.all([
    database.select().from(googleDriveConnections).where(eq(googleDriveConnections.id, CONNECTION_ID)).limit(1),
    database.select().from(resumeProfiles).where(eq(resumeProfiles.id, CONNECTION_ID)).limit(1),
  ]);
  return { connection, stored };
}

export async function getResumeSyncStatus(database: DB = db): Promise<ResumeSyncResult> {
  const { connection, stored } = await currentRows(database);
  const missingPdfPermission = Boolean(connection && !hasGoogleDriveFileScope(connection.scopes));
  const connectionFailureKind = storedResumeSyncFailureKind(connection?.lastError);
  const failureKind = missingPdfPermission
    ? 'auth'
    : connectionFailureKind === 'selection'
      ? 'selection'
    : storedResumeSyncFailureKind(stored?.lastError ?? connection?.lastError);
  const state: ResumeSyncState = !connection
    ? 'not_connected'
    : failureKind === 'auth'
      ? 'reconnect_required'
      : failureKind === 'selection'
        ? 'selection_required'
      : stored?.status === 'current'
        ? 'current'
        : 'degraded';
  return {
    state,
    connected: Boolean(connection),
    profile: stored?.profile ?? CANDIDATE_PROFILE,
    checkedAt: stored?.checkedAt ?? null,
    syncedAt: stored?.syncedAt ?? null,
    requiresReconnect: state === 'reconnect_required',
    usingLastKnownGood: state === 'degraded' || state === 'reconnect_required' || state === 'selection_required',
    ...(failureKind && state !== 'current'
      ? {
          failureKind,
          error: missingPdfPermission
            ? 'Reconnect Google once to let PAS read the canonical master PDF. Your last synced profile remains active.'
            : publicResumeSyncError(failureKind, Boolean(stored)),
        }
      : {}),
  };
}

/** Fetch PAS_Resume_MASTER.pdf and rebuild the profile only when its checksum changed. */
export async function syncResumeProfile(
  database: DB = db,
  options: ResumeSyncOptions = {},
): Promise<ResumeSyncResult> {
  if (syncInFlight) return syncInFlight;
  const operation = runResumeSync(database, options);
  syncInFlight = operation;
  try {
    return await operation;
  } finally {
    if (syncInFlight === operation) syncInFlight = null;
  }
}

async function runResumeSync(database: DB, options: ResumeSyncOptions): Promise<ResumeSyncResult> {
  const checkedAt = new Date().toISOString();
  const { connection, stored } = await currentRows(database);
  if (!connection) {
    return {
      state: 'not_connected',
      connected: false,
      profile: stored?.profile ?? CANDIDATE_PROFILE,
      checkedAt: stored?.checkedAt ?? null,
      syncedAt: stored?.syncedAt ?? null,
      requiresReconnect: false,
      usingLastKnownGood: Boolean(stored),
    };
  }

  if (storedResumeSyncFailureKind(connection.lastError) === 'selection') {
    return getResumeSyncStatus(database);
  }

  const minimumIntervalMs = options.minimumIntervalMs ?? DEFAULT_MINIMUM_INTERVAL_MS;
  if (!options.force && checkedRecently(stored?.checkedAt, Date.now(), minimumIntervalMs)) {
    return getResumeSyncStatus(database);
  }

  try {
    const config = googleOAuthConfig();
    if (!hasGoogleDriveFileScope(connection.scopes)) {
      throw new ResumeSyncFailure('Google Drive file permission is required for the selected master PDF', 'auth');
    }
    const oauth = googleOAuthClient(config);
    let refreshToken: string;
    try {
      refreshToken = decryptSecret({
        ciphertext: connection.encryptedRefreshToken,
        iv: connection.tokenIv,
        authTag: connection.tokenAuthTag,
      });
    } catch {
      throw new ResumeSyncFailure('Stored Google token could not be decrypted', 'configuration');
    }
    oauth.setCredentials({ refresh_token: refreshToken });

    const accessToken = await withTimeout(
      oauth.getAccessToken(),
      GOOGLE_TIMEOUT_MS,
      'Google access-token request timed out',
    );
    if (!accessToken.token) throw new Error('Google did not issue an access token');
    const metadataResponse = await fetchGoogleDrive(
      `${encodeURIComponent(config.masterPdfFileId)}?fields=id,name,mimeType,modifiedTime,md5Checksum,size,trashed&supportsAllDrives=true`,
      accessToken.token,
    );
    const masterPdf = await metadataResponse.json() as GoogleDriveFile;
    validateMasterPdfMetadata(masterPdf, config.masterPdfFileId);
    const revisionId = masterPdfRevision(masterPdf);

    if (
      stored?.driveFileId === config.masterPdfFileId
      && stored.driveRevisionId === revisionId
      && stored.profile.source.parserVersion === CANDIDATE_PROFILE_PARSER_VERSION
    ) {
      await database.update(resumeProfiles).set({
        status: 'current',
        checkedAt,
        lastError: null,
      }).where(eq(resumeProfiles.id, CONNECTION_ID));
      await database.update(googleDriveConnections).set({
        updatedAt: checkedAt,
        lastError: null,
      }).where(eq(googleDriveConnections.id, CONNECTION_ID));
      return {
        state: 'current',
        connected: true,
        profile: stored.profile,
        checkedAt,
        syncedAt: stored.syncedAt,
        requiresReconnect: false,
        usingLastKnownGood: false,
      };
    }

    const pdfResponse = await fetchGoogleDrive(
      `${encodeURIComponent(config.masterPdfFileId)}?alt=media&supportsAllDrives=true`,
      accessToken.token,
    );
    const declaredSize = masterPdf.size ? Number.parseInt(masterPdf.size, 10) : undefined;
    const pdfBytes = validateResumePdf(await pdfResponse.arrayBuffer(), declaredSize);
    const text = await extractResumePdfText(pdfBytes);
    const profile = buildCandidateProfileFromResume(text, {
      title: masterPdf.name,
      fileId: config.masterPdfFileId,
      revisionId,
      syncedAt: checkedAt,
    });
    await database.insert(resumeProfiles).values({
      id: CONNECTION_ID,
      driveFileId: config.masterPdfFileId,
      driveRevisionId: revisionId,
      profile,
      status: 'current',
      syncedAt: checkedAt,
      checkedAt,
      lastError: null,
    }).onConflictDoUpdate({
      target: resumeProfiles.id,
      set: {
        driveFileId: config.masterPdfFileId,
        driveRevisionId: revisionId,
        profile,
        status: 'current',
        syncedAt: checkedAt,
        checkedAt,
        lastError: null,
      },
    });
    await database.update(googleDriveConnections).set({
      updatedAt: checkedAt,
      lastError: null,
    }).where(eq(googleDriveConnections.id, CONNECTION_ID));
    return {
      state: 'updated',
      connected: true,
      profile,
      checkedAt,
      syncedAt: checkedAt,
      requiresReconnect: false,
      usingLastKnownGood: false,
    };
  } catch (error) {
    const message = safeError(error);
    const failureKind = classifyResumeSyncFailure(error);
    const storedError = storedResumeSyncError(failureKind, message);
    console.error(`[resume-sync] master PDF sync failed (${failureKind}):`, message);
    if (stored) {
      await database.update(resumeProfiles).set({
        status: 'stale' satisfies ResumeSyncStatus,
        checkedAt,
        lastError: storedError,
      }).where(eq(resumeProfiles.id, CONNECTION_ID));
    }
    await database.update(googleDriveConnections).set({
      updatedAt: checkedAt,
      lastError: storedError,
    }).where(eq(googleDriveConnections.id, CONNECTION_ID));
    return {
      state: failureKind === 'auth' ? 'reconnect_required' : 'degraded',
      connected: true,
      profile: stored?.profile ?? CANDIDATE_PROFILE,
      checkedAt,
      syncedAt: stored?.syncedAt ?? null,
      requiresReconnect: failureKind === 'auth',
      usingLastKnownGood: Boolean(stored),
      failureKind,
      error: publicResumeSyncError(failureKind, Boolean(stored)),
    };
  }
}

async function fetchGoogleDrive(path: string, accessToken: string): Promise<Response> {
  const url = `https://www.googleapis.com/drive/v3/files/${path}`;
  for (let attempt = 1; attempt <= GOOGLE_FETCH_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(GOOGLE_TIMEOUT_MS),
      });
      if (response.ok) return response;
      if ((response.status === 401 || response.status === 403)) {
        throw new ResumeSyncFailure(`Google Drive returned ${response.status}`, 'auth', response.status);
      }
      if (!retryableGoogleStatus(response.status) || attempt === GOOGLE_FETCH_ATTEMPTS) {
        throw new ResumeSyncFailure(
          `Google Drive returned ${response.status}`,
          retryableGoogleStatus(response.status) ? 'transient' : 'source',
          response.status,
        );
      }
    } catch (error) {
      if (error instanceof ResumeSyncFailure && error.kind !== 'transient') throw error;
      if (attempt === GOOGLE_FETCH_ATTEMPTS) {
        throw error instanceof ResumeSyncFailure
          ? error
          : new ResumeSyncFailure(safeError(error), 'transient');
      }
    }
    await delay(250 * attempt);
  }
  throw new ResumeSyncFailure('Google Drive request exhausted retries', 'transient');
}

function validateMasterPdfMetadata(file: GoogleDriveFile, expectedId: string): void {
  if (file.id !== expectedId) throw new Error('Google Drive returned the wrong master resume file');
  if (file.trashed) throw new Error('Master resume PDF is in Google Drive trash');
  if (file.mimeType !== 'application/pdf') throw new Error('Canonical master resume is not a PDF');
  if (file.name !== 'PAS_Resume_MASTER.pdf') throw new Error('Canonical master resume has an unexpected filename');
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => reject(new ResumeSyncFailure(message, 'transient')), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
