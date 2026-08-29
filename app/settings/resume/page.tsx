import Link from 'next/link';

import ResumeConnectionStatus from '@/components/ResumeConnectionStatus';
import { DEFAULT_CITY_ID } from '@/lib/cities';
import { googleResumeSyncConfigured } from '@/lib/google-oauth';

const MASTER_PDF_ID = '1kYGzulxSB2IzTGVUNvkZLWY8cSP-aCne';
const MASTER_PDF_URL = `https://drive.google.com/file/d/${MASTER_PDF_ID}/view`;
const MASTER_PDF_PREVIEW_URL = `https://drive.google.com/file/d/${MASTER_PDF_ID}/preview`;

export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  missing_config: 'Google sync needs the environment variables listed below.',
  invalid_state: 'The connection expired or could not be verified. Please try again.',
  missing_access_token: 'Google did not return a usable access token. Please try again.',
  missing_refresh_token: 'Google did not return long-term access. Please connect again and approve access.',
  identity_check_failed: 'Google could not confirm the account identity.',
  wrong_account: 'That is not the configured resume-owner Google account.',
  sync_failed: 'Google connected, but the first resume sync failed. Check the status below.',
  callback_failed: 'The Google connection could not be completed.',
};

export default async function ResumeSettingsPage(
  props: {
    searchParams: Promise<{ connected?: string; error?: string; select?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const configured = googleResumeSyncConfigured();
  const message = searchParams.error ? ERRORS[searchParams.error] ?? 'Google connection failed.' : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-snow-white px-4 py-8 text-asphalt sm:px-6">
      <div className="mx-auto w-full min-w-0 max-w-3xl">
        <Link
          href={`/${DEFAULT_CITY_ID}?view=matches`}
          className="text-xs font-bold text-asphalt/55 hover:text-asphalt"
        >
          ← Back to matches
        </Link>

        <section className="mt-5 min-w-0 overflow-hidden rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-plateau-pink">
            Resume source of truth
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Master resume sync</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-asphalt/60">
            PAS checks your canonical PDF whenever Matches opens and during the daily job refresh. When the PDF checksum changes, PAS reads that exact file again and rebuilds every matching signal from it.
          </p>

          <ResumeConnectionStatus
            configured={configured}
            oauthMessage={message}
            connectionCompleted={searchParams.connected === '1'}
            selectionRequested={searchParams.select === '1'}
          />

          <div className="mt-6 w-full min-w-0 overflow-hidden rounded-2xl border border-black/5 bg-snow-white">
            <div className="flex min-w-0 flex-col items-stretch gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wider text-asphalt/40">Canonical resume</p>
                <p className="mt-1 break-words font-bold">PAS_Resume_MASTER.pdf</p>
              </div>
            <a
              href={MASTER_PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-asphalt px-4 py-2 text-xs font-bold text-white hover:bg-asphalt/85 sm:w-auto"
            >
                Open full PDF ↗
            </a>
            </div>
            <iframe
              src={MASTER_PDF_PREVIEW_URL}
              title="Latest PAS master resume PDF"
              className="block h-[520px] w-full max-w-full border-0 bg-white sm:h-[720px]"
              loading="lazy"
            />
            <p className="border-t border-black/5 px-4 py-3 text-xs text-asphalt/50">
              This preview is served by Google Drive and follows your Drive permissions. PAS requests access only to the PDF you explicitly choose; it cannot browse the rest of your Drive.
            </p>
          </div>

        </section>

        {!configured && <section className="mt-4 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-xl font-bold">One-time setup</h2>
          <ol className="mt-4 space-y-4 text-sm leading-relaxed text-asphalt/70">
            <SetupStep number="1">
              Open the <External href="https://console.cloud.google.com/projectselector2/home/dashboard">Google Cloud Console</External>, choose a project, then enable the <External href="https://console.cloud.google.com/apis/library/drive.googleapis.com">Google Drive API</External> and <External href="https://console.cloud.google.com/apis/library/picker.googleapis.com">Google Picker API</External>.
            </SetupStep>
            <SetupStep number="2">
              Configure the <External href="https://console.cloud.google.com/auth/overview">OAuth consent screen</External>, then create a Web application in <External href="https://console.cloud.google.com/auth/clients">OAuth Clients</External>.
            </SetupStep>
            <SetupStep number="3">
              Add <code className="rounded bg-black/5 px-1.5 py-0.5 text-xs">https://YOUR_DOMAIN/api/google/callback</code> as an authorized redirect URI.
            </SetupStep>
            <SetupStep number="4">
              Create a browser API key restricted to your production web origin and the Google Picker API. Add the variables below, redeploy, then press Connect Google Drive.
            </SetupStep>
          </ol>

          <pre className="mt-5 overflow-x-auto rounded-2xl bg-asphalt p-4 text-xs leading-6 text-white/85">{`GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_REDIRECT_URI=https://YOUR_DOMAIN/api/google/callback
RESUME_OWNER_EMAIL=your-google-email@example.com
RESUME_TOKEN_ENCRYPTION_KEY=<run: openssl rand -base64 32>
GOOGLE_PICKER_API_KEY=...`}</pre>
          <p className="mt-4 text-xs leading-relaxed text-asphalt/45">
            Optional: PAS_RESUME_MASTER_PDF_ID overrides the built-in master PDF ID. Do not place secrets in NEXT_PUBLIC_ variables.
          </p>
        </section>}
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
