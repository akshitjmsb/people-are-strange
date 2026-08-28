export type ResumeSyncFailureKind = 'auth' | 'transient' | 'configuration' | 'source';

const STORED_ERROR = /^\[(auth|transient|configuration|source)\]\s*/i;

export class ResumeSyncFailure extends Error {
  constructor(
    message: string,
    readonly kind: ResumeSyncFailureKind,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ResumeSyncFailure';
  }
}

export function classifyResumeSyncFailure(error: unknown): ResumeSyncFailureKind {
  if (error instanceof ResumeSyncFailure) return error.kind;
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  if (
    message.includes('invalid_grant')
    || message.includes('invalid_client')
    || message.includes('unauthorized_client')
    || message.includes('token has been expired or revoked')
    || message.includes('google docs returned 401')
    || message.includes('google docs returned 403')
  ) return 'auth';
  if (
    message.includes('timeout')
    || message.includes('aborted')
    || message.includes('fetch failed')
    || message.includes('network')
    || /google docs returned (429|5\d\d)/.test(message)
  ) return 'transient';
  if (
    message.includes('not fully configured')
    || message.includes('encryption')
    || message.includes('decrypt')
  ) return 'configuration';
  return 'source';
}

export function publicResumeSyncError(kind: ResumeSyncFailureKind, hasLastKnownGood = true): string {
  const retained = hasLastKnownGood
    ? ' Your last synced resume remains active.'
    : ' PAS will retry without replacing the built-in matching profile.';
  switch (kind) {
    case 'auth':
      return `Google authorization needs to be renewed.${retained}`;
    case 'transient':
      return `Google is temporarily unavailable.${retained}`;
    case 'configuration':
      return `Resume sync configuration needs attention.${retained}`;
    case 'source':
      return `PAS could not read a valid resume revision.${retained}`;
  }
}

export function storedResumeSyncError(kind: ResumeSyncFailureKind, message: string): string {
  return `[${kind}] ${message}`.slice(0, 500);
}

export function storedResumeSyncFailureKind(message: string | null | undefined): ResumeSyncFailureKind | null {
  if (!message) return null;
  const tagged = message.match(STORED_ERROR)?.[1]?.toLowerCase() as ResumeSyncFailureKind | undefined;
  return tagged ?? classifyResumeSyncFailure(message);
}

export function checkedRecently(
  checkedAt: string | null | undefined,
  nowMs: number,
  minimumIntervalMs: number,
): boolean {
  if (!checkedAt) return false;
  const checkedMs = Date.parse(checkedAt);
  return Number.isFinite(checkedMs) && nowMs - checkedMs >= 0 && nowMs - checkedMs < minimumIntervalMs;
}

export function retryableGoogleStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}
