import assert from 'node:assert/strict';
import test from 'node:test';

import type { JobPipelineRecord } from '../lib/job-pipeline';
import {
  canReplyByEmail,
  detectProvider,
  gmailReplyPayload,
  officialReplyLink,
  recruiterConversation,
  type GmailMessageResource,
} from '../lib/recruiter-inbox';

const pipeline: JobPipelineRecord[] = [{
  jobId: 'job-1',
  companyId: 'service-now',
  companyName: 'ServiceNow',
  city: 'montreal',
  title: 'Senior Manager, Data Products',
  location: 'Montreal, QC',
  url: 'https://example.com/job-1',
  score: 84,
  band: 'strong',
  stage: 'applied',
  addedAt: '2026-08-30T12:00:00.000Z',
  updatedAt: '2026-08-30T12:00:00.000Z',
}];

function encoded(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function message(from: string, subject: string, body: string): GmailMessageResource {
  return {
    id: 'message-1',
    threadId: 'thread-1',
    internalDate: String(Date.parse('2026-09-01T12:00:00.000Z')),
    labelIds: ['INBOX', 'UNREAD'],
    payload: {
      mimeType: 'text/plain',
      headers: [
        { name: 'From', value: from },
        { name: 'Subject', value: subject },
        { name: 'Message-ID', value: '<message-1@example.com>' },
      ],
      body: { data: encoded(body) },
    },
  };
}

test('identifies platform notifications from sender or subject', () => {
  assert.equal(detectProvider('jobs-noreply@linkedin.com', 'A recruiter messaged you'), 'linkedin');
  assert.equal(detectProvider('alerts@indeed.ca', 'New employer message'), 'indeed');
  assert.equal(detectProvider('alerts@monster.com', 'Employer message'), 'monster');
});

test('keeps direct recruiter email replyable when the signature has a LinkedIn URL', () => {
  const conversation = recruiterConversation(
    message(
      'Priya Shah <priya@example.com>',
      'ServiceNow — Senior Manager, Data Products',
      'Would you be open to a conversation? https://www.linkedin.com/in/priya',
    ),
    pipeline,
  );

  assert.equal(conversation.provider, 'email');
  assert.equal(conversation.pipelineRecord?.jobId, 'job-1');
  assert.equal(canReplyByEmail(conversation), true);
});

test('does not offer direct email sending for no-reply addresses', () => {
  const conversation = recruiterConversation(
    message('Hiring Alerts <no-reply@example.com>', 'Interview update', 'Open your candidate portal.'),
    [],
  );
  assert.equal(canReplyByEmail(conversation), false);
});

test('selects an official platform reply link and rejects unrelated links', () => {
  assert.equal(
    officialReplyLink(
      'linkedin',
      '',
      'Privacy https://example.com/privacy Reply https://www.linkedin.com/messaging/thread/123',
    ),
    'https://www.linkedin.com/messaging/thread/123',
  );
});

test('builds a threaded Gmail reply payload', () => {
  const conversation = recruiterConversation(
    message('Priya Shah <priya@example.com>', 'Opportunity', 'Hello Akshit'),
    [],
  );
  const payload = gmailReplyPayload(conversation, 'Thank you — I would be glad to connect.');
  const raw = Buffer.from(payload.raw, 'base64url').toString('utf8');

  assert.equal(payload.threadId, 'thread-1');
  assert.match(raw, /To: priya@example\.com/);
  assert.match(raw, /Subject: Re: Opportunity/);
  assert.match(raw, /In-Reply-To: <message-1@example\.com>/);
  assert.match(raw, /Thank you — I would be glad to connect\./);
});
