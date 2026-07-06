'use client';

import { useState } from 'react';

import { INDUSTRY_META, typeDef } from '@/lib/categories';
import { SORT_LABELS, sortCompanies, type SortKey, type SortDir } from '@/lib/sort';
import type { AICompany, Industry } from '@/lib/types';

interface Props {
  companies: AICompany[];
  selectedId: string | null;
  /** Open the detail panel for a company. */
  onSelect: (c: AICompany) => void;
  /** Switch to the map, centred on a company. */
  onShowOnMap: (c: AICompany) => void;
  /** Pixels of top chrome (industry toggle + search + chips) to clear. */
  topInset: number;
}

const industryOf = (c: AICompany): Industry => c.industry ?? 'ai';

// Shared column grid so the header and every row line up on desktop. Mobile
// rows fall back to flex (the extra columns are hidden there).
const GRID =
  'sm:grid sm:grid-cols-[minmax(0,1fr)_6.5rem_4rem_5.5rem_5.5rem_2.25rem] sm:items-center sm:gap-3';

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
  topInset,
}: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      // sensible default direction per column: text ascending, metrics descending
      setSortDir(key === 'name' || key === 'industry' ? 'asc' : 'desc');
    }
  };

  const rows = sortCompanies(companies, sortKey, sortDir);
  const arrow = sortDir === 'asc' ? '↑' : '↓';

  return (
    <div
      className="fixed inset-0 z-10 overflow-y-auto bg-snow-white"
      style={{ paddingTop: topInset, paddingBottom: '7rem' }}
    >
      <div className="mx-auto w-full max-w-4xl px-3">
        {/* result count */}
        <div className="flex items-center justify-between px-1 pb-2 pt-1">
          <p className="text-[11px] font-semibold text-asphalt/55">
            <span className="font-bold tabular-nums text-asphalt/75">{rows.length}</span>{' '}
            {rows.length === 1 ? 'company' : 'companies'}
          </p>
        </div>

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
                onSelect={onSelect}
                onShowOnMap={onShowOnMap}
              />
            ))}
          </ul>
        )}
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
  onSelect,
  onShowOnMap,
}: {
  company: AICompany;
  selected: boolean;
  onSelect: (c: AICompany) => void;
  onShowOnMap: (c: AICompany) => void;
}) {
  const t = typeDef(c.type);
  const ind = INDUSTRY_META[industryOf(c)];

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
                  Hiring
                </span>
              )}
            </span>
            <span className="block truncate text-[11px] text-asphalt/50">
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

        {/* jump-to-map */}
        <button
          onClick={() => onShowOnMap(c)}
          aria-label={`Show ${c.name} on the map`}
          title="Show on map"
          className="shrink-0 rounded-full bg-black/5 p-1.5 text-asphalt/50 transition hover:bg-black/10 hover:text-asphalt"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </button>
      </div>
    </li>
  );
}
