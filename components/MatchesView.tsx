'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState, useEffect } from 'react';

import RecruiterInbox from '@/components/RecruiterInbox';
import { useCity, useCityId } from '@/lib/city-context';
import {
  useJobPipeline,
  type JobPipelineRecord,
  type JobPipelineStage,
} from '@/lib/job-pipeline';
import type { JobMatch, MatchBand } from '@/lib/job-matching';
import type { JobsResponse } from '@/lib/opportunity-map';

const BAND_STYLES: Record<MatchBand, { label: string; chip: string; score: string }> = {
  strong: { label: 'Strong match', chip: 'bg-parc-emerald/15 text-parc-emerald', score: 'text-parc-emerald' },
  good: { label: 'Good match', chip: 'bg-jazz-blue/15 text-jazz-blue', score: 'text-jazz-blue' },
  stretch: { label: 'Stretch', chip: 'bg-montroyal-amber/15 text-montroyal-amber', score: 'text-montroyal-amber' },
  low: { label: 'Low match', chip: 'bg-asphalt/10 text-asphalt/55', score: 'text-asphalt/45' },
};

const PIPELINE_STAGES: { value: JobPipelineStage; label: string }[] = [
  { value: 'target', label: 'Target' },
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'archived', label: 'Archived' },
];

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
  const [mode, setMode] = useState<'matches' | 'pipeline' | 'recruiters'>('matches');
  const pipeline = useJobPipeline();

  const loadMatches = useCallback(async () => {
    const response = await fetch(`/api/jobs?city=${encodeURIComponent(cityId)}`, { cache: 'no-store' });
    const payload = await response.json() as JobsResponse;
    if (!response.ok) throw new Error(payload.error ?? 'Could not load job matches');
    return payload;
  }, [cityId]);

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
  }, [loadMatches]);

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
  const activePipeline = useMemo(
    () => pipeline.records.filter((record) => record.stage !== 'archived'),
    [pipeline.records],
  );

  return (
    <section className="fixed inset-0 z-10 overflow-y-auto bg-snow-white pb-28">
      <div className="mtl-hairline fixed inset-x-0 top-0 z-20 h-[3px]" aria-hidden />
      <div className="mx-auto w-full max-w-4xl px-4 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6">
        <header className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-xl font-bold leading-tight text-asphalt sm:text-2xl">
                Best matches in {city.name}
              </h1>
              {data ? (
                <p className="mt-1 text-sm font-semibold text-asphalt/50">
                  <span className="font-black text-asphalt">{data.candidateMatches}</span> matches from{' '}
                  <span className="font-black text-asphalt">{data.totalOpenings}</span> live openings
                </p>
              ) : (
                <p className="mt-1 text-sm font-semibold text-asphalt/45">Checking live openings…</p>
              )}
            </div>
            <button
              type="button"
              onClick={refreshMatches}
              disabled={refreshing}
              aria-label={refreshing ? 'Refreshing hiring matches' : 'Refresh hiring matches'}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-asphalt text-xs font-black text-white transition hover:bg-asphalt/85 disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:px-3.5"
            >
              <span className={refreshing ? 'animate-spin' : ''} aria-hidden>↻</span>
              <span className="hidden sm:inline">{refreshing ? 'Refreshing…' : 'Refresh'}</span>
            </button>
          </div>

          {data?.profile && (
            <>
              <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[11px] font-semibold text-asphalt/50">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
                  data.resumeSync.state === 'current' || data.resumeSync.state === 'updated'
                    ? 'bg-parc-emerald/10 text-parc-emerald'
                    : 'bg-montroyal-amber/15 text-montroyal-amber'
                }`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                  {data.resumeSync.requiresReconnect
                    ? 'Resume needs attention'
                    : data.resumeSync.state === 'current' || data.resumeSync.state === 'updated'
                      ? 'Resume current'
                      : 'Using last synced resume'}
                </span>
                <span>Jobs {ago(data.refreshedAt)}</span>
              </div>

              <details className="group mt-3 border-t border-black/5 pt-2.5 text-xs text-asphalt/55">
                <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-asphalt/55 marker:content-none">
                  <span>Data details</span>
                  <span className="transition group-open:rotate-180" aria-hidden>⌄</span>
                </summary>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-black/[0.025] p-3">
                  <a
                    href={data.profile.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-asphalt/70 underline decoration-asphalt/20 underline-offset-2"
                  >
                    {data.profile.sourceTitle}
                  </a>
                  <span>Resume {ago(data.profile.syncedAt)}</span>
                  <Link
                    href="/settings/resume"
                    className="font-bold text-asphalt/70 underline decoration-asphalt/20 underline-offset-2"
                  >
                    {data.resumeSync.requiresReconnect ? 'Reconnect sync' : 'Resume settings'}
                  </Link>
                  <a
                    href="https://github.com/akshitjmsb/people-are-strange/actions/workflows/refresh-roles.yml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-asphalt/70 underline decoration-asphalt/20 underline-offset-2"
                  >
                    Refresh history ↗
                  </a>
                </div>
              </details>
            </>
          )}
        </header>

        <WorkflowSwitch
          mode={mode}
          onMode={setMode}
          matchCount={data?.candidateMatches ?? 0}
          pipelineCount={activePipeline.length}
        />

        {mode === 'pipeline' && (
          <PipelinePanel
            records={pipeline.records}
            onStage={pipeline.setStage}
            onBrowse={() => setMode('matches')}
          />
        )}

        {mode === 'recruiters' && (
          <RecruiterInbox
            pipelineRecords={pipeline.records}
            profile={data?.profile}
            resumeSync={data?.resumeSync}
          />
        )}

        {mode === 'matches' && loading && <LoadingState />}
        {mode === 'matches' && error && <ErrorState message={error} />}
        {mode === 'matches' && !loading && !error && data?.matches.length === 0 && <EmptyState />}

        {mode === 'matches' && focusCompanyId && data && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-jazz-blue/15 bg-jazz-blue/5 px-4 py-3 text-xs font-semibold text-asphalt/65">
            <span>{focusedCompany ? `Showing matching roles at ${focusedCompany}` : 'No ranked role at this company'}</span>
            <button onClick={onClearCompanyFocus} className="shrink-0 font-black text-jazz-blue hover:underline">
              Show all matches
            </button>
          </div>
        )}

        {mode === 'matches' && visibleMatches.length > 0 && (
          <ol className="mt-4 space-y-3">
            {visibleMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                pipelineRecord={pipeline.recordsById[match.id]}
                onPursue={() => pipeline.pursue(match, cityId)}
                onStage={pipeline.setStage}
                onShowOnMap={onShowOnMap}
              />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function WorkflowSwitch({
  mode,
  onMode,
  matchCount,
  pipelineCount,
}: {
  mode: 'matches' | 'pipeline' | 'recruiters';
  onMode: (mode: 'matches' | 'pipeline' | 'recruiters') => void;
  matchCount: number;
  pipelineCount: number;
}) {
  return (
    <div className="mt-4 grid grid-cols-3 rounded-2xl border border-black/5 bg-white p-1.5 shadow-sm">
      <button
        type="button"
        onClick={() => onMode('matches')}
        aria-pressed={mode === 'matches'}
        className={`rounded-xl px-3 py-3 text-sm font-black transition ${
          mode === 'matches' ? 'bg-asphalt text-white shadow-sm' : 'text-asphalt/55 hover:bg-black/[0.03]'
        }`}
      >
        Role inbox <span className="ml-1 opacity-60">{matchCount}</span>
      </button>
      <button
        type="button"
        onClick={() => onMode('pipeline')}
        aria-pressed={mode === 'pipeline'}
        className={`rounded-xl px-3 py-3 text-sm font-black transition ${
          mode === 'pipeline' ? 'bg-asphalt text-white shadow-sm' : 'text-asphalt/55 hover:bg-black/[0.03]'
        }`}
      >
        My pipeline <span className="ml-1 opacity-60">{pipelineCount}</span>
      </button>
      <button
        type="button"
        onClick={() => onMode('recruiters')}
        aria-pressed={mode === 'recruiters'}
        className={`rounded-xl px-2 py-3 text-sm font-black transition ${
          mode === 'recruiters' ? 'bg-asphalt text-white shadow-sm' : 'text-asphalt/55 hover:bg-black/[0.03]'
        }`}
      >
        Recruiters
      </button>
    </div>
  );
}

function PipelinePanel({
  records,
  onStage,
  onBrowse,
}: {
  records: JobPipelineRecord[];
  onStage: (jobId: string, stage: JobPipelineStage) => void;
  onBrowse: () => void;
}) {
  const active = records.filter((record) => record.stage !== 'archived');
  const archived = records.filter((record) => record.stage === 'archived');
  const next = [...active].sort((left, right) => stagePriority(left.stage) - stagePriority(right.stage))[0];
  const applied = active.filter((record) => record.stage === 'applied').length;
  const interviews = active.filter((record) => record.stage === 'interview').length;

  if (active.length === 0 && archived.length === 0) {
    return (
      <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-black/5 bg-white p-8 text-center shadow-sm">
        <div className="text-4xl" aria-hidden>🎯</div>
        <h2 className="mt-3 text-lg font-bold text-asphalt">Turn a match into a target</h2>
        <p className="mt-1 text-sm leading-relaxed text-asphalt/55">
          Pursue the roles you genuinely want. PAS will keep them here and tell you what to do next.
        </p>
        <button
          type="button"
          onClick={onBrowse}
          className="mt-5 rounded-full bg-asphalt px-5 py-2.5 text-sm font-black text-white"
        >
          Browse role inbox
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <section className="overflow-hidden rounded-3xl bg-asphalt p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-plateau-pink">Job search command centre</p>
            <h2 className="mt-1 font-display text-xl font-bold">Move one opportunity forward</h2>
            <p className="mt-1 text-sm text-white/60">Private to this device · roles from every PAS city</p>
          </div>
          <div className="flex gap-5">
            <PipelineMetric value={active.length} label="active" />
            <PipelineMetric value={applied} label="applied" />
            <PipelineMetric value={interviews} label="interviews" />
          </div>
        </div>

        {next && (
          <div className="mt-5 rounded-2xl bg-white/10 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-montroyal-amber">Next move</p>
            <div className="mt-1 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="font-bold leading-snug">{next.title}</p>
                <p className="mt-0.5 text-xs text-white/60">{next.companyName} · {nextAction(next.stage)}</p>
              </div>
              <a
                href={next.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-full bg-white px-4 py-2 text-center text-xs font-black text-asphalt"
              >
                Take action ↗
              </a>
            </div>
          </div>
        )}
      </section>

      <ol className="space-y-3">
        {active.map((record) => (
          <PipelineCard key={record.jobId} record={record} onStage={onStage} />
        ))}
      </ol>

      {archived.length > 0 && (
        <details className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-sm text-asphalt/55">
          <summary className="cursor-pointer font-bold">Archived roles ({archived.length})</summary>
          <ol className="mt-3 space-y-2">
            {archived.map((record) => (
              <PipelineCard key={record.jobId} record={record} onStage={onStage} compact />
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}

function PipelineMetric({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-right">
      <div className="font-display text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[9px] font-black uppercase tracking-wider text-white/40">{label}</div>
    </div>
  );
}

function PipelineCard({
  record,
  onStage,
  compact = false,
}: {
  record: JobPipelineRecord;
  onStage: (jobId: string, stage: JobPipelineStage) => void;
  compact?: boolean;
}) {
  return (
    <li className={`rounded-2xl border border-black/5 bg-white shadow-sm ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-jazz-blue/10 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-jazz-blue">
              {record.city}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-asphalt/35">{record.score} match</span>
          </div>
          <h3 className="mt-1.5 font-bold leading-snug text-asphalt">{record.title}</h3>
          <p className="mt-0.5 text-xs font-semibold text-asphalt/50">{record.companyName} · {record.location}</p>
          {!compact && <p className="mt-2 text-xs text-asphalt/55">Next: {nextAction(record.stage)}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StageSelect record={record} onStage={onStage} />
          <a
            href={record.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-asphalt px-3.5 py-2 text-xs font-bold text-white"
          >
            Open ↗
          </a>
        </div>
      </div>
    </li>
  );
}

function StageSelect({
  record,
  onStage,
}: {
  record: JobPipelineRecord;
  onStage: (jobId: string, stage: JobPipelineStage) => void;
}) {
  return (
    <select
      value={record.stage}
      onChange={(event) => onStage(record.jobId, event.target.value as JobPipelineStage)}
      aria-label={`Application stage for ${record.title}`}
      className="min-h-9 rounded-full border border-black/10 bg-white px-3 text-xs font-bold text-asphalt outline-none focus:border-jazz-blue"
    >
      {PIPELINE_STAGES.map((stage) => (
        <option key={stage.value} value={stage.value}>{stage.label}</option>
      ))}
    </select>
  );
}

function stagePriority(stage: JobPipelineStage): number {
  if (stage === 'interview') return 0;
  if (stage === 'applied') return 1;
  if (stage === 'target') return 2;
  if (stage === 'offer') return 3;
  return 4;
}

function nextAction(stage: JobPipelineStage): string {
  if (stage === 'target') return 'Review the posting, identify a contact, and apply';
  if (stage === 'applied') return 'Follow up with a hiring contact';
  if (stage === 'interview') return 'Prepare evidence stories and interview questions';
  if (stage === 'offer') return 'Evaluate compensation, scope, and negotiation points';
  return 'Restore this role when it becomes relevant again';
}

function MatchCard({
  match,
  pipelineRecord,
  onPursue,
  onStage,
  onShowOnMap,
}: {
  match: JobMatch;
  pipelineRecord?: JobPipelineRecord;
  onPursue: () => void;
  onStage: (jobId: string, stage: JobPipelineStage) => void;
  onShowOnMap?: (companyId: string) => void;
}) {
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
          {pipelineRecord ? (
            <StageSelect record={pipelineRecord} onStage={onStage} />
          ) : (
            <button
              type="button"
              onClick={onPursue}
              className="rounded-full bg-parc-emerald/10 px-4 py-2 text-xs font-black text-parc-emerald transition hover:bg-parc-emerald/15"
            >
              Pursue
            </button>
          )}
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
