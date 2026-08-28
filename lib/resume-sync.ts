import { eq } from 'drizzle-orm';

import {
  CANDIDATE_PROFILE,
  CANDIDATE_PROFILE_PARSER_VERSION,
  buildCandidateProfileFromResume,
  type CandidateProfile,
} from './candidate-profile';
import { db, type DB } from './db';
import { googleDriveConnections, resumeProfiles, type ResumeSyncStatus } from './db/schema';
import { googleOAuthClient, googleOAuthConfig } from './google-oauth';
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

interface GoogleStructuralElement {
  paragraph?: { elements?: Array<{ textRun?: { content?: string } }> };
  table?: { tableRows?: Array<{ tableCells?: Array<{ content?: GoogleStructuralElement[] }> }> };
  tableOfContents?: { content?: GoogleStructuralElement[] };
}

interface GoogleDocumentTab {
  documentTab?: { body?: { content?: GoogleStructuralElement[] } };
  childTabs?: GoogleDocumentTab[];
}

interface GoogleDocument {
  title?: string;
  revisionId?: string;
  body?: { content?: GoogleStructuralElement[] };
  tabs?: GoogleDocumentTab[];
}

export type ResumeSyncState = 'current' | 'updated' | 'degraded' | 'reconnect_required' | 'not_connected';

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

function elementsText(elements: GoogleStructuralElement[] = []): string {
  const chunks: string[] = [];
  for (const element of elements) {
    if (element.paragraph) {
      chunks.push(...(element.paragraph.elements ?? []).map((part) => part.textRun?.content ?? ''));
    }
    if (element.table) {
      for (const row of element.table.tableRows ?? []) {
        for (const cell of row.tableCells ?? []) chunks.push(elementsText(cell.content));
      }
    }
    if (element.tableOfContents) chunks.push(elementsText(element.tableOfContents.content));
  }
  return chunks.join('');
}

function tabsText(tabs: GoogleDocumentTab[] = []): string {
  return tabs.flatMap((tab) => [
    elementsText(tab.documentTab?.body?.content),
    tabsText(tab.childTabs),
  ]).filter(Boolean).join('\n');
}

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
  const failureKind = storedResumeSyncFailureKind(stored?.lastError ?? connection?.lastError);
  const state: ResumeSyncState = !connection
    ? 'not_connected'
    : failureKind === 'auth'
      ? 'reconnect_required'
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
    usingLastKnownGood: state === 'degraded' || state === 'reconnect_required',
    ...(failureKind && state !== 'current'
      ? { failureKind, error: publicResumeSyncError(failureKind, Boolean(stored)) }
      : {}),
  };
}

/** Fetch the PAS resume sync mirror and rebuild the profile only when its revision changed. */
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

  const minimumIntervalMs = options.minimumIntervalMs ?? DEFAULT_MINIMUM_INTERVAL_MS;
  if (!options.force && checkedRecently(stored?.checkedAt, Date.now(), minimumIntervalMs)) {
    return getResumeSyncStatus(database);
  }

  try {
    const config = googleOAuthConfig();
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
    const response = await fetchGoogleDocument(config.documentId, accessToken.token);
    const document = await response.json() as GoogleDocument;
    if (!document.revisionId) throw new Error('Google Docs response did not include a revision ID');

    if (
      stored?.driveRevisionId === document.revisionId
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

    const text = tabsText(document.tabs) || elementsText(document.body?.content);
    if (text.trim().length < 100) throw new Error('Google Doc did not contain enough resume text');
    const profile = buildCandidateProfileFromResume(text, {
      title: document.title,
      documentId: config.documentId,
      revisionId: document.revisionId,
      syncedAt: checkedAt,
    });
    await database.insert(resumeProfiles).values({
      id: CONNECTION_ID,
      driveFileId: config.documentId,
      driveRevisionId: document.revisionId,
      profile,
      status: 'current',
      syncedAt: checkedAt,
      checkedAt,
      lastError: null,
    }).onConflictDoUpdate({
      target: resumeProfiles.id,
      set: {
        driveFileId: config.documentId,
        driveRevisionId: document.revisionId,
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
    console.error(`[resume-sync] Google Doc sync failed (${failureKind}):`, message);
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

async function fetchGoogleDocument(documentId: string, accessToken: string): Promise<Response> {
  const url = `https://docs.googleapis.com/v1/documents/${encodeURIComponent(documentId)}?includeTabsContent=true`;
  for (let attempt = 1; attempt <= GOOGLE_FETCH_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(GOOGLE_TIMEOUT_MS),
      });
      if (response.ok) return response;
      if ((response.status === 401 || response.status === 403)) {
        throw new ResumeSyncFailure(`Google Docs returned ${response.status}`, 'auth', response.status);
      }
      if (!retryableGoogleStatus(response.status) || attempt === GOOGLE_FETCH_ATTEMPTS) {
        throw new ResumeSyncFailure(
          `Google Docs returned ${response.status}`,
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
  throw new ResumeSyncFailure('Google Docs request exhausted retries', 'transient');
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
