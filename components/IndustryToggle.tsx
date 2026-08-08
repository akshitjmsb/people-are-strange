'use client';

import { useCity } from '@/lib/city-context';
import { useEffect, useMemo, useRef, useState } from 'react';
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

/**
 * Top-level control switching between the city's industry layers.
 *
 * Two presentations, because the layers don't fit a phone. On mobile this is a
 * dropdown: one compact trigger showing the current layer, and a panel listing
 * every layer on tap. On sm+ there's room for the familiar row of pills, so
 * they stay — no dropdown, no extra tap.
 *
 * The row used to scroll horizontally on mobile too, which meant only ~2.5 of
 * the 9 layers were ever reachable and nothing hinted the rest existed.
 */
export default function IndustryToggle({ value, counts, onChange }: Props) {
  const city = useCity();
  const OPTIONS = useMemo(() => optionsFor(city), [city]);
  const current = OPTIONS.find((o) => o.key === value) ?? OPTIONS[0];

  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside tap or Escape. Pointerdown (not click) so the panel is
  // already gone by the time a tap lands on the map behind it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const pick = (next: IndustrySelection) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <>
      {/* ── Mobile: dropdown ── */}
      <div ref={wrapRef} className="pointer-events-auto relative sm:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={`Industry layer: ${current.label}. Change layer`}
          className="flex items-center gap-1.5 rounded-2xl border border-black/5 py-2 pl-3 pr-2.5 text-xs font-bold shadow-lg backdrop-blur-xl transition"
          style={{ backgroundColor: current.color, color: '#fff' }}
        >
          <span aria-hidden>{current.emoji}</span>
          <span>{current.label}</span>
          <span className="tabular-nums opacity-75">{counts[current.key] ?? 0}</span>
          <Chevron open={open} />
        </button>

        {open && (
          <div
            role="listbox"
            aria-label="Industry layer"
            className="absolute left-0 top-full z-30 mt-1.5 max-h-[60vh] w-[13.5rem] overflow-y-auto overscroll-contain rounded-2xl border border-black/5 bg-white/95 p-1 shadow-xl backdrop-blur-xl"
          >
            {OPTIONS.map((o) => {
              const isActive = o.key === value;
              return (
                <button
                  key={o.key}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => pick(o.key)}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-bold transition"
                  style={
                    isActive
                      ? { backgroundColor: o.color, color: '#fff' }
                      : { color: 'rgba(45,52,54,0.75)' }
                  }
                >
                  <span aria-hidden className="shrink-0">{o.emoji}</span>
                  <span className="min-w-0 flex-1 truncate">{o.label}</span>
                  <span className="shrink-0 tabular-nums opacity-70">{counts[o.key] ?? 0}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── sm+: the pill row, which fits at this width ── */}
      <div className="pointer-events-auto hidden flex-wrap gap-1 rounded-2xl border border-black/5 bg-white/90 p-1 shadow-lg backdrop-blur-xl sm:flex">
        {OPTIONS.map((o) => {
          const isActive = o.key === value;
          return (
            <button
              key={o.key}
              onClick={() => onChange(o.key)}
              className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-bold leading-4 transition"
              style={
                isActive
                  ? { backgroundColor: o.color, color: '#fff' }
                  : { color: 'rgba(45,52,54,0.7)' }
              }
              aria-pressed={isActive}
            >
              <span aria-hidden>{o.emoji}</span>
              <span>{o.label}</span>
              <span className="tabular-nums opacity-70">{counts[o.key] ?? 0}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className={`h-3.5 w-3.5 shrink-0 opacity-80 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 7.5 10 12.5 15 7.5" />
    </svg>
  );
}
