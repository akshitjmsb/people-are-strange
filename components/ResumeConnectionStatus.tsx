'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface StatusResponse {
  state: 'current' | 'updated' | 'degraded' | 'reconnect_required' | 'not_connected';
  connected: boolean;
  checkedAt: string | null;
  syncedAt: string | null;
  requiresReconnect: boolean;
  usingLastKnownGood: boolean;
  failureKind?: 'auth' | 'transient' | 'configuration' | 'source';
  error?: string;
  source: {
    title: string;
    url: string;
    revision: string;
    syncedAt: string;
  };
}

interface ResumeConnectionStatusProps {
  configured: boolean;
  oauthMessage: string | null;
  connectionCompleted: boolean;
}

export default function ResumeConnectionStatus({
  configured,
  oauthMessage,
  connectionCompleted,
}: ResumeConnectionStatusProps) {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadStatus = useCallback(async (
    method: 'GET' | 'POST' = 'GET',
    signal?: AbortSignal,
  ) => {
    setFailed(false);
    if (method === 'POST') setRefreshing(true);
    try {
      const response = await fetch('/api/resume-sync', { method, cache: 'no-store', signal });
      if (!response.ok) throw new Error('status unavailable');
      setStatus(await response.json() as StatusResponse);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setFailed(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadStatus('GET', controller.signal);
    return () => controller.abort();
  }, [loadStatus]);

  const current = status?.state === 'current' || status?.state === 'updated';
  const degraded = status?.state === 'degraded';
  const reconnectRequired = status?.state === 'reconnect_required';
  const label = failed
    ? 'Status temporarily unavailable'
    : !status
      ? 'Checking latest revision…'
      : current
        ? 'Latest revision active'
        : degraded
          ? 'Last synced resume active · check delayed'
          : reconnectRequired
            ? 'Reconnect required · last sync retained'
            : 'Not connected';
  const badgeClass = current
    ? 'bg-parc-emerald/10 text-parc-emerald'
    : status?.usingLastKnownGood
      ? 'bg-montroyal-amber/15 text-montroyal-amber'
      : 'bg-asphalt/10 text-asphalt/60';
  const interruptedReconnectWasHarmless = Boolean(oauthMessage && current);

  return (
    <>
      {connectionCompleted && current && (
        <Notice tone="success">
          Google Drive is connected and the latest resume revision has been synced.
        </Notice>
      )}
      {oauthMessage && !current && (status || failed) && (
        <Notice tone="error">{oauthMessage}</Notice>
      )}
      {interruptedReconnectWasHarmless && (
        <Notice tone="neutral">
          Your existing Google connection is healthy. The interrupted reconnect attempt did not affect resume matching.
        </Notice>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black ${badgeClass}`}>
          <span className="h-2 w-2 rounded-full bg-current" />
          {label}
        </span>
        {status?.checkedAt && (
          <span className="text-xs font-semibold text-asphalt/45">
            Last checked {formatToronto(status.checkedAt)}
          </span>
        )}
      </div>

      {status?.error && !current && (
        <p className="mt-3 max-w-xl text-xs font-semibold leading-relaxed text-asphalt/55">
          {status.error}
        </p>
      )}
      {status?.syncedAt && status.usingLastKnownGood && (
        <p className="mt-2 text-xs text-asphalt/45">
          Last successful sync: {formatToronto(status.syncedAt)}
        </p>
      )}
      {status && current && (
        <p className="mt-3 text-xs font-semibold text-asphalt/50">
          Synced directly from <span className="font-black text-asphalt/70">{status.source.title}</span>
          {' · '}revision {shortRevision(status.source.revision)}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {failed && (
          <button
            type="button"
            onClick={() => void loadStatus()}
            className="inline-flex rounded-full bg-asphalt px-5 py-3 text-sm font-bold text-white hover:bg-asphalt/85"
          >
            Retry status
          </button>
        )}
        {status?.connected && !reconnectRequired && (
          <button
            type="button"
            onClick={() => void loadStatus('POST')}
            disabled={refreshing}
            className="inline-flex rounded-full bg-asphalt px-5 py-3 text-sm font-bold text-white hover:bg-asphalt/85 disabled:cursor-wait disabled:opacity-50"
          >
            {refreshing ? 'Checking…' : degraded ? 'Retry sync' : 'Check now'}
          </button>
        )}
        {status && (!status.connected || reconnectRequired) && (
          <Link
            href="/api/google/connect"
            className={`inline-flex rounded-full px-5 py-3 text-sm font-bold text-white ${
              configured ? 'bg-asphalt hover:bg-asphalt/85' : 'pointer-events-none bg-asphalt/25'
            }`}
            aria-disabled={!configured}
          >
            {reconnectRequired ? 'Reconnect Google Drive' : 'Connect Google Drive'}
          </Link>
        )}
        {status?.connected && !reconnectRequired && (
          <Link
            href="/api/google/connect"
            className="px-2 py-3 text-xs font-bold text-asphalt/45 underline decoration-asphalt/20 underline-offset-4 hover:text-asphalt"
          >
            Reauthorize Google
          </Link>
        )}
      </div>
    </>
  );
}

function Notice({ children, tone }: { children: React.ReactNode; tone: 'success' | 'error' | 'neutral' }) {
  const className = tone === 'success'
    ? 'bg-parc-emerald/10 text-parc-emerald'
    : tone === 'error'
      ? 'bg-plateau-pink/10 text-plateau-pink'
      : 'bg-asphalt/5 text-asphalt/65';
  return <div className={`mt-5 rounded-2xl p-4 text-sm font-semibold ${className}`}>{children}</div>;
}

function formatToronto(value: string): string {
  return new Date(value).toLocaleString('en-CA', { timeZone: 'America/Toronto' });
}

function shortRevision(value: string): string {
  return value.startsWith('md5:') ? value.slice(4, 12) : value.slice(0, 12);
}
