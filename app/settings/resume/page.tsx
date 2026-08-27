import Link from 'next/link';

import ResumeConnectionStatus from '@/components/ResumeConnectionStatus';
import { DEFAULT_CITY_ID } from '@/lib/cities';
import { googleResumeSyncConfigured } from '@/lib/google-oauth';

export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  missing_config: 'Google sync needs the environment variables listed below.',
  invalid_state: 'The connection expired or could not be verified. Please try again.',
  missing_refresh_token: 'Google did not return long-term access. Please connect again and approve access.',
  identity_check_failed: 'Google could not confirm the account identity.',
  wrong_account: 'That is not the configured resume-owner Google account.',
  sync_failed: 'Google connected, but the first resume sync failed. Check the status below.',
  callback_failed: 'The Google connection could not be completed.',
};

export default async function ResumeSettingsPage(
  props: {
    searchParams: Promise<{ connected?: string; error?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const configured = googleResumeSyncConfigured();
  const message = searchParams.error ? ERRORS[searchParams.error] ?? 'Google connection failed.' : null;

  return (
    <main className="min-h-screen bg-snow-white px-4 py-8 text-asphalt sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/${DEFAULT_CITY_ID}?view=matches`}
          className="text-xs font-bold text-asphalt/55 hover:text-asphalt"
        >
          ← Back to matches
        </Link>

        <section className="mt-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-plateau-pink">
            Resume source of truth
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Connect PAS resume sync</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-asphalt/60">
            Connect Google once. PAS will check the text mirror of your master PDF whenever Matches opens and during the daily job refresh, then rebuild matching signals when the revision changes.
          </p>

          {message && (
            <div className="mt-5 rounded-2xl bg-plateau-pink/10 p-4 text-sm font-semibold text-plateau-pink">
              {message}
            </div>
          )}
          {searchParams.connected === '1' && (
            <div className="mt-5 rounded-2xl bg-parc-emerald/10 p-4 text-sm font-semibold text-parc-emerald">
              Google Drive is connected and the latest resume revision has been synced.
            </div>
          )}

          <ResumeConnectionStatus configured={configured} />

          <div className="mt-6 rounded-2xl border border-black/5 bg-snow-white p-4">
            <p className="text-xs font-black uppercase tracking-wider text-asphalt/40">Active document</p>
            <a
              href="https://docs.google.com/document/d/1Sz8ZeQ3tq2q1SOKLq2Zt5NLqlLOHxlZoYioQ2DoDhPc"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-bold underline decoration-asphalt/20 underline-offset-4"
            >
              PAS_Resume_SYNC_SOURCE ↗
            </a>
            <p className="mt-1 text-xs text-asphalt/50">Only read-only Google Docs access is requested.</p>
          </div>

        </section>

        <section className="mt-4 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-xl font-bold">One-time setup</h2>
          <ol className="mt-4 space-y-4 text-sm leading-relaxed text-asphalt/70">
            <SetupStep number="1">
              Open the <External href="https://console.cloud.google.com/projectselector2/home/dashboard">Google Cloud Console</External>, choose a project, and <External href="https://console.cloud.google.com/apis/library/docs.googleapis.com">enable the Google Docs API</External>.
            </SetupStep>
            <SetupStep number="2">
              Configure the <External href="https://console.cloud.google.com/auth/overview">OAuth consent screen</External>, then create a Web application in <External href="https://console.cloud.google.com/auth/clients">OAuth Clients</External>.
            </SetupStep>
            <SetupStep number="3">
              Add <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs">https://YOUR_DOMAIN/api/google/callback</code> as an authorized redirect URI.
            </SetupStep>
            <SetupStep number="4">
              Add the five environment variables shown below, redeploy, then return here and press Connect Google Drive.
            </SetupStep>
          </ol>

          <pre className="mt-5 overflow-x-auto rounded-2xl bg-asphalt p-4 text-xs leading-6 text-white/85">{`GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_REDIRECT_URI=https://YOUR_DOMAIN/api/google/callback
RESUME_OWNER_EMAIL=your-google-email@example.com
RESUME_TOKEN_ENCRYPTION_KEY=<run: openssl rand -base64 32>`}</pre>
          <p className="mt-4 text-xs leading-relaxed text-asphalt/45">
            Optional: PAS_RESUME_DOCUMENT_ID overrides the built-in master Doc ID. Do not place secrets in NEXT_PUBLIC_ variables.
          </p>
        </section>
      </div>
    </main>
  );
}

function SetupStep({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-asphalt text-[11px] font-black text-white">{number}</span>
      <span>{children}</span>
    </li>
  );
}

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-asphalt/20 underline-offset-2">{children} ↗</a>;
}
