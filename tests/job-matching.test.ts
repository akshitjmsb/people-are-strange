import assert from 'node:assert/strict';
import test from 'node:test';

import { CANDIDATE_PROFILE } from '../lib/candidate-profile';
import { matchJob } from '../lib/job-matching';
import type { JobPostingRow } from '../lib/db/schema';

function job(title: string, description: string, locality: JobPostingRow['locality'] = 'here') {
  return {
    id: `test:${title}`,
    externalId: title,
    companyId: 'test-company',
    city: 'montreal' as const,
    provider: 'test',
    title,
    location: locality === 'here' ? 'Montreal, QC' : 'Canada',
    locality,
    url: 'https://example.com/job',
    description,
    department: 'Product',
    employmentType: 'FullTime',
    workplaceType: 'Hybrid',
    publishedAt: null,
    firstSeenAt: '2026-08-29T00:00:00.000Z',
    lastSeenAt: '2026-08-29T00:00:00.000Z',
    closedAt: null,
    active: true,
    companyName: 'Example Company',
    companyIndustry: 'ai',
  };
}

const MANAGEMENT_DESCRIPTION = `
  Own product strategy and roadmap for an enterprise data and AI platform.
  Lead portfolio prioritization, executive stakeholders, governance and
  cross-functional delivery across business and engineering teams.
`;

test('ranks senior AI product leadership as a strong match', () => {
  const match = matchJob(
    job('Principal Product Manager - Conversational AI', MANAGEMENT_DESCRIPTION, 'maybe'),
    CANDIDATE_PROFILE,
  );
  assert.ok(match.score >= 76, `expected strong match, received ${match.score}`);
  assert.equal(match.band, 'strong');
  assert.match(match.reasons[0], /AI Product Leadership|Senior Product Management/);
});

test('recognizes bilingual senior product-management titles', () => {
  const match = matchJob(
    job('Gestionnaire principal de produit – Tarification et personnalisation', MANAGEMENT_DESCRIPTION),
    CANDIDATE_PROFILE,
  );
  assert.ok(match.score >= 60, `expected good match, received ${match.score}`);
  assert.notEqual(match.band, 'low');
});

test('recognizes technical program leadership without treating it as coding work', () => {
  const match = matchJob(
    job('Senior Technical Program Manager, Machine Learning Infrastructure', MANAGEMENT_DESCRIPTION, 'maybe'),
    CANDIDATE_PROFILE,
  );
  assert.ok(match.score >= 60, `expected good match, received ${match.score}`);
  assert.ok(!match.gaps.includes('Hands-on implementation role'));
});

test('recognizes data governance and operations-transformation leadership', () => {
  const governance = matchJob(
    job('Senior Manager, Data Governance', 'Lead enterprise data governance, metadata, data quality and executive stakeholders.'),
    CANDIDATE_PROFILE,
  );
  const operations = matchJob(
    job('Head, Field Operations & Performance', 'Own operations strategy, KPIs, transformation roadmap and cross-functional delivery.'),
    CANDIDATE_PROFILE,
  );
  assert.ok(governance.score >= 60, `expected good governance match, received ${governance.score}`);
  assert.ok(operations.score >= 42, `expected credible operations stretch, received ${operations.score}`);
});

test('keeps off-target sales and implementation roles below the match threshold', () => {
  const sales = matchJob(
    job('Senior Account Executive - Montreal', 'Manage enterprise stakeholders and sell data and AI software.'),
    CANDIDATE_PROFILE,
  );
  const engineer = matchJob(
    job('Senior Data Engineer', 'Build data platforms using Python, SQL, Snowflake and Google Cloud.'),
    CANDIDATE_PROFILE,
  );
  assert.ok(sales.score < 42, `sales role should not qualify, received ${sales.score}`);
  assert.ok(engineer.score < 42, `engineering role should not qualify, received ${engineer.score}`);
  assert.ok(engineer.gaps.includes('Hands-on implementation role'));
});

test('penalizes junior product roles despite a matching title', () => {
  const match = matchJob(
    job('Junior Product Manager', 'Support backlog administration and sprint planning.'),
    CANDIDATE_PROFILE,
  );
  assert.ok(match.score < 42, `junior role should not qualify, received ${match.score}`);
});
