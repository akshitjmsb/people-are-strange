import type { JobMatch, MatchBand } from './job-matching';

export type OpportunityLens = 'matches' | 'hiring' | 'all';

export interface JobsResponse {
  matches: JobMatch[];
  totalOpenings: number;
  candidateMatches: number;
  strongMatches: number;
  refreshedAt: string | null;
  resumeSync: {
    state: 'current' | 'updated' | 'stale' | 'not_connected';
    connected: boolean;
    checkedAt: string | null;
    error?: string;
  };
  profile: {
    name: string;
    headline: string;
    sourceTitle: string;
    sourceUrl: string;
    sourceRevision: string;
    syncedAt: string;
  };
  error?: string;
}

export interface CompanyOpportunity {
  best: JobMatch;
  roles: JobMatch[];
}

export const MATCH_COLORS: Record<MatchBand, string> = {
  strong: '#00B894',
  good: '#0984E3',
  stretch: '#F39C12',
  low: '#839091',
};

export function groupOpportunities(matches: JobMatch[]): Map<string, CompanyOpportunity> {
  const grouped = new Map<string, CompanyOpportunity>();
  for (const match of matches) {
    const current = grouped.get(match.companyId);
    if (current) current.roles.push(match);
    else grouped.set(match.companyId, { best: match, roles: [match] });
  }
  return grouped;
}

export function visibleMatch(opportunity?: CompanyOpportunity): boolean {
  return Boolean(opportunity && opportunity.best.score >= 42);
}
