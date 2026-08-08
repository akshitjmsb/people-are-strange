import { eq } from 'drizzle-orm';

import {
  CANDIDATE_PROFILE,
  buildCandidateProfileFromResume,
  type CandidateProfile,
} from './candidate-profile';
import { db, type DB } from './db';
import { googleDriveConnections, resumeProfiles, type ResumeSyncStatus } from './db/schema';
import { googleOAuthClient, googleOAuthConfig } from './google-oauth';
import { decryptSecret } from './resume-crypto';

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

export type ResumeSyncState = 'current' | 'updated' | 'stale' | 'not_connected';

export interface ResumeSyncResult {
  state: ResumeSyncState;
  connected: boolean;
  profile: CandidateProfile;
  checkedAt: string | null;
  error?: string;
}

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
  return {
    state: connection ? (stored?.status === 'current' ? 'current' : 'stale') : 'not_connected',
    connected: Boolean(connection),
    profile: stored?.profile ?? CANDIDATE_PROFILE,
    checkedAt: stored?.checkedAt ?? null,
    ...(stored?.lastError ? { error: stored.lastError } : {}),
  };
}

/** Fetch PAS_Resume_MASTER and rebuild the profile only when its revision changed. */
export async function syncResumeProfile(database: DB = db): Promise<ResumeSyncResult> {
  const checkedAt = new Date().toISOString();
  const { connection, stored } = await currentRows(database);
  if (!connection) {
    return {
      state: 'not_connected',
      connected: false,
      profile: stored?.profile ?? CANDIDATE_PROFILE,
      checkedAt: stored?.checkedAt ?? null,
    };
  }

  try {
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
    const response = await fetch(
      `https://docs.googleapis.com/v1/documents/${encodeURIComponent(config.documentId)}?includeTabsContent=true`,
      {
        headers: { Authorization: `Bearer ${accessToken.token}` },
        cache: 'no-store',
      },
    );
    if (!response.ok) throw new Error(`Google Docs returned ${response.status}`);
    const document = await response.json() as GoogleDocument;
    if (!document.revisionId) throw new Error('Google Docs response did not include a revision ID');

    if (stored?.driveRevisionId === document.revisionId) {
      await database.update(resumeProfiles).set({
        status: 'current',
        checkedAt,
        lastError: null,
      }).where(eq(resumeProfiles.id, CONNECTION_ID));
      return { state: 'current', connected: true, profile: stored.profile, checkedAt };
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
    return { state: 'updated', connected: true, profile, checkedAt };
  } catch (error) {
    const message = safeError(error);
    console.error('[resume-sync] Google Doc sync failed:', message);
    if (stored) {
      await database.update(resumeProfiles).set({
        status: 'stale' satisfies ResumeSyncStatus,
        checkedAt,
        lastError: message,
      }).where(eq(resumeProfiles.id, CONNECTION_ID));
    }
    await database.update(googleDriveConnections).set({
      updatedAt: checkedAt,
      lastError: message,
    }).where(eq(googleDriveConnections.id, CONNECTION_ID));
    return {
      state: 'stale',
      connected: true,
      profile: stored?.profile ?? CANDIDATE_PROFILE,
      checkedAt,
      error: message,
    };
  }
}
