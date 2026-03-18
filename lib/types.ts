// ─── Database type definitions ────────────────────────────────────────────

export type SizeTier = 'startup' | 'smb' | 'scaleup' | 'enterprise';
export type RoleType = 'founder' | 'recruiter' | 'hiring_manager' | 'team_lead' | 'investor';
export type RemoteType = 'onsite' | 'hybrid' | 'remote';
export type SignalType = 'hiring' | 'funding' | 'news' | 'expansion' | 'quiet';
export type OutreachIntent = 'job_seeker' | 'networking' | 'bd';

export interface Company {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  size_tier: SizeTier | null;
  description: string | null;
  website: string | null;
  linkedin_url: string | null;
  hq_address: string | null;
  tags: string[] | null;
  hiring_active: boolean;
  founded_year: number | null;
  last_enriched_at: string | null;
  created_at: string;
}

export interface Person {
  id: string;
  company_id: string;
  name: string;
  title: string | null;
  role_type: RoleType | null;
  linkedin_url: string | null;
  avatar_initials: string | null;
  is_active_signal: boolean;
  last_active_note: string | null;
  created_at: string;
}

export interface JobPosting {
  id: string;
  company_id: string;
  title: string;
  department: string | null;
  location: string | null;
  remote_type: RemoteType | null;
  posted_at: string | null;
  source_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Signal {
  id: string;
  company_id: string;
  signal_type: SignalType | null;
  summary: string | null;
  source_url: string | null;
  detected_at: string;
  created_at: string;
  // joined
  company?: Pick<Company, 'name' | 'slug' | 'industry'>;
}

export interface Outreach {
  id: string;
  person_id: string;
  company_id: string;
  intent: OutreachIntent | null;
  drafted_message: string | null;
  sent_at: string | null;
  created_at: string;
}

// ─── Supabase database shape ───────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: Company;
        Insert: Omit<Company, 'id' | 'created_at'>;
        Update: Partial<Omit<Company, 'id' | 'created_at'>>;
      };
      people: {
        Row: Person;
        Insert: Omit<Person, 'id' | 'created_at'>;
        Update: Partial<Omit<Person, 'id' | 'created_at'>>;
      };
      job_postings: {
        Row: JobPosting;
        Insert: Omit<JobPosting, 'id' | 'created_at'>;
        Update: Partial<Omit<JobPosting, 'id' | 'created_at'>>;
      };
      signals: {
        Row: Signal;
        Insert: Omit<Signal, 'id' | 'created_at' | 'company'>;
        Update: Partial<Omit<Signal, 'id' | 'created_at' | 'company'>>;
      };
      outreach: {
        Row: Outreach;
        Insert: Omit<Outreach, 'id' | 'created_at'>;
        Update: Partial<Omit<Outreach, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ─── UI helpers ──────────────────────────────────────────────────────────

export const INDUSTRY_COLORS: Record<string, { bg: string; text: string; initials: string }> = {
  'Tech & AI':              { bg: '#e3f2fd', text: '#0d47a1', initials: 'TA' },
  'Finance & Fintech':      { bg: '#e8f5e9', text: '#1b5e20', initials: 'FF' },
  'Gaming & Creative':      { bg: '#EEEDFE', text: '#3C3489', initials: 'GC' },
  'Health & Life Sciences': { bg: '#fce4ec', text: '#880e4f', initials: 'HL' },
  'Aerospace & Engineering':{ bg: '#FAEEDA', text: '#633806', initials: 'AE' },
  'Retail & Consumer':      { bg: '#fff3e0', text: '#e65100', initials: 'RC' },
  'Telecom & Infrastructure':{ bg: '#f3e5f5', text: '#4a148c', initials: 'TI' },
};

export const ROLE_BADGE_COLORS: Record<RoleType, { bg: string; text: string }> = {
  founder:         { bg: '#1a1a1a', text: '#f5f0e8' },
  recruiter:       { bg: '#e8f5e9', text: '#1b5e20' },
  hiring_manager:  { bg: '#e3f2fd', text: '#0d47a1' },
  team_lead:       { bg: '#EEEDFE', text: '#3C3489' },
  investor:        { bg: '#FAEEDA', text: '#633806' },
};

export const SIGNAL_BADGE_COLORS: Record<SignalType, { bg: string; text: string; label: string }> = {
  hiring:    { bg: '#e8f5e9', text: '#1b5e20', label: 'Hiring' },
  quiet:     { bg: '#f5f5f5', text: '#616161', label: 'Quiet' },
  funding:   { bg: '#FAEEDA', text: '#633806', label: 'Funding' },
  news:      { bg: '#e3f2fd', text: '#0d47a1', label: 'News' },
  expansion: { bg: '#EEEDFE', text: '#3C3489', label: 'Expansion' },
};

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}
