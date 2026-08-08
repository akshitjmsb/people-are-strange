'use client';

import { useMemo, useRef, useState } from 'react';

import Chevron from '@/components/Chevron';
import { useCategories } from '@/lib/use-categories';
import { useDismiss } from '@/lib/use-dismiss';
import type { CompanyType } from '@/lib/types';

/** How many type chips the sm+ row shows before collapsing the rest behind
 *  "+N". Mobile uses the dropdown instead and is not bound by this. */
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
 * Company-type filter — the sub-categories of the selected industry layer.
 *
 * Mobile gets a dropdown, matching the industry layer control above it, so the
 * whole top chrome stays three short rows and the map keeps its space. The
 * panel is multi-select and deliberately stays open while you tick types;
 * outside tap, Escape, or the trigger closes it.
 *
 * At sm+ there's room for the chip row, so it stays — every type visible as a
 * coloured chip, with anything past COLLAPSED_LIMIT behind a "+N more".
 *
 * Both replaced a single horizontally-scrolling row that had no scrollbar or
 * fade: on the "All" lens that was 44 chips of industry-specific vocabulary
 * ("MRO", "Tier 1 Supplier", "AAA Studio") in a ~200px sliver.
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
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useDismiss(open, wrapRef, setOpen);

  // Only types actually present in the current lens are offered at all.
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

  // A lens with no sub-categories has nothing to filter by — render nothing
  // rather than a control that only ever says "All".
  if (present.length === 0) return null;

  // What the mobile trigger says: the type itself when exactly one is picked,
  // otherwise a count, so the button width stays roughly stable.
  const activeTypes = present.filter((t) => active.has(t));
  const triggerLabel =
    activeTypes.length === 0
      ? 'All types'
      : activeTypes.length === 1
        ? COMPANY_TYPES[activeTypes[0]].label
        : `${activeTypes.length} types`;

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
    <>
      {/* ── Mobile: dropdown ──
          order-first puts the trigger at the start of its row, so the panel's
          left-0 anchor lines up with the chrome's gutter and a 15rem panel can
          never run off the right edge of a 375px screen. On sm+ this whole
          element is hidden and the chip row takes its natural place after the
          hiring/saved toggles. */}
      <div ref={wrapRef} className="pointer-events-auto relative order-first sm:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={`Company type filter: ${triggerLabel}. Change filter`}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-xl transition ${
            hasFilters
              ? 'border-asphalt/80 bg-asphalt text-snow-white'
              : 'border-black/5 bg-white/85 text-asphalt/70'
          }`}
        >
          <span>{triggerLabel}</span>
          <Chevron open={open} />
        </button>

        {open && (
          <div
            role="listbox"
            aria-multiselectable
            aria-label="Company type"
            className="absolute left-0 top-full z-30 mt-1.5 max-h-[50vh] w-[15rem] overflow-y-auto overscroll-contain rounded-2xl border border-black/5 bg-white/95 p-1 shadow-xl backdrop-blur-xl"
          >
            <button
              role="option"
              aria-selected={!hasFilters}
              onClick={onClear}
              className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-bold transition ${
                hasFilters ? 'text-asphalt/70' : 'bg-asphalt text-snow-white'
              }`}
            >
              <span className="min-w-0 flex-1 truncate">All types</span>
            </button>

            {present.map((t) => {
              const def = COMPANY_TYPES[t];
              const isActive = active.has(t);
              return (
                <button
                  key={t}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => onToggle(t)}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-bold transition"
                  style={
                    isActive
                      ? { backgroundColor: def.color, color: '#fff' }
                      : { color: 'rgba(45,52,54,0.75)' }
                  }
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: isActive ? '#fff' : def.color,
                      boxShadow: isActive ? 'none' : `0 0 0 2.5px ${def.color}2e`,
                    }}
                  />
                  <span className="min-w-0 flex-1 truncate">{def.label}</span>
                  <span className="shrink-0 tabular-nums opacity-70">{counts[t] ?? 0}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── sm+: the chip row, which has room to breathe ── */}
      <div className="pointer-events-auto hidden flex-col items-start gap-2 pb-1 sm:flex">
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
    </>
  );
}
