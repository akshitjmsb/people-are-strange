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

/** Horizontally-scrolling company-type filter chips. */
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
            className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-xl transition"
            style={
              isActive
                ? { backgroundColor: def.color, borderColor: def.color, color: '#fff' }
                : {
                    backgroundColor: 'rgba(255,255,255,0.85)',
                    borderColor: 'rgba(0,0,0,0.05)',
                    color: 'rgba(45,52,54,0.75)',
                  }
            }
          >
            <span aria-hidden className="mr-1">{def.emoji}</span>
            {def.label}
            <span className="ml-1.5 opacity-70">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
