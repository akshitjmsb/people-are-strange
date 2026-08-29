import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createResumePickerSession,
  verifyResumePickerSession,
} from '../lib/resume-picker-session';

test('accepts a valid short-lived picker session', () => {
  process.env.RESUME_TOKEN_ENCRYPTION_KEY = 'test-only-picker-session-key';
  const now = Date.parse('2026-08-29T12:00:00.000Z');
  const token = createResumePickerSession('Owner@Example.com', now);
  assert.deepEqual(verifyResumePickerSession(token, now + 60_000)?.email, 'owner@example.com');
});

test('rejects tampered and expired picker sessions', () => {
  process.env.RESUME_TOKEN_ENCRYPTION_KEY = 'test-only-picker-session-key';
  const now = Date.parse('2026-08-29T12:00:00.000Z');
  const token = createResumePickerSession('owner@example.com', now);
  assert.equal(verifyResumePickerSession(`${token}x`, now), null);
  assert.equal(verifyResumePickerSession(token, now + 11 * 60_000), null);
});
