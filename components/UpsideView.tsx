'use client';

import { useMemo, useState } from 'react';

import { useCity } from '@/lib/city-context';
import {
  rankCashCapacity,
  rankEquityUpside,
  type UpsideAssessment,
  type UpsideTrack,
} from '@/lib/career-upside';
import type { CompanyOpportunity } from '@/lib/opportunity-map';
import type { AICompany } from '@/lib/types';

interface Props {
  companies: AICompany[];
  opportunities: Map<string, CompanyOpportunity>;
  loading: boolean;
  onShowOnMap: (company: AICompany) => void;
}

export default function UpsideView({ companies, opportunities, loading, onShowOnMap }: Props) {
  const city = useCity();
  const [track, setTrack] = useState<UpsideTrack>('equity');
  const equity = useMemo(() => rankEquityUpside(companies, opportunities), [companies, opportunities]);
  const cash = useMemo(() => rankCashCapacity(companies, opportunities), [companies, opportunities]);
  const results = track === 'equity' ? equity : cash;

  return (
    <section className="fixed inset-0 z-10 overflow-y-auto bg-snow-white pb-28">
      <div className="mtl-hairline fixed inset-x-0 top-0 z-20 h-[3px]" aria-hidden />
      <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6">
        <header className="overflow-hidden rounded-3xl border border-black/5 bg-asphalt p-5 text-white shadow-sm sm:p-7">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-montroyal-amber">Career upside</p>
          <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">Two money paths in {city.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
                Compare private-company equity upside with {city.name} employers where a senior C$150K total package is genuinely plausible. Signals, never promises.
              </p>
            </div>
            <div className="flex shrink-0 gap-5">
              <Metric value={loading ? '—' : equity.length} label="private bets" />
              <Metric value={loading ? '—' : cash.length} label="C$150K targets" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-white/10 p-1">
            <TrackButton active={track === 'equity'} onClick={() => setTrack('equity')}>
              Pre-IPO equity
            </TrackButton>
            <TrackButton active={track === 'cash'} onClick={() => setTrack('cash')}>
              C$150K targets
            </TrackButton>
          </div>
        </header>

        <div className="mt-4 rounded-2xl border border-montroyal-amber/20 bg-montroyal-amber/10 px-4 py-3 text-xs leading-relaxed text-asphalt/70">
          {track === 'equity' ? (
            <><strong className="text-asphalt">Upside is not liquidity.</strong> A private-company grant may end up valuable, worthless, or impossible to sell for years. PAS ranks company signals; only a written offer reveals your economics.</>
          ) : (
            <><strong className="text-asphalt">This is total compensation, not base salary.</strong> The ranking combines pay-market strength, AI/data/product fit, financial capacity and live hiring signals. The exact role and level still determine the offer.</>
          )}
        </div>

        {track === 'cash' && (
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-black/5 bg-white p-3 sm:grid-cols-4">
            <MethodWeight value="34" label="Pay market" />
            <MethodWeight value="20" label="Role fit" />
            <MethodWeight value="20" label="Financial strength" />
            <MethodWeight value="26" label="Scale + live signals" />
          </div>
        )}

        {loading ? (
          <div className="mt-4 rounded-3xl border border-black/5 bg-white p-6 text-center text-sm text-asphalt/55">
            Loading company and compensation signals…
          </div>
        ) : results.length > 0 ? (
          <ol className="mt-4 grid gap-3 lg:grid-cols-2">
            {results.slice(0, 16).map((assessment, index) => (
              <UpsideCard
                key={assessment.company.id}
                rank={index + 1}
                track={track}
                assessment={assessment}
                onShowOnMap={onShowOnMap}
              />
            ))}
          </ol>
        ) : (
          <div className="mt-4 rounded-3xl border border-black/5 bg-white p-6 text-center text-sm text-asphalt/55">
            No companies have enough verified evidence for this track yet.
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="text-right">
      <div className="font-display text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-[9px] font-black uppercase tracking-wider text-white/45">{label}</div>
    </div>
  );
}

function MethodWeight({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-black/[0.035] px-3 py-2">
      <div className="font-display text-lg font-bold text-asphalt">{value}<span className="text-xs text-asphalt/35">%</span></div>
      <div className="text-[9px] font-black uppercase tracking-wide text-asphalt/45">{label}</div>
    </div>
  );
}

function TrackButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl px-3 py-2.5 text-xs font-black transition ${active ? 'bg-white text-asphalt shadow-sm' : 'text-white/60 hover:text-white'}`}
    >
      {children}
    </button>
  );
}

function UpsideCard({
  rank,
  track,
  assessment,
  onShowOnMap,
}: {
  rank: number;
  track: UpsideTrack;
  assessment: UpsideAssessment;
  onShowOnMap: (company: AICompany) => void;
}) {
  const { company, opportunity, financialEvidence } = assessment;
  return (
    <li className="flex flex-col rounded-3xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-asphalt text-sm font-black text-white">{rank}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-bold text-asphalt">{company.name}</h2>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${track === 'equity' ? 'bg-plateau-pink/10 text-plateau-pink' : 'bg-parc-emerald/10 text-parc-emerald'}`}>
              {assessment.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-asphalt/55">{company.oneLiner}</p>
        </div>
        <div className="shrink-0 text-center">
          <div className="font-display text-2xl font-bold tabular-nums text-asphalt">{assessment.score}</div>
          <div className="text-[8px] font-black uppercase tracking-wider text-asphalt/35">signal</div>
        </div>
      </div>

      <div className="mt-4 grid gap-1.5 text-xs text-asphalt/70">
        {assessment.reasons.map((reason) => (
          <div key={reason} className="flex gap-2">
            <span className={track === 'equity' ? 'text-plateau-pink' : 'text-parc-emerald'} aria-hidden>●</span>
            <span>{reason}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-black/[0.035] px-3 py-2.5 text-[11px] leading-relaxed text-asphalt/55">
        <span className="font-black text-asphalt/70">Risk: {assessment.risk}.</span>{' '}
        {assessment.cautions[0]}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-black/5 pt-4">
        {opportunity && (
          <a href={opportunity.best.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-asphalt px-3.5 py-2 text-xs font-bold text-white hover:bg-asphalt/85">
            Best role ↗
          </a>
        )}
        <button onClick={() => onShowOnMap(company)} className="rounded-full bg-black/5 px-3.5 py-2 text-xs font-bold text-asphalt/65 hover:bg-black/10">
          Show on map
        </button>
        {financialEvidence && (
          <a href={financialEvidence.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-[10px] font-black text-asphalt/45 underline decoration-asphalt/20 underline-offset-2">
            Financial source ↗
          </a>
        )}
      </div>
    </li>
  );
}
