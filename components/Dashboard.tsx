'use client';

import {
  INDUSTRY_META,
  INDUSTRY_ORDER,
  typeDef,
  AREA_ACCENT,
} from '@/lib/categories';
import { formatMoney } from '@/lib/funding';
import type { EcosystemStats } from '@/lib/stats';
import type { IndustrySelection } from './IndustryToggle';

interface Props {
  stats: EcosystemStats;
  /** The lens the dashboard is showing (drives the header + which split). */
  industry: IndustrySelection;
  onClose: () => void;
  /** Jump to a neighborhood cluster from the "top areas" list. */
  onPickNeighborhood: (name: string) => void;
  /** Download the currently-filtered list as CSV. */
  onExport: () => void;
  /** How many companies the export will contain (the current filtered list). */
  exportCount: number;
}

/**
 * Slide-up ecosystem dashboard — Montreal's scene at a glance. Everything is
 * derived from the currently-selected industry lens, so it stays truthful
 * against the live DB or the bundled offline dataset alike.
 */
export default function Dashboard({
  stats,
  industry,
  onClose,
  onPickNeighborhood,
  onExport,
  exportCount,
}: Props) {
  const lens = industry === 'all' ? INDUSTRY_META.ai : INDUSTRY_META[industry];
  const lensLabel = industry === 'all' ? 'All industries' : lens.label;
  const hiringPct = stats.total ? Math.round((stats.hiringCount / stats.total) * 100) : 0;

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
        aria-label="Ecosystem dashboard"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-h-[88vh] w-full max-w-3xl animate-sheet-up flex-col overflow-hidden rounded-t-3xl border border-black/5 bg-snow-white shadow-2xl"
      >
        <div aria-hidden className="mtl-hairline h-1.5 w-full shrink-0" />

        <button
          onClick={onClose}
          className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-black/15 transition hover:bg-black/30"
          aria-label="Close"
        />

        <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-2">
          <div>
            <h2 className="font-display text-xl font-extrabold leading-tight text-asphalt">
              Ecosystem <span className="mtl-gradient-text">at a glance</span>
            </h2>
            <p className="text-xs font-semibold text-asphalt/50">
              {lensLabel} · {stats.total} {stats.total === 1 ? 'company' : 'companies'} mapped
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onExport}
              disabled={exportCount === 0}
              title={`Download the current list (${exportCount}) as CSV`}
              className="flex items-center gap-1.5 rounded-full border border-black/5 bg-white px-3 py-1.5 text-xs font-bold text-asphalt/70 shadow-sm transition hover:text-asphalt disabled:opacity-40"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
              CSV
            </button>
            <button
              onClick={onClose}
              className="rounded-full bg-black/5 px-3 py-1.5 text-sm font-medium text-asphalt/70 transition hover:bg-black/10"
            >
              Close
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 pb-8">
          {/* headline stat tiles */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <StatTile label="Companies" value={String(stats.total)} accent="#6C5CE7" />
            <StatTile
              label="Funding raised"
              value={formatMoney(stats.totalFunding)}
              hint={`${stats.fundedCount} disclosed`}
              accent="#00B894"
            />
            {/* Live roles displace the static careers-link count wherever we
                actually poll boards — a real number beats a proxy. */}
            {stats.liveBoards > 0 ? (
              <StatTile
                label="Open in Montréal"
                value={String(stats.openRolesMontreal)}
                hint={`live · ${stats.liveBoards} board${stats.liveBoards === 1 ? '' : 's'}`}
                accent="#E84393"
              />
            ) : (
              <StatTile
                label="Careers page"
                value={String(stats.hiringCount)}
                hint={`${hiringPct}% linked`}
                accent="#E84393"
              />
            )}
            <StatTile
              label="Neighbourhoods"
              value={String(stats.neighborhoodCount)}
              accent="#F39C12"
            />
          </div>

          {/* industry (or type) split */}
          <Section title={industry === 'all' ? 'By industry' : `${lensLabel} — by type`}>
            {industry === 'all' ? (
              <div className="space-y-2">
                {INDUSTRY_ORDER.map((ind) => (
                  <Bar
                    key={ind}
                    label={`${INDUSTRY_META[ind].emoji} ${INDUSTRY_META[ind].label}`}
                    count={stats.perIndustry[ind]}
                    max={Math.max(1, ...INDUSTRY_ORDER.map((i) => stats.perIndustry[i]))}
                    color={INDUSTRY_META[ind].color}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {/* Only this lens's own types — a cross-listed company (e.g.
                    an AI-native biotech) carries a foreign type here and would
                    otherwise show as a stray bar with no relation to the rest
                    of the breakdown. Its presence is noted below instead. */}
                {stats.perType
                  .filter(({ type }) => typeDef(type).industry === industry)
                  .map(({ type, count }) => {
                    const def = typeDef(type);
                    return (
                      <Bar
                        key={type}
                        label={`${def.emoji} ${def.label}`}
                        count={count}
                        max={Math.max(1, ...stats.perType.map((t) => t.count))}
                        color={def.color}
                      />
                    );
                  })}
              </div>
            )}
            {industry !== 'all' && stats.crossListedCount > 0 && (
              <p className="mt-2 text-[11px] font-semibold text-asphalt/40">
                + {stats.crossListedCount} more cross-listed here from another industry
              </p>
            )}
          </Section>

          {/* founding-era histogram */}
          <Section
            title="Founded"
            aside={stats.oldestFounded ? `oldest ${stats.oldestFounded}` : undefined}
          >
            <Histogram buckets={stats.founding} color={lens.color} />
          </Section>

          {/* careers-link coverage — how much of the scene is one tap from a
              job listing. Not a hiring rate: see HiringToggle for why. */}
          <Section title="Careers coverage">
            <div className="rounded-2xl bg-black/[0.03] p-3.5">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm font-bold text-asphalt">
                  {stats.hiringCount} of {stats.total} link to jobs
                </span>
                <span className="text-xs font-bold text-plateau-pink">{hiringPct}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-plateau-pink to-montroyal-amber transition-all"
                  style={{ width: `${hiringPct}%` }}
                />
              </div>
            </div>
          </Section>

          {/* densest neighborhoods */}
          {stats.topNeighborhoods.length > 0 && (
            <Section title="Top neighbourhoods">
              <div className="space-y-1.5">
                {stats.topNeighborhoods.slice(0, 6).map((n, i) => (
                  <button
                    key={n.name}
                    onClick={() => onPickNeighborhood(n.name)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-black/[0.04]"
                  >
                    <span className="w-4 shrink-0 text-center text-xs font-black text-asphalt/35">
                      {i + 1}
                    </span>
                    <span className="w-32 shrink-0 truncate text-sm font-bold text-asphalt">
                      {n.name}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${(n.count / stats.topNeighborhoods[0].count) * 100}%`,
                          backgroundColor: AREA_ACCENT,
                        }}
                      />
                    </span>
                    <span className="w-6 shrink-0 text-right text-xs font-bold tabular-nums text-asphalt/60">
                      {n.count}
                    </span>
                  </button>
                ))}
              </div>
            </Section>
          )}
        </div>
      </section>
    </>
  );
}

function StatTile({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
      <div className="font-display text-2xl font-extrabold leading-none" style={{ color: accent }}>
        {value}
      </div>
      <div className="mt-1.5 text-[11px] font-bold uppercase tracking-wide text-asphalt/45">
        {label}
      </div>
      {hint && <div className="text-[10px] font-semibold text-asphalt/35">{hint}</div>}
    </div>
  );
}

function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-asphalt/45">{title}</h3>
        {aside && <span className="text-[11px] font-semibold text-asphalt/35">{aside}</span>}
      </div>
      {children}
    </div>
  );
}

function Bar({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = max ? Math.max(count > 0 ? 6 : 0, (count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate text-xs font-semibold text-asphalt/80 sm:w-40">
        {label}
      </span>
      <span className="h-3 flex-1 overflow-hidden rounded-full bg-black/[0.05]">
        <span
          className="block h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </span>
      <span className="w-6 shrink-0 text-right text-xs font-bold tabular-nums text-asphalt/70">
        {count}
      </span>
    </div>
  );
}

function Histogram({ buckets, color }: { buckets: { label: string; count: number }[]; color: string }) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div className="flex items-end justify-between gap-1.5 rounded-2xl bg-black/[0.03] p-3.5">
      {buckets.map((b) => (
        <div key={b.label} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[10px] font-bold tabular-nums text-asphalt/60">{b.count}</span>
          <div className="flex h-20 w-full items-end">
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${(b.count / max) * 100}%`,
                minHeight: b.count > 0 ? 4 : 0,
                backgroundColor: color,
                opacity: b.count > 0 ? 1 : 0.15,
              }}
            />
          </div>
          <span className="text-[10px] font-semibold text-asphalt/45">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
