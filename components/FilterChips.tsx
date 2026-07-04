'use client';

import { COMPANY_TYPES, TYPE_ORDER } from '@/lib/categories';
import type { CompanyType } from '@/lib/types';

interface FilterChipsProps {
  active: Set<CompanyType>;
  counts: Record<string, number>;
  onToggle: (t: CompanyType) => void;
  onClear: () => void;
  /** Which types to show (in order). Defaults to every type across industries. */
  typeOrder?: CompanyType[];
}

/**
 * Horizontally-scrolling company-type filter chips. Every chip carries its
 * type's Montreal-palette colour as a dot, so the whole palette is visible
 * even before anything is selected; an active chip fills with its colour.
 */
export default function FilterChips({
  active,
  counts,
  onToggle,
  onClear,
  typeOrder = TYPE_ORDER,
}: FilterChipsProps) {
  const hasFilters = active.size > 0;

  return (
    <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        onClick={onClear}
        aria-pressed={!hasFilters}
        className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold shadow-sm backdrop-blur-xl transition ${
          hasFilters
            ? 'border-black/5 bg-white/85 text-asphalt/70 hover:bg-white'
            : 'border-asphalt/80 bg-asphalt text-snow-white'
        }`}
      >
        All
      </button>

      {typeOrder.map((t) => {
        const def = COMPANY_TYPES[t];
        const isActive = active.has(t);
        const count = counts[t] ?? 0;
        if (count === 0) return null;
        return (
          <button
            key={t}
            onClick={() => onToggle(t)}
            aria-pressed={isActive}
            className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-xl transition"
            style={
              isActive
                ? {
                    backgroundColor: def.color,
                    borderColor: def.color,
                    color: '#fff',
                    boxShadow: `0 2px 12px ${def.color}59`,
                  }
                : {
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    borderColor: 'rgba(0,0,0,0.05)',
                    color: 'rgba(45,52,54,0.75)',
                  }
            }
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full transition"
              style={{
                backgroundColor: isActive ? '#fff' : def.color,
                boxShadow: isActive ? 'none' : `0 0 0 2.5px ${def.color}2e`,
              }}
            />
            {def.label}
            <span className="tabular-nums opacity-60">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
