'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Company } from '@/lib/types';
import CompanyCard from '@/components/CompanyCard';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Autofocus on mount
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      return;
    }

    const debounce = setTimeout(async () => {
      setLoading(true);
      setSearched(true);

      // Build a tsquery from user input (handle multi-word)
      const tsQuery = trimmed
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => `${w}:*`)
        .join(' & ');

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .textSearch('fts', tsQuery, { type: 'websearch', config: 'english' })
        .limit(30);

      if (!error && data) {
        setResults(data as Company[]);
      } else {
        // Fallback: ilike search
        const { data: fallback } = await supabase
          .from('companies')
          .select('*')
          .or(`name.ilike.%${trimmed}%,industry.ilike.%${trimmed}%,description.ilike.%${trimmed}%`)
          .limit(30);
        if (fallback) setResults(fallback as Company[]);
      }

      setLoading(false);
    }, 350);

    return () => clearTimeout(debounce);
  }, [query]);

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
        <p className="text-[12px] italic text-[#6a6055] mt-1">Search the ecosystem</p>
      </header>

      {/* Search input */}
      <div className="px-4 py-3">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0a898]"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Company, industry, keyword…"
            className="w-full bg-white border border-[#ece7df] rounded-xl pl-9 pr-4 py-3 text-[14px] text-[#1a1a1a] placeholder-[#b0a898] focus:outline-none focus:border-[#1a1a1a] transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b0a898]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 px-4 pb-24">
        {loading ? (
          <div className="flex flex-col gap-3 mt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#ece7df] p-4 h-28 animate-pulse" />
            ))}
          </div>
        ) : searched && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="font-serif text-[18px] text-[#1a1a1a] italic mb-2">
              No strangers found.
            </p>
            <p className="text-[13px] text-[#6a6055]">Yet.</p>
          </div>
        ) : !searched ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[13px] text-[#6a6055]">
              Search across 50+ Downtown Montréal companies
            </p>
          </div>
        ) : (
          <>
            <p className="text-[12px] text-[#6a6055] mb-3">
              {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </p>
            {results.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
