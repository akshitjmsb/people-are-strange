'use client';

import { useState } from 'react';

import { INDUSTRY_META, typeDef } from '@/lib/categories';
import { getCity } from '@/lib/cities';
import { suggestCompanyUrl } from '@/lib/feedback';
import { distanceKm, formatDistance, type LatLng } from '@/lib/geo';
import { roleSummary } from '@/lib/roles';
import { SORT_LABELS, sortCompanies, type SortKey, type SortDir } from '@/lib/sort';
import type { AICompany, Industry } from '@/lib/types';

const city = getCity();

interface Props {
  companies: AICompany[];
  selectedId: string | null;
  /** Open the detail panel for a company. */
  onSelect: (c: AICompany) => void;
  /** Switch to the map, centred on a company. */
  onShowOnMap: (c: AICompany) => void;
  /** Download the current list as CSV. */
  onExport: () => void;
  /** Pixels of top chrome (industry toggle + search + chips) to clear. */
  topInset: number;
  /** Ids of companies in the user's saved shortlist. */
  savedIds: Set<string>;
  /** Toggle a company in/out of the saved shortlist. */
  onToggleSave: (id: string) => void;
}

const industryOf = (c: AICompany): Industry => c.industry ?? 'ai';

// Shared column grid so the header and every row line up on desktop. Mobile
// rows fall back to flex (the extra columns are hidden there).
const GRID =
  'sm:grid sm:grid-cols-[minmax(0,1fr)_6.5rem_4rem_5.5rem_5.5rem_4.25rem] sm:items-center sm:gap-3';

const SORT_ORDER: SortKey[] = ['name', 'industry', 'founded', 'funding', 'headcount'];

/**
 * Sortable, filterable table alternative to the map. It receives the already
 * filtered companies (same industry toggle, type chips and search as the map),
 * and adds client-side sorting. A row opens the detail panel; the pin button
 * jumps back to the map centred on that company.
 */
export default function ListView({
  companies,
  selectedId,
  onSelect,
  onShowOnMap,
  onExport,
  topInset,
  savedIds,
  onToggleSave,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // "near me": the user's location once granted, and the request lifecycle
  const [origin, setOrigin] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      // sensible default direction per column: text ascending, metrics descending
      setSortDir(key === 'name' || key === 'industry' ? 'asc' : 'desc');
    }
  };

  // Sort by walking distance from the user. Asks for location once; after
  // that the chip just re-activates the sort.
  const nearMe = () => {
    setGeoError(null);
    if (origin) {
      setSortKey('distance');
      setSortDir('asc');
      return;
    }
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoError("This device doesn't expose location.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortKey('distance');
        setSortDir('asc');
      },
      () => {
        setLocating(false);
        setGeoError('Location was blocked — allow it to sort by distance.');
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const rows = sortCompanies(companies, sortKey, sortDir, origin);
  const arrow = sortDir === 'asc' ? '↑' : '↓';
  const nearActive = sortKey === 'distance' && !!origin;

  return (
    <div
      className="fixed inset-0 z-10 overflow-y-auto bg-snow-white"
      style={{ paddingTop: topInset, paddingBottom: '7rem' }}
    >
      <div className="mx-auto w-full max-w-4xl px-3">
        {/* result count + near-me + export */}
        <div className="flex items-center justify-between gap-2 px-1 pb-2 pt-1">
          <p className="min-w-0 text-[11px] font-semibold text-asphalt/55">
            <span className="font-bold tabular-nums text-asphalt/75">{rows.length}</span>{' '}
            {rows.length === 1 ? 'company' : 'companies'}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={nearMe}
              disabled={locating}
              aria-pressed={nearActive}
              title="Sort by distance from you"
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold shadow-sm transition disabled:opacity-60 ${
                nearActive
                  ? 'border-jazz-blue bg-jazz-blue text-white'
                  : 'border-black/5 bg-white text-asphalt/70 hover:bg-black/[0.03] hover:text-asphalt'
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              </svg>
              {locating ? 'Locating…' : 'Near me'}
            </button>
            <button
              onClick={onExport}
              disabled={rows.length === 0}
              className="flex items-center gap-1.5 rounded-full border border-black/5 bg-white px-3 py-1.5 text-[11px] font-bold text-asphalt/70 shadow-sm transition hover:bg-black/[0.03] hover:text-asphalt disabled:opacity-40"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {geoError && (
          <p className="px-1 pb-2 text-[11px] font-semibold text-plateau-pink">{geoError}</p>
        )}

        {/* mobile sort chips */}
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SORT_ORDER.map((key) => {
            const active = key === sortKey;
            return (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                aria-pressed={active}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm transition ${
                  active
                    ? 'border-asphalt bg-asphalt text-snow-white'
                    : 'border-black/5 bg-white text-asphalt/70'
                }`}
              >
                {SORT_LABELS[key]}
                {active && <span className="ml-1">{arrow}</span>}
              </button>
            );
          })}
        </div>

        {/* desktop column header (click to sort) */}
        <div
          className={`sticky top-0 z-10 mb-1 hidden border-b border-black/10 bg-snow-white/95 px-3 py-2 backdrop-blur ${GRID}`}
        >
          <HeaderCell label="Company" k="name" sortKey={sortKey} arrow={arrow} onSort={toggleSort} />
          <HeaderCell label="Industry" k="industry" sortKey={sortKey} arrow={arrow} onSort={toggleSort} />
          <HeaderCell label="Founded" k="founded" sortKey={sortKey} arrow={arrow} onSort={toggleSort} align="right" />
          <HeaderCell label="Funding" k="funding" sortKey={sortKey} arrow={arrow} onSort={toggleSort} align="right" />
          <HeaderCell label="Team" k="headcount" sortKey={sortKey} arrow={arrow} onSort={toggleSort} align="right" />
          <span aria-hidden />
        </div>

        {rows.length === 0 ? (
          <div className="mt-16 text-center">
            <div className="mb-2 text-4xl">🔍</div>
            <p className="text-sm font-semibold text-asphalt/60">
              No companies match your filters.
            </p>
          </div>
        ) : (
          <ul className="space-y-1.5 sm:space-y-0">
            {rows.map((c) => (
              <Row
                key={c.id}
                company={c}
                selected={c.id === selectedId}
                saved={savedIds.has(c.id)}
                origin={origin}
                onSelect={onSelect}
                onShowOnMap={onShowOnMap}
                onToggleSave={onToggleSave}
              />
            ))}
          </ul>
        )}

        {/* the audience knows the scene — let them close the gaps */}
        <p className="px-1 pb-2 pt-5 text-center text-xs font-semibold text-asphalt/45">
          Know a {city.name} company that belongs on this map?{' '}
          <a
            href={suggestCompanyUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-asphalt/70 underline"
          >
            Suggest it
          </a>
        </p>
      </div>
    </div>
  );
}

function HeaderCell({
  label,
  k,
  sortKey,
  arrow,
  onSort,
  align = 'left',
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  arrow: string;
  onSort: (k: SortKey) => void;
  align?: 'left' | 'right';
}) {
  const active = k === sortKey;
  return (
    <button
      onClick={() => onSort(k)}
      className={`text-[11px] font-bold uppercase tracking-wider transition hover:text-asphalt ${
        active ? 'text-asphalt' : 'text-asphalt/40'
      } ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {label}
      <span className="ml-1 inline-block w-2">{active ? arrow : ''}</span>
    </button>
  );
}

function Row({
  company: c,
  selected,
  saved,
  origin,
  onSelect,
  onShowOnMap,
  onToggleSave,
}: {
  company: AICompany;
  selected: boolean;
  saved: boolean;
  origin: LatLng | null;
  onSelect: (c: AICompany) => void;
  onShowOnMap: (c: AICompany) => void;
  onToggleSave: (id: string) => void;
}) {
  const t = typeDef(c.type);
  const ind = INDUSTRY_META[industryOf(c)];
  const away = origin ? formatDistance(distanceKm(origin, c)) : null;

  return (
    <li>
      <div
        className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition sm:rounded-none sm:border-x-0 sm:border-t-0 sm:border-b sm:border-black/[0.06] sm:px-3 ${GRID} ${
          selected
            ? 'border-asphalt/40 bg-asphalt/[0.04] sm:bg-asphalt/[0.04]'
            : 'border-black/5 bg-white hover:bg-black/[0.02] sm:bg-transparent'
        }`}
      >
        {/* company (name + type + mobile meta) */}
        <button
          onClick={() => onSelect(c)}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: t.color }}
            aria-hidden
          />
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-sm font-bold text-asphalt">{c.name}</span>
              {c.hiring && (
                <span className="shrink-0 rounded-full bg-parc-emerald/15 px-1.5 py-px text-[9px] font-black uppercase text-parc-emerald">
                  {roleSummary(c).badge}
                </span>
              )}
            </span>
            <span className="block truncate text-[11px] text-asphalt/50">
              {away && <span className="font-bold text-jazz-blue">{away} · </span>}
              {t.emoji} {t.label}
              {c.neighborhood ? ` · ${c.neighborhood}` : ''}
            </span>
            {/* mobile-only metrics line */}
            <span className="mt-0.5 flex flex-wrap gap-x-2.5 text-[11px] font-semibold text-asphalt/45 sm:hidden">
              {c.founded && <span>{c.founded}</span>}
              {c.funding?.totalRaised && (
                <span className="text-parc-emerald/90">{c.funding.totalRaised}</span>
              )}
              {c.headcount && <span>{c.headcount}</span>}
            </span>
          </span>
        </button>

        {/* desktop columns */}
        <span className="hidden sm:block">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ backgroundColor: `${ind.color}1a`, color: ind.color }}
          >
            {ind.emoji} {ind.label}
          </span>
        </span>
        <span className="hidden text-right text-xs font-semibold tabular-nums text-asphalt/70 sm:block">
          {c.founded ?? '—'}
        </span>
        <span className="hidden text-right text-xs font-bold tabular-nums text-parc-emerald sm:block">
          {c.funding?.totalRaised ?? <span className="font-semibold text-asphalt/25">—</span>}
        </span>
        <span className="hidden text-right text-xs font-semibold tabular-nums text-asphalt/70 sm:block">
          {c.headcount ?? '—'}
        </span>

        {/* save + jump-to-map */}
        <span className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onToggleSave(c.id)}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${c.name} from saved` : `Save ${c.name}`}
            title={saved ? 'Remove from saved' : 'Save for later'}
            className={`rounded-full p-1.5 transition ${
              saved
                ? 'bg-montroyal-amber/15 text-montroyal-amber'
                : 'bg-black/5 text-asphalt/50 hover:bg-black/10 hover:text-asphalt'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
          <button
            onClick={() => onShowOnMap(c)}
            aria-label={`Show ${c.name} on the map`}
            title="Show on map"
            className="rounded-full bg-black/5 p-1.5 text-asphalt/50 transition hover:bg-black/10 hover:text-asphalt"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </button>
        </span>
      </div>
    </li>
  );
}
