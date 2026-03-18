'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Company } from '@/lib/types';
import CompanyCard from '@/components/CompanyCard';
import FilterChips from '@/components/FilterChips';

export default function ExplorePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const fetchCompanies = useCallback(async (industry: string) => {
    setLoading(true);
    let query = supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true });

    if (industry !== 'All') {
      query = query.eq('industry', industry);
    }

    const { data, error } = await query;
    if (!error && data) setCompanies(data as Company[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCompanies(selectedIndustry);
  }, [selectedIndustry, fetchCompanies]);

  const handleFilterChange = (industry: string) => {
    setSelectedIndustry(industry);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f0e8]">
      {/* Dark header */}
      <header className="bg-[#1a1a1a] px-4 pt-5 pb-4">
        <p className="text-[10px] tracking-widest text-[#6a6055] uppercase mb-1">
          Montréal · Downtown
        </p>
        <h1 className="font-serif text-[22px] text-[#f5f0e8] leading-tight">
          People Are <em>Strange</em>
        </h1>
        <p className="text-[12px] italic text-[#6a6055] mt-1">when you&apos;re a stranger</p>
      </header>

      {/* Section title */}
      <div className="px-4 pt-4 pb-1">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[17px] font-semibold text-[#1a1a1a]">
            Companies
          </h2>
          {!loading && (
            <span className="text-[12px] text-[#6a6055]">
              {companies.length} found
            </span>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <FilterChips selected={selectedIndustry} onChange={handleFilterChange} />

      {/* Company list */}
      <div className="flex-1 px-4 pb-24">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#ece7df] p-4 h-28 animate-pulse"
              />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="font-serif text-[18px] text-[#1a1a1a] italic mb-2">
              No strangers here.
            </p>
            <p className="text-[13px] text-[#6a6055]">Try a different filter.</p>
          </div>
        ) : (
          companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))
        )}
      </div>
    </div>
  );
}
