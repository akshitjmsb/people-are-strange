'use client';

import type { Industry } from '@/lib/types';

export type IndustrySelection = Industry | 'all';

interface Option {
  key: IndustrySelection;
  label: string;
  emoji: string;
  color: string; // active pill colour
}

// AI keeps the street-art violet; aerospace gets its industrial jet-navy;
// energy its sun amber; marine its deep-sea blue; "All" is the neutral
// asphalt of the city grid.
const OPTIONS: Option[] = [
  { key: 'all', label: 'All', emoji: '🗺️', color: '#2D3436' },
  { key: 'ai', label: 'AI', emoji: '🧠', color: '#6C5CE7' },
  { key: 'aerospace', label: 'Aerospace', emoji: '✈️', color: '#1F4E79' },
  { key: 'energy', label: 'Energy', emoji: '⚡', color: '#F59E0B' },
  { key: 'marine', label: 'Marine', emoji: '🚢', color: '#0D4F6E' },
  { key: 'gaming', label: 'Gaming', emoji: '🎮', color: '#7B2FF7' },
];

interface Props {
  value: IndustrySelection;
  counts: Record<IndustrySelection, number>;
  onChange: (next: IndustrySelection) => void;
}

/** Top-level segmented control switching between the AI and aerospace layers. */
export default function IndustryToggle({ value, counts, onChange }: Props) {
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
