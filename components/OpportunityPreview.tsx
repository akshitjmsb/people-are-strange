'use client';

import type { CompanyOpportunity } from '@/lib/opportunity-map';
import { MATCH_COLORS } from '@/lib/opportunity-map';
import type { AICompany } from '@/lib/types';

interface Props {
  company: AICompany;
  opportunity?: CompanyOpportunity;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onDetails: () => void;
  onMatches: () => void;
  onClose: () => void;
}

export default function OpportunityPreview({
  company,
  opportunity,
  saved,
  onToggleSave,
  onDetails,
  onMatches,
  onClose,
}: Props) {
  const best = opportunity?.best;
  const accent = best ? MATCH_COLORS[best.band] : '#2D3436';

  return (
    <aside className="pointer-events-auto fixed bottom-[5.7rem] left-3 right-3 z-20 mx-auto max-w-xl animate-fade-in rounded-3xl border border-black/5 bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:left-auto sm:right-4 sm:mx-0 sm:w-[28rem]">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate font-display text-lg font-bold text-asphalt">{company.name}</h2>
            {best && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white"
                style={{ backgroundColor: accent }}
              >
                {best.score}% match
              </span>
            )}
          </div>
          {best ? (
            <>
              <p className="mt-1 text-sm font-bold leading-snug text-asphalt">{best.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-asphalt/60">
                {best.reasons[0] ?? company.oneLiner}
              </p>
              <p className="mt-1.5 text-[10px] font-black uppercase tracking-wide text-asphalt/35">
                {opportunity!.roles.length} matching {opportunity!.roles.length === 1 ? 'role' : 'roles'} at this company
              </p>
            </>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-asphalt/60">{company.oneLiner}</p>
          )}
        </div>
        <button onClick={onClose} aria-label="Close company preview" className="rounded-full bg-black/5 p-2 text-asphalt/45 hover:bg-black/10 hover:text-asphalt">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-black/5 pt-3">
        {best && (
          <a href={best.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-asphalt px-4 py-2 text-xs font-bold text-white hover:bg-asphalt/85">
            View best role ↗
          </a>
        )}
        {best && best.score >= 42 && (
          <button onClick={onMatches} className="rounded-full bg-jazz-blue/10 px-4 py-2 text-xs font-bold text-jazz-blue hover:bg-jazz-blue/15">
            All roles here
          </button>
        )}
        <button onClick={onDetails} className="rounded-full bg-black/5 px-4 py-2 text-xs font-bold text-asphalt/65 hover:bg-black/10">
          Company details
        </button>
        <button
          onClick={() => onToggleSave(company.id)}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${company.name} from saved` : `Save ${company.name}`}
          className={`ml-auto rounded-full p-2 ${saved ? 'bg-montroyal-amber/15 text-montroyal-amber' : 'bg-black/5 text-asphalt/45 hover:bg-black/10'}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
            <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
