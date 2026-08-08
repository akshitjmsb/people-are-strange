'use client';

import { useEffect, useState } from 'react';

interface StatusResponse {
  state: 'current' | 'updated' | 'stale' | 'not_connected';
  connected: boolean;
  checkedAt: string | null;
  error?: string;
}

interface JobsStatusResponse {
  resumeSync: StatusResponse;
}

export default function ResumeConnectionStatus({ configured }: { configured: boolean }) {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/jobs?city=montreal&limit=1', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('status unavailable');
        return response.json() as Promise<JobsStatusResponse>;
      })
      .then((result) => { if (active) setStatus(result.resumeSync); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);

  const current = status?.state === 'current' || status?.state === 'updated';
  const label = failed
    ? 'Status temporarily unavailable'
    : !status
      ? 'Checking latest revision…'
      : current
        ? 'Latest revision active'
        : status.connected
          ? 'Connected · sync needs attention'
          : 'Not connected';

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black ${
          current ? 'bg-parc-emerald/10 text-parc-emerald' : 'bg-montroyal-amber/15 text-montroyal-amber'
        }`}>
          <span className="h-2 w-2 rounded-full bg-current" />
          {label}
        </span>
        {status?.checkedAt && (
          <span className="text-xs font-semibold text-asphalt/45">
            Last checked {new Date(status.checkedAt).toLocaleString('en-CA', { timeZone: 'America/Toronto' })}
          </span>
        )}
      </div>
      <a
        href="/api/google/connect"
        className={`mt-6 inline-flex rounded-full px-5 py-3 text-sm font-bold text-white ${
          configured ? 'bg-asphalt hover:bg-asphalt/85' : 'pointer-events-none bg-asphalt/25'
        }`}
        aria-disabled={!configured}
      >
        {status?.connected ? 'Reconnect Google Drive' : 'Connect Google Drive'}
      </a>
    </>
  );
}
