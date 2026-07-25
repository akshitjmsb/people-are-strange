'use client';

import { INDUSTRY_META, AREA_ACCENT } from '@/lib/categories';
import { formatMoney } from '@/lib/funding';
import type { NeighborhoodCluster } from '@/lib/neighborhoods';

interface Props {
  clusters: NeighborhoodCluster[];
  activeName: string | null;
  onPick: (name: string) => void;
  onClose: () => void;
}

/**
 * Slide-up neighborhood picker — every canonical area, densest first, each
 * with its company count, industry mix and hiring/funding signals. Picking one
 * clusters the map (and list) to that district.
 */
export default function NeighborhoodPanel({ clusters, activeName, onPick, onClose }: Props) {
  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[1px] animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Neighbourhoods"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-h-[85vh] w-full max-w-2xl animate-sheet-up flex-col overflow-hidden rounded-t-3xl border border-black/5 bg-snow-white shadow-2xl"
      >
        <div aria-hidden className="h-1.5 w-full shrink-0" style={{ backgroundColor: AREA_ACCENT }} />

        <button
          onClick={onClose}
          className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-black/15 transition hover:bg-black/30"
          aria-label="Close"
        />

        <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-2">
          <div>
            <h2 className="font-display text-xl font-extrabold leading-tight text-asphalt">
              Neighbourhoods
            </h2>
            <p className="text-xs font-semibold text-asphalt/50">
              {clusters.length} areas · tap one to cluster the map
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full bg-black/5 px-3 py-1.5 text-sm font-medium text-asphalt/70 transition hover:bg-black/10"
          >
            Close
          </button>
        </header>

        <ul className="flex-1 space-y-1.5 overflow-y-auto px-3 pb-8">
          {clusters.map((c) => {
            const isActive = c.name === activeName;
            return (
              <li key={c.name}>
                <button
                  onClick={() => onPick(c.name)}
                  aria-pressed={isActive}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    isActive
                      ? 'border-asphalt/70 bg-asphalt/[0.06]'
                      : 'border-black/5 bg-white hover:border-black/10 hover:shadow-sm'
                  }`}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: AREA_ACCENT }}
                  >
                    <span className="font-display text-lg font-extrabold leading-none">
                      {c.count}
                    </span>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-asphalt">{c.name}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5">
                      {c.topIndustries.map(({ industry, count }) => (
                        <span
                          key={industry}
                          className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                          style={{
                            backgroundColor: `${INDUSTRY_META[industry].color}1a`,
                            color: INDUSTRY_META[industry].color,
                          }}
                        >
                          {INDUSTRY_META[industry].emoji} {count}
                        </span>
                      ))}
                    </span>
                  </span>

                  <span className="shrink-0 text-right">
                    {c.totalFunding > 0 && (
                      <span className="block text-xs font-bold text-parc-emerald">
                        {formatMoney(c.totalFunding)}
                      </span>
                    )}
                    {c.hiringCount > 0 && (
                      <span className="block text-[11px] font-semibold text-plateau-pink">
                        {c.hiringCount} with jobs
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
