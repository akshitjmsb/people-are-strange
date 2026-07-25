'use client';

import { useState } from 'react';

import { domainLabel, typeDef } from '@/lib/categories';
import { reportCompanyUrl } from '@/lib/feedback';
import { linkedinSearchUrl, peopleFor } from '@/lib/people-data';
import { roleSummary } from '@/lib/roles';
import type { AICompany, Person } from '@/lib/types';

interface Props {
  company: AICompany | null;
  onClose: () => void;
  /** Whether this company is in the user's saved shortlist. */
  saved?: boolean;
  /** Toggle the company in/out of the saved shortlist. */
  onToggleSave?: (id: string) => void;
}

/** Slide-up panel with everything we know about one AI company. */
export default function CompanyDetail({ company, onClose, saved = false, onToggleSave }: Props) {
  const [copied, setCopied] = useState(false);

  if (!company) return null;
  const t = typeDef(company.type);

  // The URL already mirrors the open company (deep-link plumbing in page.tsx),
  // so sharing the current address is sharing this exact view.
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: company.name, text: company.oneLiner, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // user dismissed the share sheet — nothing to do
    }
  };

  // Make the jobs badge actionable: careers page if we have one, site if not.
  // NB: `hiring` means "we hold a verified jobs link", not "has open roles" —
  // the copy across the app says so plainly rather than overclaiming.
  const rolesUrl = company.careersUrl ?? company.website;

  // Live board counts where we poll one; `roles.live` is false otherwise, and
  // nothing about open roles is claimed in that case.
  const roles = roleSummary(company);

  // The people layer: a pin is only useful if it turns into a conversation.
  const people = peopleFor(company.id);

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
        className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-h-[82vh] w-full max-w-2xl animate-sheet-up flex-col overflow-hidden rounded-t-3xl border border-black/5 bg-snow-white shadow-2xl"
      >
        {/* colour ribbon by company type */}
        <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: t.color }} />

        <button
          onClick={onClose}
          className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-black/15 transition hover:bg-black/30"
          aria-label="Close"
        />

        <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-2">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
                style={{ backgroundColor: t.color }}
              >
                {t.emoji} {t.label}
              </span>
              {company.hiring && !roles.live && (
                <span className="rounded-full bg-parc-emerald px-2 py-0.5 text-[11px] font-bold text-white">
                  Jobs page
                </span>
              )}
              {roles.live && roles.montreal > 0 && (
                <span className="rounded-full bg-parc-emerald px-2 py-0.5 text-[11px] font-bold text-white">
                  {roles.montreal} open in MTL
                </span>
              )}
            </div>
            <h2 className="font-display text-xl font-extrabold leading-tight text-asphalt">
              {company.name}
            </h2>
            {company.aka && (
              <p className="text-xs font-medium text-asphalt/50">{company.aka}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(company.id)}
                aria-pressed={saved}
                aria-label={saved ? `Remove ${company.name} from saved` : `Save ${company.name}`}
                title={saved ? 'Remove from saved' : 'Save for later'}
                className={`rounded-full p-2 transition ${
                  saved
                    ? 'bg-montroyal-amber/15 text-montroyal-amber'
                    : 'bg-black/5 text-asphalt/50 hover:bg-black/10 hover:text-asphalt'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            )}
            <button
              onClick={share}
              aria-label={`Share ${company.name}`}
              title="Share this company"
              className="relative rounded-full bg-black/5 p-2 text-asphalt/50 transition hover:bg-black/10 hover:text-asphalt"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="m8.6 10.6 6.8-4.2M8.6 13.4l6.8 4.2" />
              </svg>
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-asphalt px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                  Link copied
                </span>
              )}
            </button>
            <button
              onClick={onClose}
              className="rounded-full bg-black/5 px-3 py-1.5 text-sm font-medium text-asphalt/70 transition hover:bg-black/10"
            >
              Close
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-8">
          <p className="text-[15px] font-medium leading-snug text-asphalt/90">
            {company.oneLiner}
          </p>

          {(company.problem || company.solution) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {company.problem && (
                <Block label="The problem" accent={t.color}>
                  {company.problem}
                </Block>
              )}
              {company.solution && (
                <Block label="What they build" accent={t.color}>
                  {company.solution}
                </Block>
              )}
            </div>
          )}

          {/* fact grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {company.founded && <Fact label="Founded" value={String(company.founded)} />}
            {company.headcount && <Fact label="Team" value={company.headcount} />}
            {company.funding?.totalRaised && (
              <Fact label="Raised" value={company.funding.totalRaised} />
            )}
            {company.funding?.lastRound && (
              <Fact label="Last round" value={company.funding.lastRound} />
            )}
            {company.neighborhood && <Fact label="Area" value={company.neighborhood} />}
            {company.status && company.status !== 'active' && (
              <Fact label="Status" value={company.status} />
            )}
          </div>

          {company.aiDomains?.length > 0 && (
            <Chips
              title={
                company.industry === 'aerospace'
                  ? 'Aerospace focus'
                  : company.industry === 'energy'
                    ? 'Energy focus'
                    : company.industry === 'marine'
                      ? 'Marine focus'
                      : 'AI focus'
              }
              items={company.aiDomains.map(domainLabel)}
              accent={t.color}
            />
          )}
          {company.industries && company.industries.length > 0 && (
            <Chips title="Industries" items={company.industries} muted />
          )}

          {company.notable && (
            <Block label="Notable" accent={t.color}>
              {company.notable}
            </Block>
          )}

          {people.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <SectionTitle>People to know</SectionTitle>
                <span className="text-[11px] font-semibold text-asphalt/35">
                  {people.length} {people.length === 1 ? 'contact' : 'contacts'}
                </span>
              </div>
              <ul className="space-y-1.5">
                {people.map((p) => (
                  <PersonRow key={p.id} person={p} companyName={company.name} accent={t.color} />
                ))}
              </ul>
              <p className="mt-2 text-[11px] leading-snug text-asphalt/40">
                Profile links are built from name patterns and may not all resolve —{' '}
                <a
                  href={linkedinSearchUrl(company.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  search this company on LinkedIn
                </a>{' '}
                if one misses.
              </p>
            </div>
          )}

          {company.funding?.investors && company.funding.investors.length > 0 && (
            <div>
              <SectionTitle>Investors</SectionTitle>
              <p className="text-sm text-asphalt/80">{company.funding.investors.join(' · ')}</p>
            </div>
          )}

          <div>
            <SectionTitle>Location</SectionTitle>
            {company.address ? (
              <p className="text-sm text-asphalt/80">📍 {company.address}</p>
            ) : (
              <p className="text-sm text-asphalt/80">
                📍 {company.neighborhood ?? 'Montréal'}{' '}
                <span className="text-asphalt/45">
                  · approximate — neighbourhood-level only, exact address not public
                </span>
              </p>
            )}
          </div>

          {/* Live board readout — only rendered when a board is actually
              polled, so "nothing open" is a fact rather than an absence. */}
          {roles.live && (
            <div className="rounded-2xl bg-black/[0.03] px-3.5 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-bold text-asphalt">{roles.detail}</span>
                {roles.freshness && (
                  <span className="shrink-0 text-[11px] font-semibold text-asphalt/45">
                    {roles.freshness}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {company.hiring && rolesUrl && (
              <a
                href={rolesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-parc-emerald px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
              >
                {roles.live && roles.montreal > 0
                  ? `See ${roles.montreal} open role${roles.montreal === 1 ? '' : 's'} ↗`
                  : 'See open roles ↗'}
              </a>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
                style={{ backgroundColor: t.color }}
              >
                Visit site ↗
              </a>
            )}
            {company.linkedin && (
              <a
                href={company.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-black/5 px-4 py-2 text-sm font-semibold text-asphalt/80 transition hover:bg-black/10"
              >
                LinkedIn ↗
              </a>
            )}
          </div>

          {company.sources && company.sources.length > 0 && (
            <p className="pt-1 text-[11px] text-asphalt/40">
              Sources:{' '}
              {company.sources.map((s, i) => (
                <span key={s}>
                  {i > 0 && ', '}
                  <a href={s} target="_blank" rel="noopener noreferrer" className="underline">
                    {hostOf(s)}
                  </a>
                </span>
              ))}
            </p>
          )}

          {/* freshness + community fix loop */}
          <p className="text-[11px] text-asphalt/40">
            {company.verifiedAt && <>Data verified {company.verifiedAt} · </>}
            Spotted something wrong or stale?{' '}
            <a
              href={reportCompanyUrl(company)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
            >
              Suggest an edit
            </a>
          </p>
        </div>
      </section>
    </>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'link';
  }
}

/** Initials for the avatar chip — first letter of the first and last word. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/**
 * One person, as a single tap target — the whole row opens their LinkedIn so
 * it stays comfortable on a phone. People who've left are muted and badged
 * rather than hidden: still useful context, just not a live lead.
 */
function PersonRow({
  person,
  companyName,
  accent,
}: {
  person: Person;
  companyName: string;
  accent: string;
}) {
  const href = person.former
    ? linkedinSearchUrl(person.name)
    : person.linkedinUrl;

  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-3 rounded-2xl bg-black/[0.03] px-3 py-2.5 transition hover:bg-black/[0.07] active:bg-black/[0.09] ${
          person.former ? 'opacity-60' : ''
        }`}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
          aria-hidden
        >
          {initialsOf(person.name)}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold text-asphalt">{person.name}</span>
            {person.former && (
              <span className="shrink-0 rounded-full bg-black/10 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-asphalt/55">
                Former
              </span>
            )}
          </span>
          <span className="block text-xs font-medium leading-snug text-asphalt/60">
            {person.role}
          </span>
          {person.note && (
            <span className="mt-0.5 block text-[11px] leading-snug text-asphalt/45">
              {person.note}
            </span>
          )}
        </span>

        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A66C2] text-white"
          aria-label={
            person.former
              ? `Search LinkedIn for ${person.name}`
              : `Open ${person.name} on LinkedIn — ${person.role} at ${companyName}`
          }
          title={person.former ? 'Search on LinkedIn' : 'Open LinkedIn profile'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.85V21H9z" />
          </svg>
        </span>
      </a>
    </li>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-1 text-[11px] font-bold uppercase tracking-wider text-asphalt/45">
      {children}
    </h3>
  );
}

function Block({
  label,
  accent,
  children,
}: {
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-black/[0.03] p-3">
      <h3 className="mb-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: accent }}>
        {label}
      </h3>
      <p className="text-sm leading-snug text-asphalt/85">{children}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-black/[0.03] px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-asphalt/40">{label}</div>
      <div className="text-sm font-semibold text-asphalt">{value}</div>
    </div>
  );
}

function Chips({
  title,
  items,
  accent,
  muted,
}: {
  title: string;
  items: string[];
  accent?: string;
  muted?: boolean;
}) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span
            key={it}
            className="rounded-full px-2.5 py-1 text-xs font-semibold"
            style={
              muted
                ? { backgroundColor: 'rgba(0,0,0,0.05)', color: 'rgba(45,52,54,0.75)' }
                : { backgroundColor: `${accent}1a`, color: accent }
            }
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
