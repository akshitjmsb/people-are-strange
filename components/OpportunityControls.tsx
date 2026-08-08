'use client';

import { useEffect, useRef, useState } from 'react';

import type { OpportunityLens } from '@/lib/opportunity-map';
import { useDismiss } from '@/lib/use-dismiss';

const LENSES: { key: OpportunityLens; label: string; short: string }[] = [
  { key: 'matches', label: 'Best matches', short: 'Matches' },
  { key: 'hiring', label: 'Hiring now', short: 'Hiring' },
  { key: 'all', label: 'All companies', short: 'All' },
];

interface Props {
  lens: OpportunityLens;
  counts: Record<OpportunityLens, number>;
  onLens: (lens: OpportunityLens) => void;
  activeFilterCount: number;
  children: React.ReactNode;
}

export default function OpportunityControls({
  lens,
  counts,
  onLens,
  activeFilterCount,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useDismiss(open, panelRef, setOpen);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="flex w-full items-center gap-2">
      <div className="pointer-events-auto flex min-w-0 flex-1 items-center rounded-2xl border border-black/5 bg-white/90 p-1 shadow-lg backdrop-blur-xl sm:flex-none">
        {LENSES.map((option) => {
          const active = lens === option.key;
          return (
            <button
              key={option.key}
              onClick={() => onLens(option.key)}
              aria-pressed={active}
              className={`min-w-0 flex-1 rounded-xl px-2.5 py-2 text-[11px] font-black transition sm:flex-none sm:px-3.5 ${
                active
                  ? 'bg-asphalt text-white shadow-sm'
                  : 'text-asphalt/55 hover:bg-black/[0.04] hover:text-asphalt'
              }`}
            >
              <span className="sm:hidden">{option.short}</span>
              <span className="hidden sm:inline">{option.label}</span>
              <span className="ml-1 tabular-nums opacity-60">{counts[option.key]}</span>
            </button>
          );
        })}
      </div>

      <div ref={panelRef} className="pointer-events-auto relative shrink-0">
        <button
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-black shadow-lg backdrop-blur-xl transition ${
            open || activeFilterCount > 0
              ? 'border-asphalt bg-asphalt text-white'
              : 'border-black/5 bg-white/90 text-asphalt/70 hover:bg-white'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 tabular-nums">{activeFilterCount}</span>
          )}
        </button>

        {open && (
          <div
            role="dialog"
            aria-label="Map filters"
            className="absolute right-0 top-full z-40 mt-2 max-h-[65vh] w-[min(42rem,calc(100vw-1.5rem))] overflow-y-auto rounded-3xl border border-black/5 bg-white/95 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-asphalt/40">Refine the map</p>
                <h2 className="text-sm font-bold text-asphalt">Industry, company type and shortlist</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-bold text-asphalt/60 hover:bg-black/10"
              >
                Done
              </button>
            </div>
            <div className="flex flex-col gap-3">{children}</div>
          </div>
        )}
      </div>
    </div>
  );
}
