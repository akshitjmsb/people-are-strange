'use client';

import Script from 'next/script';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { JobPipelineRecord } from '@/lib/job-pipeline';
import {
  canReplyByEmail,
  gmailReplyPayload,
  recruiterConversation,
  suggestedReply,
  type GmailMessageResource,
  type RecruiterConversation,
  type RecruiterProvider,
} from '@/lib/recruiter-inbox';
import type { JobsResponse } from '@/lib/opportunity-map';

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
].join(' ');

const RECRUITER_QUERY = 'newer_than:120d -category:promotions (from:linkedin.com OR from:indeed.com OR from:monster.com OR recruiter OR "talent acquisition" OR interview OR "hiring team")';

const PROVIDER_META: Record<RecruiterProvider, { label: string; className: string; fallbackUrl: string }> = {
  email: { label: 'Email', className: 'bg-jazz-blue/10 text-jazz-blue', fallbackUrl: 'https://mail.google.com/' },
  linkedin: { label: 'LinkedIn', className: 'bg-[#0A66C2]/10 text-[#0A66C2]', fallbackUrl: 'https://www.linkedin.com/messaging/' },
  indeed: { label: 'Indeed', className: 'bg-[#2557A7]/10 text-[#2557A7]', fallbackUrl: 'https://myjobs.indeed.com/' },
  monster: { label: 'Monster', className: 'bg-[#6E46AE]/10 text-[#6E46AE]', fallbackUrl: 'https://www.monster.com/profile/' },
};

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken(config?: { prompt?: string }): void;
}

declare global {
  interface GoogleBrowser {
    accounts?: {
      oauth2: {
        initTokenClient(config: {
          client_id: string;
          scope: string;
          include_granted_scopes?: boolean;
          callback(response: GoogleTokenResponse): void;
          error_callback?(error: { type?: string }): void;
        }): GoogleTokenClient;
        revoke(token: string, done?: () => void): void;
      };
    };
  }

  interface Window {
    google?: GoogleBrowser;
  }
}

interface Props {
  pipelineRecords: JobPipelineRecord[];
  profile?: JobsResponse['profile'];
  resumeSync?: JobsResponse['resumeSync'];
}

export default function RecruiterInbox({ pipelineRecords, profile, resumeSync }: Props) {
  const tokenRef = useRef<string | null>(null);
  const expiryTimer = useRef<number | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<RecruiterConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<RecruiterProvider | 'all'>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sentId, setSentId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/google/browser-config', { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json() as { clientId?: string; error?: string };
        if (!response.ok || !payload.clientId) throw new Error(payload.error ?? 'Google authorization is unavailable.');
        setClientId(payload.clientId);
      })
      .catch((reason) => setConfigError(reason instanceof Error ? reason.message : String(reason)));

    return () => {
      if (expiryTimer.current) window.clearTimeout(expiryTimer.current);
    };
  }, []);

  const gmailFetch = useCallback(async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const token = tokenRef.current;
    if (!token) throw new Error('Connect Gmail again to continue.');
    const headers = new Headers(init?.headers);
    headers.set('Authorization', `Bearer ${token}`);
    if (init?.body) headers.set('Content-Type', 'application/json');
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, {
      ...init,
      headers,
    });
    if (response.status === 401) {
      tokenRef.current = null;
      setConnectedEmail(null);
      throw new Error('Your private Gmail session expired. Connect again.');
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
      throw new Error(payload?.error?.message ?? `Gmail request failed (${response.status}).`);
    }
    return response.json() as Promise<T>;
  }, []);

  const loadInbox = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q: RECRUITER_QUERY, maxResults: '40' });
      const [mailbox, list] = await Promise.all([
        gmailFetch<{ emailAddress: string }>('/profile'),
        gmailFetch<{ messages?: { id: string }[] }>(`/messages?${params}`),
      ]);
      const resources = await Promise.all(
        (list.messages ?? []).map(({ id }) => gmailFetch<GmailMessageResource>(`/messages/${id}?format=full`)),
      );
      setConnectedEmail(mailbox.emailAddress);
      setMessages(resources
        .map((message) => recruiterConversation(message, pipelineRecords))
        .sort((left, right) => right.receivedAt.localeCompare(left.receivedAt)));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setLoading(false);
    }
  }, [gmailFetch, pipelineRecords]);

  const connect = () => {
    setError(null);
    if (!scriptReady || !clientId || !window.google?.accounts) {
      setError(configError ?? 'Google authorization is still loading.');
      return;
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GMAIL_SCOPES,
      include_granted_scopes: false,
      callback: (response) => {
        if (!response.access_token) {
          setError(response.error_description ?? response.error ?? 'Google did not return Gmail access.');
          return;
        }
        tokenRef.current = response.access_token;
        if (expiryTimer.current) window.clearTimeout(expiryTimer.current);
        expiryTimer.current = window.setTimeout(() => {
          tokenRef.current = null;
          setConnectedEmail(null);
        }, Math.max(60, (response.expires_in ?? 3600) - 60) * 1000);
        void loadInbox();
      },
      error_callback: () => setError('Google authorization was closed or could not start.'),
    });
    client.requestAccessToken({ prompt: 'consent' });
  };

  const disconnect = () => {
    const token = tokenRef.current;
    tokenRef.current = null;
    setConnectedEmail(null);
    setMessages([]);
    setReplyingTo(null);
    if (expiryTimer.current) window.clearTimeout(expiryTimer.current);
    if (token && window.google?.accounts) window.google.accounts.oauth2.revoke(token);
  };

  const openReply = (conversation: RecruiterConversation) => {
    setReplyingTo(conversation.id);
    setDraft(suggestedReply(conversation));
    setSentId(null);
  };

  const sendReply = async (conversation: RecruiterConversation) => {
    if (!draft.trim()) return;
    setSending(true);
    setError(null);
    try {
      await gmailFetch('/messages/send', {
        method: 'POST',
        body: JSON.stringify(gmailReplyPayload(conversation, draft.trim())),
      });
      setSentId(conversation.id);
      setReplyingTo(null);
      setDraft('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setSending(false);
    }
  };

  const visible = useMemo(
    () => provider === 'all' ? messages : messages.filter((message) => message.provider === provider),
    [messages, provider],
  );

  return (
    <div className="mt-4 space-y-4">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setConfigError('Google authorization could not load.')}
      />

      <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-plateau-pink">Private recruiter inbox</p>
            <h2 className="mt-1 font-display text-xl font-bold text-asphalt">One place for every conversation</h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-asphalt/55">
              Reply to direct emails here. LinkedIn, Indeed, and Monster open their official conversation securely.
            </p>
          </div>
          {connectedEmail ? (
            <div className="shrink-0 text-left sm:text-right">
              <p className="text-xs font-bold text-parc-emerald">● {connectedEmail}</p>
              <div className="mt-2 flex gap-2 sm:justify-end">
                <button onClick={() => void loadInbox()} disabled={loading} className="rounded-full bg-asphalt px-3.5 py-2 text-xs font-black text-white disabled:opacity-50">
                  {loading ? 'Checking…' : 'Check inbox'}
                </button>
                <button onClick={disconnect} className="rounded-full border border-black/10 px-3.5 py-2 text-xs font-bold text-asphalt/60">Disconnect</button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={connect}
              disabled={!scriptReady || !clientId}
              className="min-h-11 shrink-0 rounded-full bg-asphalt px-5 py-2.5 text-sm font-black text-white disabled:cursor-wait disabled:opacity-40"
            >
              Connect Gmail
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/5 pt-3 text-[10px] font-semibold text-asphalt/45">
          <span className="rounded-full bg-parc-emerald/10 px-2.5 py-1 text-parc-emerald">Browser session only</span>
          <span>No email or token stored by PAS</span>
          {profile && (
            <a href={profile.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-asphalt/20 underline-offset-2">
              {profile.sourceTitle} ↗
            </a>
          )}
          {resumeSync?.state && <span>Resume: {resumeSync.state}</span>}
        </div>
      </section>

      {(configError || error) && (
        <div className="rounded-2xl bg-plateau-pink/10 p-4 text-sm font-semibold text-plateau-pink">
          {error ?? configError}
          {(error ?? configError)?.toLowerCase().includes('gmail api') && (
            <span> Enable the Gmail API for the existing PAS Google Cloud project, then reconnect.</span>
          )}
        </div>
      )}

      {!connectedEmail && !loading && (
        <section className="rounded-3xl border border-black/5 bg-white p-6 text-sm leading-relaxed text-asphalt/60 shadow-sm">
          <h3 className="font-display text-lg font-bold text-asphalt">What PAS will access</h3>
          <ul className="mt-3 space-y-2">
            <li>• Search recent Gmail messages for recruiter and interview signals.</li>
            <li>• Read matching messages only inside this browser session.</li>
            <li>• Send a reply only after you review it and press Send.</li>
            <li>• Never mix Gmail permission with the file-only master-resume token.</li>
          </ul>
          <details className="mt-4 border-t border-black/5 pt-3 text-xs">
            <summary className="cursor-pointer font-bold text-asphalt/65">Google setup requirements</summary>
            <p className="mt-2">
              The PAS Google Cloud project must have Gmail API enabled, this domain listed as an authorized JavaScript origin, and your account allowed on the OAuth consent screen.
            </p>
          </details>
        </section>
      )}

      {loading && (
        <div className="py-12 text-center text-sm font-semibold text-asphalt/50">Checking recruiter conversations…</div>
      )}

      {connectedEmail && !loading && messages.length === 0 && !error && (
        <section className="rounded-3xl border border-black/5 bg-white p-8 text-center shadow-sm">
          <div className="text-4xl" aria-hidden>📨</div>
          <h3 className="mt-3 font-display text-lg font-bold text-asphalt">No recruiter messages found</h3>
          <p className="mt-1 text-sm text-asphalt/50">PAS checked the last 120 days. Try Check inbox after a new outreach arrives.</p>
        </section>
      )}

      {connectedEmail && messages.length > 0 && (
        <>
          <ProviderFilter provider={provider} onProvider={setProvider} messages={messages} />
          <ol className="space-y-3">
            {visible.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                replying={replyingTo === conversation.id}
                draft={replyingTo === conversation.id ? draft : ''}
                sent={sentId === conversation.id}
                sending={sending}
                onReply={() => openReply(conversation)}
                onDraft={setDraft}
                onCancel={() => { setReplyingTo(null); setDraft(''); }}
                onSend={() => void sendReply(conversation)}
              />
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

function ProviderFilter({
  provider,
  onProvider,
  messages,
}: {
  provider: RecruiterProvider | 'all';
  onProvider: (provider: RecruiterProvider | 'all') => void;
  messages: RecruiterConversation[];
}) {
  const options: (RecruiterProvider | 'all')[] = ['all', 'email', 'linkedin', 'indeed', 'monster'];
  return (
    <div className="flex gap-1 overflow-x-auto rounded-2xl border border-black/5 bg-white p-1.5 shadow-sm">
      {options.map((option) => {
        const count = option === 'all' ? messages.length : messages.filter((message) => message.provider === option).length;
        return (
          <button
            key={option}
            onClick={() => onProvider(option)}
            aria-pressed={provider === option}
            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold capitalize ${provider === option ? 'bg-asphalt text-white' : 'text-asphalt/50'}`}
          >
            {option} {count}
          </button>
        );
      })}
    </div>
  );
}

function ConversationCard({
  conversation,
  replying,
  draft,
  sent,
  sending,
  onReply,
  onDraft,
  onCancel,
  onSend,
}: {
  conversation: RecruiterConversation;
  replying: boolean;
  draft: string;
  sent: boolean;
  sending: boolean;
  onReply: () => void;
  onDraft: (draft: string) => void;
  onCancel: () => void;
  onSend: () => void;
}) {
  const meta = PROVIDER_META[conversation.provider];
  const platformUrl = conversation.officialReplyUrl ?? meta.fallbackUrl;
  return (
    <li className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${meta.className}`}>{meta.label}</span>
            {conversation.unread && <span className="text-[9px] font-black uppercase tracking-wide text-plateau-pink">New</span>}
            <span className="text-[10px] font-semibold text-asphalt/35">{relativeTime(conversation.receivedAt)}</span>
          </div>
          <h3 className="mt-2 font-bold leading-snug text-asphalt">{conversation.subject}</h3>
          <p className="mt-0.5 text-xs font-semibold text-asphalt/50">{conversation.senderName} · {conversation.senderEmail}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-asphalt/60">{conversation.snippet}</p>
      {conversation.pipelineRecord && (
        <div className="mt-3 rounded-xl bg-jazz-blue/5 px-3 py-2 text-xs text-jazz-blue">
          Linked to <span className="font-bold">{conversation.pipelineRecord.title}</span> at {conversation.pipelineRecord.companyName}
        </div>
      )}
      {sent && <p className="mt-3 text-xs font-bold text-parc-emerald">✓ Reply sent through Gmail</p>}

      {replying ? (
        <div className="mt-4 border-t border-black/5 pt-4">
          <label className="text-[10px] font-black uppercase tracking-wide text-asphalt/40" htmlFor={`reply-${conversation.id}`}>Review reply</label>
          <textarea
            id={`reply-${conversation.id}`}
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            rows={8}
            className="mt-2 w-full resize-y rounded-2xl border border-black/10 bg-snow-white p-3 text-sm leading-relaxed text-asphalt outline-none focus:border-jazz-blue"
          />
          <p className="mt-2 text-[10px] text-asphalt/40">Nothing is sent until you press Send email.</p>
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={onCancel} className="rounded-full border border-black/10 px-4 py-2 text-xs font-bold text-asphalt/60">Cancel</button>
            <button onClick={onSend} disabled={sending || !draft.trim()} className="rounded-full bg-asphalt px-4 py-2 text-xs font-black text-white disabled:opacity-40">
              {sending ? 'Sending…' : 'Send email'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex justify-end border-t border-black/5 pt-3">
          {canReplyByEmail(conversation) ? (
            <button onClick={onReply} className="rounded-full bg-asphalt px-4 py-2 text-xs font-black text-white">Reply in PAS</button>
          ) : (
            <a href={platformUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-asphalt px-4 py-2 text-xs font-black text-white">
              Reply on {meta.label} ↗
            </a>
          )}
        </div>
      )}
    </li>
  );
}

function relativeTime(iso: string): string {
  const hours = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000));
  if (hours < 1) return 'now';
  if (hours < 24) return `${hours}h`;
  if (hours < 24 * 14) return `${Math.round(hours / 24)}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
