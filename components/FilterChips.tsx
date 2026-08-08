'use client';

import { useMemo, useState } from 'react';

import { useCategories } from '@/lib/use-categories';
import type { CompanyType } from '@/lib/types';

/** How many type chips to show before collapsing the rest behind "+N".
 *  Roughly two wrapped rows at 375px — enough to browse, short enough that the
 *  chips never crowd the map out. */
const COLLAPSED_LIMIT = 4;

interface FilterChipsProps {
  active: Set<CompanyType>;
  counts: Record<string, number>;
  onToggle: (t: CompanyType) => void;
  onClear: () => void;
  /** Which types to show (in order). Defaults to every type across industries. */
  typeOrder?: CompanyType[];
}

/**
 * Wrapping company-type filter chips. Every chip carries its type's
 * Montreal-palette colour as a dot, so the whole palette is visible even
 * before anything is selected; an active chip fills with its colour.
 *
 * These used to scroll horizontally, which hid almost everything: on the "All"
 * industry lens the list is every type across all eight layers — 44 chips in a
 * ~200px slot, a 32x overflow no one would ever scroll to the end of. Now the
 * chips wrap, and anything past COLLAPSED_LIMIT sits behind an explicit "+N"
 * expander so the count of what's hidden is always visible.
 */
export default function FilterChips({
  active,
  counts,
  onToggle,
  onClear,
  typeOrder,
}: FilterChipsProps) {
  const { COMPANY_TYPES, TYPE_ORDER } = useCategories();
  const order = typeOrder ?? TYPE_ORDER;
  const hasFilters = active.size > 0;
  const [expanded, setExpanded] = useState(false);

  // Only types actually present in the current lens are chips at all.
  const present = useMemo(
    () => order.filter((t) => (counts[t] ?? 0) > 0),
    [order, counts],
  );

  // Hiding a single chip is pointless: the "+1 more" button is as wide as the
  // chip it replaces, so it costs a tap and saves nothing. Only collapse once
  // at least two chips would come off.
  //
  // Narrow lenses (Gaming has 5 types) are never collapsible, so a sticky
  // `expanded` left over from the 44-chip "All" lens can't strand a "Show less"
  // button over a list with nothing hidden.
  const collapsible = present.length > COLLAPSED_LIMIT + 1;

  // Collapsed, we show the first COLLAPSED_LIMIT — plus any active chip that
  // falls past the cut, so a selected filter can never hide itself.
  const visible = useMemo(() => {
    if (expanded || !collapsible) return present;
    const head = present.slice(0, COLLAPSED_LIMIT);
    const strandedActive = present.slice(COLLAPSED_LIMIT).filter((t) => active.has(t));
    return [...head, ...strandedActive];
  }, [expanded, collapsible, present, active]);

  const hiddenCount = present.length - visible.length;

  const expander = collapsible && (
    <button
      onClick={() => setExpanded((v) => !v)}
      aria-expanded={expanded}
      className="rounded-full border border-dashed border-asphalt/25 bg-white/85 px-3 py-1.5 text-xs font-bold text-asphalt/60 shadow-sm backdrop-blur-xl transition hover:bg-white"
    >
      {expanded ? 'Show less' : `+${hiddenCount} more`}
    </button>
  );

  return (
    // Expanded, the full list can be 44 chips — taller than the phone viewport.
    // The top chrome is an absolutely-positioned overlay, so anything past the
    // fold would be unreachable; cap the chips and let them scroll vertically.
    // "Show less" then lives OUTSIDE that scroll box, so collapsing never means
    // scrolling to the bottom of 44 chips to find the button again.
    <div className="pointer-events-auto flex flex-col items-start gap-2 pb-1">
      <div
        className={`flex flex-wrap gap-2 ${
          expanded ? 'max-h-[38vh] overflow-y-auto overscroll-contain' : ''
        }`}
      >
        <button
        onClick={onClear}
        aria-pressed={!hasFilters}
        className={`rounded-full border px-3.5 py-1.5 text-xs font-bold shadow-sm backdrop-blur-xl transition ${
          hasFilters
            ? 'border-black/5 bg-white/85 text-asphalt/70 hover:bg-white'
            : 'border-asphalt/80 bg-asphalt text-snow-white'
        }`}
      >
        All
      </button>

      {visible.map((t) => {
        const def = COMPANY_TYPES[t];
        const isActive = active.has(t);
        const count = counts[t] ?? 0;
        return (
          <button
            key={t}
            onClick={() => onToggle(t)}
            aria-pressed={isActive}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-xl transition"
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

        {/* Collapsed, "+N more" flows inline as the last chip. */}
        {!expanded && expander}
      </div>

      {/* Expanded, it sits below the scroll box so it stays reachable. */}
      {expanded && expander}
    </div>
  );
}
