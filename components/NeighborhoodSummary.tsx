'use client';

import { INDUSTRY_META, typeDef, AREA_ACCENT } from '@/lib/categories';
import { formatMoney } from '@/lib/funding';
import type { NeighborhoodCluster } from '@/lib/neighborhoods';

interface Props {
  cluster: NeighborhoodCluster;
  onClear: () => void;
}

/**
 * Compact aggregate card for the active neighborhood cluster — company count,
 * total funding, hiring and the industry mix — pinned above the bottom toolbar.
 * The map and list are already filtered to this district; this is its readout.
 */
export default function NeighborhoodSummary({ cluster, onClear }: Props) {
  const topType = cluster.topTypes[0];
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(4.6rem,calc(env(safe-area-inset-bottom)+4.2rem))] z-20 flex justify-center px-3">
      <div className="pointer-events-auto w-full max-w-lg animate-fade-in overflow-hidden rounded-2xl border border-black/5 bg-white/90 shadow-xl backdrop-blur-xl">
        <div className="h-1 w-full" style={{ backgroundColor: AREA_ACCENT }} aria-hidden />
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: AREA_ACCENT }}
                aria-hidden
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
                </svg>
              </span>
              <h3 className="truncate font-display text-sm font-extrabold text-asphalt">
                {cluster.name}
              </h3>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-semibold text-asphalt/60">
              <span>
                <b className="font-extrabold text-asphalt/80">{cluster.count}</b>{' '}
                {cluster.count === 1 ? 'company' : 'companies'}
              </span>
              {cluster.totalFunding > 0 && (
                <span className="text-parc-emerald">{formatMoney(cluster.totalFunding)} raised</span>
              )}
              {cluster.hiringCount > 0 && (
                <span className="text-plateau-pink">{cluster.hiringCount} hiring</span>
              )}
              {topType && (
                <span className="hidden sm:inline">
                  mostly {typeDef(topType.type).label.toLowerCase()}
                </span>
              )}
            </div>
          </div>

          {/* industry mix dots */}
          <div className="hidden shrink-0 items-center gap-1 sm:flex" aria-hidden>
            {cluster.topIndustries.map(({ industry, count }) => (
              <span
                key={industry}
                title={`${INDUSTRY_META[industry].label}: ${count}`}
                className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  backgroundColor: `${INDUSTRY_META[industry].color}1a`,
                  color: INDUSTRY_META[industry].color,
                }}
              >
                {INDUSTRY_META[industry].emoji}
                {count}
              </span>
            ))}
          </div>

          <button
            onClick={onClear}
            aria-label={`Clear ${cluster.name} filter`}
            className="shrink-0 rounded-full bg-black/5 p-1.5 text-asphalt/50 transition hover:bg-black/10 hover:text-asphalt"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
