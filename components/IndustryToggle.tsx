'use client';

import { useCity } from '@/lib/city-context';
import { useMemo } from 'react';
import type { Industry } from '@/lib/types';

export type IndustrySelection = Industry | 'all';

interface Option {
  key: IndustrySelection;
  label: string;
  emoji: string;
  color: string; // active pill colour
}

// Built from the active city: an "All" pill in the neutral grid accent, then
// one pill per industry carrying that industry's own emoji, label and colour.
function optionsFor(city: ReturnType<typeof useCity>): Option[] {
  return [
    { key: 'all', label: 'All', emoji: '🗺️', color: city.areaAccent },
    ...city.industries.map((ind): Option => ({
      key: ind,
      label: city.industryMeta[ind].label,
      emoji: city.industryMeta[ind].emoji,
      color: city.industryMeta[ind].color,
    })),
  ];
}

interface Props {
  value: IndustrySelection;
  counts: Record<string, number>;
  onChange: (next: IndustrySelection) => void;
}

/** Top-level segmented control switching between the city's industry layers. */
export default function IndustryToggle({ value, counts, onChange }: Props) {
  const city = useCity();
  const OPTIONS = useMemo(() => optionsFor(city), [city]);
  return (
    <div className="pointer-events-auto inline-flex max-w-full gap-1 self-start overflow-x-auto rounded-2xl border border-black/5 bg-white/90 p-1 shadow-lg backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {OPTIONS.map((o) => {
        const isActive = value === o.key;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition"
            style={
              isActive
                ? { backgroundColor: o.color, color: '#fff' }
                : { color: 'rgba(45,52,54,0.7)' }
            }
            aria-pressed={isActive}
          >
            <span aria-hidden className="mr-1">{o.emoji}</span>
            {o.label}
            <span className="ml-1.5 opacity-70">{counts[o.key] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
