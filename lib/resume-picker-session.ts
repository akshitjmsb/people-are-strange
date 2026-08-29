import { createHmac, timingSafeEqual } from 'node:crypto';

export const RESUME_PICKER_SESSION_COOKIE = 'pas_resume_picker_session';
export const RESUME_PICKER_SESSION_MAX_AGE_SECONDS = 10 * 60;

interface PickerSession {
  email: string;
  expiresAt: number;
}

function signingKey(): string {
  const key = process.env.RESUME_TOKEN_ENCRYPTION_KEY;
  if (!key) throw new Error('Resume picker session signing is not configured');
  return key;
}

function signature(payload: string): string {
  return createHmac('sha256', signingKey()).update(payload).digest('base64url');
}

export function createResumePickerSession(email: string, nowMs = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({
    email: email.trim().toLowerCase(),
    expiresAt: nowMs + RESUME_PICKER_SESSION_MAX_AGE_SECONDS * 1000,
  } satisfies PickerSession)).toString('base64url');
  return `${payload}.${signature(payload)}`;
}

export function verifyResumePickerSession(value: string | undefined, nowMs = Date.now()): PickerSession | null {
  if (!value) return null;
  const [payload, suppliedSignature, extra] = value.split('.');
  if (!payload || !suppliedSignature || extra) return null;
  const expected = Buffer.from(signature(payload));
  const supplied = Buffer.from(suppliedSignature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<PickerSession>;
    if (typeof parsed.email !== 'string' || typeof parsed.expiresAt !== 'number' || parsed.expiresAt <= nowMs) return null;
    return { email: parsed.email.trim().toLowerCase(), expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}
