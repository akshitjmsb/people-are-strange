'use client';

import { useMemo } from 'react';
import { categoryDef } from '@/lib/categories';
import type { POI, POICategory } from '@/lib/types';
import POICard from './POICard';

interface POISheetProps {
  open: boolean;
  pois: POI[];
  hexId: string | null;
  onClose: () => void;
}

/** Bottom sheet that slides up when a hexagon is tapped. */
export default function POISheet({ open, pois, hexId, onClose }: POISheetProps) {
  // group POIs by category for a tidy, scannable sheet
  const grouped = useMemo(() => {
    const map = new Map<POICategory, POI[]>();
    for (const p of pois) {
      const arr = map.get(p.category);
      if (arr) arr.push(p);
      else map.set(p.category, [p]);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [pois]);

  if (!open) return null;

  return (
    <>
      {/* scrim */}
      <div
        className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      {/* sheet */}
      <section
        role="dialog"
        aria-modal="true"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-h-[72vh] w-full max-w-2xl animate-sheet-up flex-col rounded-t-3xl border border-white/10 bg-asphalt/80 shadow-2xl backdrop-blur-2xl"
      >
        {/* grabber */}
        <button
          onClick={onClose}
          className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-white/25 transition hover:bg-white/40"
          aria-label="Close"
        />

        <header className="flex items-center justify-between px-5 pb-3 pt-2">
          <div>
            <h2 className="text-lg font-bold text-snow-white">
              {pois.length} {pois.length === 1 ? 'place' : 'places'} here
            </h2>
            {hexId && (
              <p className="font-mono text-[11px] text-snow-white/40">hex {hexId}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-snow-white/80 transition hover:bg-white/20"
          >
            Close
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-8">
          {grouped.map(([cat, list]) => (
            <div key={cat}>
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: categoryDef(cat).color }}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-snow-white/55">
                  {categoryDef(cat).label} · {list.length}
                </span>
              </div>
              <div className="grid gap-2.5">
                {list.map((poi) => (
                  <POICard key={poi.id} poi={poi} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
