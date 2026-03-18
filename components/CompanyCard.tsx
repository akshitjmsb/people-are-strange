'use client';

import Link from 'next/link';
import type { Company, SignalType } from '@/lib/types';
import { INDUSTRY_COLORS, SIGNAL_BADGE_COLORS, getInitials } from '@/lib/types';

interface CompanyCardProps {
  company: Company;
  latestSignal?: SignalType | null;
}

export default function CompanyCard({ company, latestSignal }: CompanyCardProps) {
  const industryColor = INDUSTRY_COLORS[company.industry ?? ''] ?? {
    bg: '#f5f0e8',
    text: '#6a6055',
  };

  const initials = getInitials(company.name);

  // Determine signal badge: use explicit signal, or derive from hiring_active
  const signalType: SignalType | null = latestSignal ?? (company.hiring_active ? 'hiring' : null);
  const badge = signalType ? SIGNAL_BADGE_COLORS[signalType] : null;

  return (
    <Link href={`/company/${company.slug}`} className="block">
      <div className="bg-white rounded-2xl border border-[#ece7df] p-4 mb-3 active:scale-[0.98] transition-transform">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-[13px] font-semibold"
            style={{ backgroundColor: industryColor.bg, color: industryColor.text }}
          >
            {initials}
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[14px] font-semibold text-[#1a1a1a] truncate">
                {company.name}
              </h3>
              {badge && (
                <span
                  className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: badge.bg, color: badge.text }}
                >
                  {badge.label}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#6a6055] mt-0.5">
              {company.industry}
              {company.size_tier && (
                <span className="ml-2 capitalize">· {company.size_tier}</span>
              )}
            </p>
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <p className="text-[12px] text-[#6a6055] mt-2.5 leading-relaxed line-clamp-2">
            {company.description}
          </p>
        )}

        {/* Tags + Say Hello */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1.5 flex-wrap">
            {(company.tags ?? []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[#f5f0e8] text-[#6a6055] border border-[#ece7df]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Phase 2: grayed out. Phase 3: wire up */}
          <button
            onClick={(e) => e.preventDefault()}
            className="text-[12px] font-medium text-[#b0a898] border border-[#e0d9d0] px-3 py-1.5 rounded-lg cursor-not-allowed flex-shrink-0"
            disabled
          >
            Say hello ↗
          </button>
        </div>
      </div>
    </Link>
  );
}
