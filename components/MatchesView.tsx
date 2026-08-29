'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useCity, useCityId } from '@/lib/city-context';
import type { JobMatch, MatchBand } from '@/lib/job-matching';
import type { JobsResponse } from '@/lib/opportunity-map';

const BAND_STYLES: Record<MatchBand, { label: string; chip: string; score: string }> = {
  strong: { label: 'Strong match', chip: 'bg-parc-emerald/15 text-parc-emerald', score: 'text-parc-emerald' },
  good: { label: 'Good match', chip: 'bg-jazz-blue/15 text-jazz-blue', score: 'text-jazz-blue' },
  stretch: { label: 'Stretch', chip: 'bg-montroyal-amber/15 text-montroyal-amber', score: 'text-montroyal-amber' },
  low: { label: 'Low match', chip: 'bg-asphalt/10 text-asphalt/55', score: 'text-asphalt/45' },
};

function ago(iso: string | null): string {
  if (!iso) return 'waiting for first refresh';
  const hours = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000));
  if (hours < 1) return 'updated less than an hour ago';
  if (hours < 48) return `updated ${hours}h ago`;
  return `updated ${Math.round(hours / 24)}d ago`;
}

interface Props {
  focusCompanyId?: string | null;
  onClearCompanyFocus?: () => void;
  onShowOnMap?: (companyId: string) => void;
}

export default function MatchesView({ focusCompanyId, onClearCompanyFocus, onShowOnMap }: Props) {
  const city = useCity();
  const cityId = useCityId();
  const [data, setData] = useState<JobsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMatches() {
    const response = await fetch(`/api/jobs?city=${encodeURIComponent(cityId)}`, { cache: 'no-store' });
    const payload = await response.json() as JobsResponse;
    if (!response.ok) throw new Error(payload.error ?? 'Could not load job matches');
    return payload;
  }

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    loadMatches()
      .then((payload) => {
        if (alive) setData(payload);
      })
      .catch((reason) => {
        if (alive) setError(reason instanceof Error ? reason.message : String(reason));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [cityId]);

  async function refreshMatches() {
    setRefreshing(true);
    setError(null);
    try {
      setData(await loadMatches());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setRefreshing(false);
    }
  }

  const visibleMatches = focusCompanyId
    ? data?.matches.filter((match) => match.companyId === focusCompanyId) ?? []
    : data?.matches ?? [];
  const focusedCompany = visibleMatches[0]?.companyName;

  return (
    <section className="fixed inset-0 z-10 overflow-y-auto bg-snow-white pb-28">
      <div className="mtl-hairline fixed inset-x-0 top-0 z-20 h-[3px]" aria-hidden />
      <div className="mx-auto w-full max-w-4xl px-4 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6">
        <header className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-plateau-pink">
                Automatic resume matching
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold text-asphalt sm:text-3xl">
                Best matches in {city.name}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-asphalt/60">
                PAS checks verified company job boards, removes closed roles, and ranks every opening against your master resume.
              </p>
            </div>
            {data && (
              <div className="flex shrink-0 gap-5">
                <Metric value={data.candidateMatches} label="matches" />
                <Metric value={data.totalOpenings} label="scanned" />
              </div>
            )}
          </div>

          {data?.profile && (
            <div className="mt-5 border-t border-black/5 pt-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-semibold text-asphalt/55">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
                  data.resumeSync.state === 'current' || data.resumeSync.state === 'updated'
                    ? 'bg-parc-emerald/10 text-parc-emerald'
                    : 'bg-montroyal-amber/15 text-montroyal-amber'
                }`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                  {data.profile.headline}
                </span>
                <a
                  href={data.profile.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-asphalt/70 underline decoration-asphalt/20 underline-offset-2"
                >
                  {data.profile.sourceTitle}
                </a>
                <span>resume {ago(data.profile.syncedAt)}</span>
                <span>jobs {ago(data.refreshedAt)}</span>
                <Link
                  href="/settings/resume"
                  className="font-bold text-asphalt/70 underline decoration-asphalt/20 underline-offset-2"
                >
                  {data.resumeSync.requiresReconnect
                    ? 'Reconnect resume sync'
                    : data.resumeSync.connected
                      ? 'Resume sync settings'
                      : 'Connect automatic resume sync'}
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                <button
                  type="button"
                  onClick={refreshMatches}
                  disabled={refreshing}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-asphalt px-5 py-2.5 text-xs font-black text-white transition hover:bg-asphalt/85 disabled:cursor-wait disabled:opacity-60"
                >
                  <span className={refreshing ? 'animate-spin' : ''} aria-hidden>↻</span>
                  {refreshing ? 'Matching latest resume…' : 'Refresh hiring matches'}
                </button>
                <a
                  href="https://github.com/akshitjmsb/people-are-strange/actions/workflows/refresh-roles.yml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-black text-asphalt transition hover:border-black/20 hover:bg-asphalt/[0.03]"
                >
                  View refresh executions
                  <span aria-hidden>↗</span>
                </a>
              </div>
            </div>
          )}
        </header>

        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        {!loading && !error && data?.matches.length === 0 && <EmptyState />}

        {focusCompanyId && data && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-jazz-blue/15 bg-jazz-blue/5 px-4 py-3 text-xs font-semibold text-asphalt/65">
            <span>{focusedCompany ? `Showing matching roles at ${focusedCompany}` : 'No ranked role at this company'}</span>
            <button onClick={onClearCompanyFocus} className="shrink-0 font-black text-jazz-blue hover:underline">
              Show all matches
            </button>
          </div>
        )}

        {visibleMatches.length > 0 && (
          <ol className="mt-4 space-y-3">
            {visibleMatches.map((match) => (
              <MatchCard key={match.id} match={match} onShowOnMap={onShowOnMap} />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-right">
      <div className="font-display text-2xl font-bold tabular-nums text-asphalt">{value}</div>
      <div className="text-[10px] font-black uppercase tracking-wider text-asphalt/40">{label}</div>
    </div>
  );
}

function MatchCard({ match, onShowOnMap }: { match: JobMatch; onShowOnMap?: (companyId: string) => void }) {
  const style = BAND_STYLES[match.band];
  return (
    <li className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${style.chip}`}>
              {style.label}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-asphalt/35">
              {match.confidence} confidence
            </span>
          </div>
          <h2 className="mt-2 text-base font-bold leading-snug text-asphalt sm:text-lg">{match.title}</h2>
          <p className="mt-0.5 text-sm font-semibold text-asphalt/55">
            {match.companyName} · {match.location || 'Location not specified'}
            {match.workplaceType ? ` · ${match.workplaceType}` : ''}
          </p>
        </div>
        <div className="shrink-0 text-center">
          <div className={`font-display text-3xl font-bold tabular-nums ${style.score}`}>{match.score}</div>
          <div className="text-[9px] font-black uppercase tracking-wider text-asphalt/35">match</div>
        </div>
      </div>

      <ul className="mt-4 grid gap-1.5 text-xs leading-relaxed text-asphalt/70 sm:grid-cols-2">
        {match.reasons.map((reason) => (
          <li key={reason} className="flex gap-2">
            <span className="mt-1 text-parc-emerald" aria-hidden>●</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-3">
        <div className="flex flex-wrap gap-1.5">
          {match.gaps.length > 0 ? match.gaps.map((gap) => (
            <span key={gap} className="rounded-full bg-plateau-pink/10 px-2 py-1 text-[10px] font-bold text-plateau-pink">
              gap: {gap}
            </span>
          )) : (
            <span className="text-[10px] font-semibold text-asphalt/40">No major technology gap detected</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onShowOnMap && (
            <button
              onClick={() => onShowOnMap(match.companyId)}
              className="rounded-full bg-jazz-blue/10 px-4 py-2 text-xs font-bold text-jazz-blue transition hover:bg-jazz-blue/15"
            >
              Show on map
            </button>
          )}
          <a
            href={match.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-asphalt px-4 py-2 text-xs font-bold text-white transition hover:bg-asphalt/85"
          >
            View position
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </li>
  );
}

function LoadingState() {
  return (
    <div className="mt-16 flex items-center justify-center gap-2 text-sm font-semibold text-asphalt/55">
      <span className="h-2 w-2 animate-bounce rounded-full bg-plateau-pink" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-montroyal-amber [animation-delay:120ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-jazz-blue [animation-delay:240ms]" />
      <span className="ml-2">Ranking live openings…</span>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto mt-12 max-w-lg rounded-2xl bg-plateau-pink/10 p-5 text-center text-sm font-semibold text-plateau-pink">
      {message}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-black/5 bg-white p-8 text-center shadow-sm">
      <div className="text-4xl">📡</div>
      <h2 className="mt-3 text-lg font-bold text-asphalt">The automatic scan is warming up</h2>
      <p className="mt-1 text-sm leading-relaxed text-asphalt/55">
        Matches will appear here after the job-board refresh stores its first set of live positions.
      </p>
    </div>
  );
}
