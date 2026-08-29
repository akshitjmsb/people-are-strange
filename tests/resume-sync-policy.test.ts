import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ResumeSyncFailure,
  checkedRecently,
  classifyResumeSyncFailure,
  retryableGoogleStatus,
  storedResumeSyncError,
  storedResumeSyncFailureKind,
} from '../lib/resume-sync-policy';

test('classifies revoked credentials as an authorization failure', () => {
  assert.equal(classifyResumeSyncFailure(new Error('invalid_grant: Token has been expired or revoked')), 'auth');
  assert.equal(classifyResumeSyncFailure(new ResumeSyncFailure('Google Docs returned 401', 'auth', 401)), 'auth');
  assert.equal(classifyResumeSyncFailure(new Error('Google Drive returned 403')), 'auth');
});

test('classifies retryable Google and network failures as transient', () => {
  assert.equal(classifyResumeSyncFailure(new Error('Google Docs returned 503')), 'transient');
  assert.equal(classifyResumeSyncFailure(new Error('Google Drive returned 429')), 'transient');
  assert.equal(classifyResumeSyncFailure(new Error('fetch failed')), 'transient');
  assert.equal(retryableGoogleStatus(429), true);
  assert.equal(retryableGoogleStatus(503), true);
  assert.equal(retryableGoogleStatus(404), false);
});

test('round-trips tagged failure kinds without exposing implementation details', () => {
  const stored = storedResumeSyncError('configuration', 'Google resume sync is not fully configured');
  assert.equal(storedResumeSyncFailureKind(stored), 'configuration');
});

test('preserves the file-selection-required state', () => {
  const stored = storedResumeSyncError('selection', 'Canonical master PDF selection is required');
  assert.equal(storedResumeSyncFailureKind(stored), 'selection');
});

test('throttles only valid recent checks', () => {
  const now = Date.parse('2026-08-28T17:00:00.000Z');
  assert.equal(checkedRecently('2026-08-28T16:59:30.000Z', now, 60_000), true);
  assert.equal(checkedRecently('2026-08-28T16:58:00.000Z', now, 60_000), false);
  assert.equal(checkedRecently('invalid', now, 60_000), false);
  assert.equal(checkedRecently('2026-08-28T17:01:00.000Z', now, 60_000), false);
});
