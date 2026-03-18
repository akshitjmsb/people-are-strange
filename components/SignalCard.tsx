import type { Signal, SignalType } from '@/lib/types';
import { SIGNAL_BADGE_COLORS, INDUSTRY_COLORS, getInitials, timeAgo } from '@/lib/types';
import Link from 'next/link';

interface SignalCardProps {
  signal: Signal;
  showCompany?: boolean;
}

export default function SignalCard({ signal, showCompany = false }: SignalCardProps) {
  const signalType = (signal.signal_type ?? 'news') as SignalType;
  const badge = SIGNAL_BADGE_COLORS[signalType];

  const company = signal.company;
  const industryColor = company
    ? INDUSTRY_COLORS[company.industry ?? ''] ?? { bg: '#f5f0e8', text: '#6a6055' }
    : null;

  return (
    <div className="bg-white rounded-2xl border border-[#ece7df] p-4 mb-3">
      <div className="flex items-start gap-3">
        {/* Company avatar (only on feed) */}
        {showCompany && company && (
          <Link href={`/company/${company.slug}`} className="flex-shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-semibold"
              style={{
                backgroundColor: industryColor?.bg ?? '#f5f0e8',
                color: industryColor?.text ?? '#6a6055',
              }}
            >
              {getInitials(company.name)}
            </div>
          </Link>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {showCompany && company && (
                <Link href={`/company/${company.slug}`}>
                  <p className="text-[13px] font-semibold text-[#1a1a1a] truncate hover:underline">
                    {company.name}
                  </p>
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: badge.bg, color: badge.text }}
              >
                {badge.label}
              </span>
              <span className="text-[10px] text-[#b0a898]">
                {timeAgo(signal.detected_at)}
              </span>
            </div>
          </div>

          {signal.summary && (
            <p className="text-[13px] text-[#6a6055] mt-1 leading-relaxed">
              {signal.summary}
            </p>
          )}

          {signal.source_url && (
            <a
              href={signal.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-[11px] text-[#6a6055] underline hover:text-[#1a1a1a]"
            >
              Source ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
