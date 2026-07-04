'use client';

import { domainLabel, typeDef } from '@/lib/categories';
import type { AICompany } from '@/lib/types';

interface Props {
  company: AICompany | null;
  onClose: () => void;
}

/** Slide-up panel with everything we know about one AI company. */
export default function CompanyDetail({ company, onClose }: Props) {
  if (!company) return null;
  const t = typeDef(company.type);

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
              {company.hiring && (
                <span className="rounded-full bg-parc-emerald px-2 py-0.5 text-[11px] font-bold text-white">
                  Hiring
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
          <button
            onClick={onClose}
            className="shrink-0 rounded-full bg-black/5 px-3 py-1.5 text-sm font-medium text-asphalt/70 transition hover:bg-black/10"
          >
            Close
          </button>
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

          <div className="flex flex-wrap gap-2 pt-1">
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
