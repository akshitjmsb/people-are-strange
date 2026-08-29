import { CANDIDATE_PROFILE, type CandidateProfile, type CandidateSignal } from './candidate-profile';
import type { JobPostingRow } from './db/schema';

export type MatchBand = 'strong' | 'good' | 'stretch' | 'low';
export type MatchConfidence = 'high' | 'medium' | 'low';

export interface JobMatch {
  id: string;
  companyId: string;
  companyName: string;
  companyIndustry: string;
  title: string;
  location: string;
  locality: JobPostingRow['locality'];
  url: string;
  department?: string;
  employmentType?: string;
  workplaceType?: string;
  publishedAt?: string;
  lastSeenAt: string;
  score: number;
  band: MatchBand;
  confidence: MatchConfidence;
  reasons: string[];
  gaps: string[];
  matchedSkills: string[];
}

interface MatchableJob extends JobPostingRow {
  companyName: string;
  companyIndustry: string;
}

const GAP_CATALOG: CandidateSignal[] = [
  { label: 'AWS', patterns: ['aws', 'amazon web services'], weight: 1 },
  { label: 'Microsoft Azure', patterns: ['azure'], weight: 1 },
  { label: 'Kubernetes', patterns: ['kubernetes', 'k8s'], weight: 1 },
  { label: 'Java', patterns: ['java'], weight: 1 },
  { label: 'C++', patterns: ['c++'], weight: 1 },
  { label: 'Salesforce', patterns: ['salesforce'], weight: 1 },
  { label: 'SAP', patterns: ['sap'], weight: 1 },
  { label: 'Machine-learning engineering', patterns: ['mlops', 'machine learning engineer', 'model deployment'], weight: 1 },
];

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function includesPattern(haystack: string, pattern: string): boolean {
  const needle = normalize(pattern);
  return (` ${haystack} `).includes(` ${needle} `) || haystack.includes(needle);
}

function matchingSignals(text: string, signals: CandidateSignal[]): CandidateSignal[] {
  return signals.filter((signal) => signal.patterns.some((pattern) => includesPattern(text, pattern)));
}

function bandFor(score: number): MatchBand {
  if (score >= 76) return 'strong';
  if (score >= 60) return 'good';
  if (score >= 42) return 'stretch';
  return 'low';
}

const LEADERSHIP_TITLE = /\b(senior|sr|lead|principal|manager|owner|head|director|directeur|directrice|gestionnaire|responsable)\b/;
const MANAGEMENT_TITLE = /\b(manager|owner|head|director|vice president|vp|directeur|directrice|gestionnaire|responsable)\b/;
const IMPLEMENTATION_TITLE = /\b(engineer|developer|scientist|architect|analyst|specialist|designer|artist|accountant|recruiter|ingenieur|ingenieure|developpeur|developpeuse|scientifique|architecte|analyste|specialiste)\b/;
const OFF_TARGET_TITLE = /\b(account executive|sales|marketing|recruiter|talent acquisition|human resources|artist|animator|producer|production supervisor|writer|translator|audio operations)\b/;
const MANAGEMENT_SCOPE = /\b(portfolio|roadmap|strategy|governance|stakeholder|cross functional|executive|transformation|prioritization|operating model|change management|product management|program management)\b/;

export function matchJob(
  job: MatchableJob,
  profile: CandidateProfile = CANDIDATE_PROFILE,
): JobMatch {
  const title = normalize(job.title);
  const body = normalize([job.title, job.department, job.description].filter(Boolean).join(' '));
  const usOnly = /\b(remote usa|remote us|united states only|must be (based|located) in (the )?(us|usa|united states)|authorized to work in (the )?(us|usa|united states))\b/.test(body);

  const titleSignals = matchingSignals(title, profile.targetTitles);
  const titleScore = Math.min(50, Math.max(0, ...titleSignals.map((signal) => signal.weight * 1.6)));

  const skills = matchingSignals(body, profile.skills);
  const skillScore = Math.min(20, skills.reduce((sum, signal) => sum + signal.weight, 0));

  const responsibilities = matchingSignals(body, profile.responsibilities);
  const responsibilityScore = Math.min(20, responsibilities.reduce((sum, signal) => sum + signal.weight, 0) * 1.5);

  const domains = matchingSignals(body, profile.domains);
  const domainScore = Math.min(10, domains.reduce((sum, signal) => sum + signal.weight, 0));

  let seniorityScore = LEADERSHIP_TITLE.test(title) ? 8 : 3;
  if (/\b(senior|sr|lead|principal|gestionnaire principal)\b/.test(title)) seniorityScore = 11;
  if (/\b(director|head|vice president|vp|directeur|directrice)\b/.test(title)) seniorityScore = 10;
  if (/\b(junior|jr|intern|student|graduate|entry level)\b/.test(title)) seniorityScore = 0;

  const locationScore = job.locality === 'here' ? 8 : job.locality === 'maybe' ? 5 : 0;
  const managementScopeScore = MANAGEMENT_SCOPE.test(body) ? 6 : 0;
  let penalty = 0;
  if (/\b(junior|jr|intern|student|graduate|entry level)\b/.test(title)) penalty += 30;
  if (IMPLEMENTATION_TITLE.test(title) && !MANAGEMENT_TITLE.test(title)) penalty += 24;
  if (OFF_TARGET_TITLE.test(title)) penalty += 32;
  if (usOnly) penalty += 35;

  let score = Math.max(
    0,
    Math.min(100, Math.round(titleScore + skillScore + responsibilityScore + domainScore + seniorityScore + locationScore + managementScopeScore - penalty)),
  );

  // A role without a credible target-title family is not a resume match,
  // regardless of generic words such as stakeholder, operations or data in
  // the description. This prevents sales and engineering roles from floating
  // above real product-management openings.
  if (titleSignals.length === 0) score = Math.min(score, 39);

  const reasons: string[] = [];
  if (titleSignals[0]) reasons.push(`Role aligns with ${titleSignals[0].label}`);
  if (managementScopeScore) reasons.push('Management-led scope: strategy, governance or cross-functional delivery');
  if (responsibilities.length) reasons.push(`Relevant ownership: ${responsibilities.slice(0, 2).map((s) => s.label).join(' and ')}`);
  if (skills.length) reasons.push(`Resume evidence for ${skills.slice(0, 4).map((s) => s.label).join(', ')}`);
  if (domains.length) reasons.push(`Domain overlap: ${domains.slice(0, 2).map((s) => s.label).join(' and ')}`);
  if (!reasons.length) reasons.push('Limited evidence of direct role alignment');

  const candidatePatterns = new Set(
    [...profile.skills, ...profile.responsibilities, ...profile.domains]
      .flatMap((signal) => signal.patterns)
      .map(normalize),
  );
  const gaps = matchingSignals(body, GAP_CATALOG)
    .filter((signal) => !signal.patterns.some((pattern) => candidatePatterns.has(normalize(pattern))))
    .map((signal) => signal.label)
    .slice(0, 3);
  if (IMPLEMENTATION_TITLE.test(title) && !MANAGEMENT_TITLE.test(title)) gaps.unshift('Hands-on implementation role');
  if (usOnly) gaps.unshift('US-only location or work authorization');

  const descriptionLength = job.description?.length ?? 0;
  const confidence: MatchConfidence = descriptionLength >= 900
    ? 'high'
    : descriptionLength >= 250
      ? 'medium'
      : 'low';

  return {
    id: job.id,
    companyId: job.companyId,
    companyName: job.companyName,
    companyIndustry: job.companyIndustry,
    title: job.title,
    location: job.location,
    locality: job.locality,
    url: job.url,
    department: job.department ?? undefined,
    employmentType: job.employmentType ?? undefined,
    workplaceType: job.workplaceType ?? undefined,
    publishedAt: job.publishedAt ?? undefined,
    lastSeenAt: job.lastSeenAt,
    score,
    band: bandFor(score),
    confidence,
    reasons: reasons.slice(0, 3),
    gaps,
    matchedSkills: skills.map((signal) => signal.label),
  };
}
