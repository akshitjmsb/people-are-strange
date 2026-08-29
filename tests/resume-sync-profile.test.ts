import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CANDIDATE_PROFILE_PARSER_VERSION,
  buildCandidateProfileFromResume,
} from '../lib/candidate-profile';
import { masterPdfRevision } from '../lib/pdf-resume';

const LATEST_RESUME_HEADER = `\uFEFFAKSHIT GUPTA   PAGE 1 OF 2
AKSHIT GUPTA
DATA PRODUCT & AI STRATEGY LEADER | MBA
Montreal, QC | akshit@example.com | linkedin.com/in/example

PROFESSIONAL SUMMARY
Data product and transformation leader with 11 years translating business strategy into governed data and AI initiatives.

CORE COMPETENCIES
Product & Portfolio Leadership: Product Strategy, Portfolio Prioritization

PROFESSIONAL EXPERIENCE
Airbus | Enterprise Data Product Owner
`;

test('derives the current leadership headline instead of the legacy fallback', () => {
  const profile = buildCandidateProfileFromResume(LATEST_RESUME_HEADER, {
    fileId: 'pdf-1',
    revisionId: 'md5:revision-latest',
    syncedAt: '2026-08-28T18:17:47.048Z',
    title: 'PAS_Resume_MASTER.pdf',
  });

  assert.equal(profile.name, 'AKSHIT GUPTA');
  assert.equal(profile.headline, 'DATA PRODUCT & AI STRATEGY LEADER | MBA');
  assert.equal(profile.yearsExperience, 11);
  assert.equal(profile.source.parserVersion, CANDIDATE_PROFILE_PARSER_VERSION);
  assert.equal(profile.source.url, 'https://drive.google.com/file/d/pdf-1/view');
});

test('uses the canonical PDF checksum as the resume revision', () => {
  assert.equal(masterPdfRevision({ md5Checksum: 'abc123', modifiedTime: 'ignored' }), 'md5:abc123');
  assert.equal(
    masterPdfRevision({ modifiedTime: '2026-08-28T19:27:02.128Z', size: '456' }),
    'modified:2026-08-28T19:27:02.128Z:456',
  );
});
