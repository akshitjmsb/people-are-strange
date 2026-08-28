import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CANDIDATE_PROFILE_PARSER_VERSION,
  buildCandidateProfileFromResume,
} from '../lib/candidate-profile';

const LATEST_RESUME_HEADER = `\uFEFFAKSHIT GUPTA
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
    documentId: 'doc-1',
    revisionId: 'revision-latest',
    syncedAt: '2026-08-28T18:17:47.048Z',
    title: 'PAS_Resume_SYNC_SOURCE',
  });

  assert.equal(profile.name, 'AKSHIT GUPTA');
  assert.equal(profile.headline, 'DATA PRODUCT & AI STRATEGY LEADER | MBA');
  assert.equal(profile.yearsExperience, 11);
  assert.equal(profile.source.parserVersion, CANDIDATE_PROFILE_PARSER_VERSION);
});
