import type { CandidateProfile } from './candidate-profile';
import type { JobMatch } from './job-matching';
import type { PersonRole } from './types';

export interface OutreachDraftRequest {
  companyId: string;
  personName: string;
  personTitle: string;
  personRole: PersonRole;
}

export interface OutreachDraftResponse {
  draft: string;
  context: {
    resumeTitle: string;
    resumeRevision: string;
    resumeSyncedAt: string;
    matchedRole?: {
      title: string;
      score: number;
      url: string;
    };
  };
  error?: string;
}

interface DraftInput {
  profile: CandidateProfile;
  company: {
    name: string;
    industry: string;
    oneLiner: string;
  };
  person: Pick<OutreachDraftRequest, 'personName' | 'personRole'>;
  match?: JobMatch;
}

const INDUSTRY_FOCUS: Record<string, string> = {
  ai: 'enterprise data and AI',
  aerospace: 'aviation and aerospace data products',
  energy: 'energy data products',
  marine: 'maritime operations and data products',
  gaming: 'digital products and analytics',
  lifesci: 'life-sciences data products',
  financial: 'financial data products',
  enterprise: 'enterprise data and AI products',
};

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

function naturalList(values: string[]): string {
  if (values.length < 2) return values[0] ?? '';
  return `${values.slice(0, -1).join(', ')} and ${values[values.length - 1]}`;
}

export function buildOutreachDraft({ profile, company, person, match }: DraftInput): string {
  const domain = INDUSTRY_FOCUS[company.industry]
    ?? profile.domains[0]?.label.toLowerCase()
    ?? 'data and AI products';
  const evidence = match?.matchedSkills.slice(0, 2) ?? [];
  const roleFocus = evidence.length
    ? naturalList(evidence)
    : profile.responsibilities[0]?.label.toLowerCase();
  const article = /^[aeiou]/i.test(profile.headline) ? 'an' : 'a';

  const opening = `Hi ${firstName(person.personName)} — I’m ${article} ${profile.headline} in Montréal with ${profile.yearsExperience}+ years delivering ${domain}.`;
  const interest = match
    ? `${company.name}’s ${match.title} role stood out${roleFocus ? `, especially its focus on ${roleFocus}` : ''}.`
    : `${company.name}’s work caught my attention.`;
  const ask = person.personRole === 'hiring'
    ? 'I’d value connecting and hearing what the team looks for.'
    : person.personRole === 'founder'
      ? 'I’d value connecting and learning from what you’ve built.'
      : 'I’d value connecting and learning how your team is approaching this.';

  return `${opening} ${interest} ${ask}`;
}
