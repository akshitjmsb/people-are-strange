import assert from 'node:assert/strict';
import test from 'node:test';

import { GOOGLE_DRIVE_FILE_SCOPE, hasGoogleDriveFileScope } from '../lib/google-oauth';

test('accepts only the file-scoped Drive permission', () => {
  assert.equal(hasGoogleDriveFileScope([GOOGLE_DRIVE_FILE_SCOPE]), true);
  assert.equal(hasGoogleDriveFileScope(['https://www.googleapis.com/auth/drive.readonly']), false);
  assert.equal(hasGoogleDriveFileScope(['https://www.googleapis.com/auth/documents.readonly']), false);
});
