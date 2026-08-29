import assert from 'node:assert/strict';
import test from 'node:test';

import { hasBearerSecret } from '../lib/cron-auth';

test('accepts only the exact configured cron bearer secret', () => {
  const authorized = new Request('https://pas.example/api/resume-sync', {
    headers: { authorization: 'Bearer correct-secret' },
  });
  const wrong = new Request('https://pas.example/api/resume-sync', {
    headers: { authorization: 'Bearer wrong-secret' },
  });
  const missing = new Request('https://pas.example/api/resume-sync');

  assert.equal(hasBearerSecret(authorized, 'correct-secret'), true);
  assert.equal(hasBearerSecret(wrong, 'correct-secret'), false);
  assert.equal(hasBearerSecret(missing, 'correct-secret'), false);
  assert.equal(hasBearerSecret(authorized, undefined), false);
});
