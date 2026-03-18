'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Company, Person, JobPosting, Signal, RoleType } from '@/lib/types';
import { INDUSTRY_COLORS, SIGNAL_BADGE_COLORS, getInitials } from '@/lib/types';
import PersonCard from '@/components/PersonCard';
import JobCard from '@/components/JobCard';
import SignalCard from '@/components/SignalCard';

type Tab = 'people' | 'jobs' | 'signals';

const ROLE_GROUPS: { label: string; roles: RoleType[] }[] = [
  { label: 'Founders & Leadership', roles: ['founder'] },
  { label: 'Recruiters & Talent', roles: ['recruiter'] },
  { label: 'Hiring Managers', roles: ['hiring_manager'] },
  { label: 'Team Leads & Directors', roles: ['team_lead'] },
  { label: 'Investors', roles: ['investor'] },
];

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('people');

  useEffect(() => {
    if (!slug) return;

    async function fetchAll() {
      setLoading(true);

      // Fetch company
      const { data: co } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!co) {
        setLoading(false);
        return;
      }

      setCompany(co as Company);

      // Parallel fetch
      const [peopleRes, jobsRes, signalsRes] = await Promise.all([
        supabase.from('people').select('*').eq('company_id', co.id).order('role_type'),
        supabase.from('job_postings').select('*').eq('company_id', co.id).eq('is_active', true).order('posted_at', { ascending: false }),
        supabase.from('signals').select('*').eq('company_id', co.id).order('detected_at', { ascending: false }).limit(30),
      ]);

      if (peopleRes.data) setPeople(peopleRes.data as Person[]);
      if (jobsRes.data) setJobs(jobsRes.data as JobPosting[]);
      if (signalsRes.data) setSignals(signalsRes.data as Signal[]);

      setLoading(false);
    }

    fetchAll();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f0e8]">
        <div className="bg-[#1a1a1a] px-4 pt-5 pb-4 animate-pulse">
          <div className="h-3 w-24 bg-[#2a2a2a] rounded mb-2" />
          <div className="h-6 w-40 bg-[#2a2a2a] rounded mb-1" />
          <div className="h-3 w-32 bg-[#2a2a2a] rounded" />
        </div>
        <div className="px-4 mt-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#ece7df] p-4 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f0e8] text-center px-4">
        <p className="font-serif text-[22px] text-[#1a1a1a] italic mb-2">Company not found.</p>
        <button
          onClick={() => router.back()}
          className="text-[13px] text-[#6a6055] underline mt-2"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const industryColor = INDUSTRY_COLORS[company.industry ?? ''] ?? { bg: '#f5f0e8', text: '#6a6055' };
  const initials = getInitials(company.name);

  // Latest signal badge
  const latestSignalType = signals[0]?.signal_type;
  const badge = latestSignalType ? SIGNAL_BADGE_COLORS[latestSignalType] : company.hiring_active ? SIGNAL_BADGE_COLORS['hiring'] : null;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'people', label: 'People', count: people.length },
    { id: 'jobs', label: 'Jobs', count: jobs.length },
    { id: 'signals', label: 'Signals', count: signals.length },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f0e8]">
      {/* Dark header */}
      <header className="bg-[#1a1a1a] px-4 pt-5 pb-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[#6a6055] text-[12px] mb-4 hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <div className="flex items-start gap-3">
          {/* Company avatar */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-[14px] font-semibold flex-shrink-0"
            style={{ backgroundColor: industryColor.bg, color: industryColor.text }}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-[20px] text-[#f5f0e8] leading-tight">{company.name}</h1>
            <p className="text-[12px] text-[#6a6055] mt-0.5">
              {company.industry}
              {company.size_tier && <span className="ml-2 capitalize">· {company.size_tier}</span>}
              {company.founded_year && <span className="ml-2">· Est. {company.founded_year}</span>}
            </p>
          </div>

          {badge && (
            <span
              className="flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full"
              style={{ backgroundColor: badge.bg, color: badge.text }}
            >
              {badge.label}
            </span>
          )}
        </div>

        {company.description && (
          <p className="text-[13px] text-[#b0a898] mt-3 leading-relaxed">{company.description}</p>
        )}

        {/* Tags */}
        {(company.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(company.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a2a2a] text-[#6a6055] border border-[#3a3a3a]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex gap-3 mt-3">
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#6a6055] hover:text-white transition-colors flex items-center gap-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Website
            </a>
          )}
          {company.linkedin_url && (
            <a
              href={company.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#6a6055] hover:text-white transition-colors flex items-center gap-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-[#1a1a1a] border-t border-[#2a2a2a] px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-[13px] font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-[#f5f0e8] border-[#f5f0e8]'
                : 'text-[#6a6055] border-transparent'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 text-[10px] ${activeTab === tab.id ? 'text-[#6a6055]' : 'text-[#3a3a3a]'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 px-4 pt-4 pb-24">
        {/* ── People tab ── */}
        {activeTab === 'people' && (
          <>
            {people.length === 0 ? (
              <EmptyState message="No people added yet." sub="They're out there." />
            ) : (
              ROLE_GROUPS.map(({ label, roles }) => {
                const group = people.filter((p) => p.role_type && roles.includes(p.role_type));
                if (group.length === 0) return null;
                return (
                  <div key={label} className="mb-4">
                    <p className="text-[11px] font-semibold tracking-widest text-[#6a6055] uppercase mb-3 flex items-center gap-3">
                      {label}
                      <span className="flex-1 h-px bg-[#ece7df]" />
                    </p>
                    {group.map((person) => (
                      <PersonCard key={person.id} person={person} companyName={company.name} />
                    ))}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ── Jobs tab ── */}
        {activeTab === 'jobs' && (
          <>
            {jobs.length === 0 ? (
              <EmptyState message="No active postings." sub="Check back soon." />
            ) : (
              jobs.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </>
        )}

        {/* ── Signals tab ── */}
        {activeTab === 'signals' && (
          <>
            {signals.length === 0 ? (
              <EmptyState message="No signals yet." sub="Quiet for now." />
            ) : (
              signals.map((signal) => <SignalCard key={signal.id} signal={signal} />)
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message, sub }: { message: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="font-serif text-[18px] text-[#1a1a1a] italic mb-1">{message}</p>
      <p className="text-[13px] text-[#6a6055]">{sub}</p>
    </div>
  );
}
