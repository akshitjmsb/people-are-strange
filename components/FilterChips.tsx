'use client';

import { CATEGORIES, CATEGORY_ORDER } from '@/lib/categories';
import type { POICategory } from '@/lib/types';

interface FilterChipsProps {
  active: Set<POICategory>;
  counts: Record<string, number>;
  onToggle: (cat: POICategory) => void;
  onClear: () => void;
}

/** Horizontally-scrolling category filter chips. */
export default function FilterChips({ active, counts, onToggle, onClear }: FilterChipsProps) {
  const hasFilters = active.size > 0;

  return (
    <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        onClick={onClear}
        className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-xl transition ${
          hasFilters
            ? 'border-white/10 bg-asphalt/70 text-snow-white/70 hover:bg-asphalt/90'
            : 'border-snow-white/30 bg-snow-white/15 text-snow-white'
        }`}
      >
        All
      </button>

      {CATEGORY_ORDER.map((cat) => {
        const def = CATEGORIES[cat];
        const isActive = active.has(cat);
        const count = counts[cat] ?? 0;
        if (count === 0) return null;
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-xl transition"
            style={
              isActive
                ? {
                    backgroundColor: `${def.color}33`,
                    borderColor: `${def.color}`,
                    color: def.color,
                  }
                : {
                    backgroundColor: 'rgba(45,52,54,0.7)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(248,249,250,0.7)',
                  }
            }
          >
            <span aria-hidden className="mr-1">{def.emoji}</span>
            {def.label}
            <span className="ml-1.5 opacity-60">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
