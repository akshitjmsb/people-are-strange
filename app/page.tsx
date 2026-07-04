'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

import CompanyDetail from '@/components/CompanyDetail';
import FilterChips from '@/components/FilterChips';
import IndustryToggle, { type IndustrySelection } from '@/components/IndustryToggle';
import SearchBar from '@/components/SearchBar';
import { typeOrderFor } from '@/lib/categories';
import { loadCompanies } from '@/lib/companies';
import type { AICompany, CompanyType } from '@/lib/types';

/** A company's industry, defaulting legacy rows to 'ai'. */
const industryOf = (c: AICompany) => c.industry ?? 'ai';

// Map touches browser-only APIs (WebGL, maplibre) — load it client-side only.
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default function Page() {
  const [all, setAll] = useState<AICompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'db' | 'local' | null>(null);

  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState<IndustrySelection>('all');
  const [activeTypes, setActiveTypes] = useState<Set<CompanyType>>(new Set());
  const [selected, setSelected] = useState<AICompany | null>(null);

  useEffect(() => {
    let alive = true;
    loadCompanies().then((res) => {
      if (!alive) return;
      setAll(res.companies);
      setDataSource(res.source);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  // count per industry across the whole dataset (for the top-level toggle)
  const industryCounts = useMemo(() => {
    const c: Record<IndustrySelection, number> = { all: all.length, ai: 0, aerospace: 0 };
    for (const co of all) c[industryOf(co)] += 1;
    return c;
  }, [all]);

  // the dataset narrowed to the selected industry (drives chips + counts)
  const inIndustry = useMemo(
    () => (industry === 'all' ? all : all.filter((co) => industryOf(co) === industry)),
    [all, industry],
  );

  // count per type within the selected industry (for the chips)
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const co of inIndustry) c[co.type] = (c[co.type] ?? 0) + 1;
    return c;
  }, [inIndustry]);

  // apply search + type filters within the selected industry
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inIndustry.filter((co) => {
      if (activeTypes.size > 0 && !activeTypes.has(co.type)) return false;
      if (!q) return true;
      return (
        co.name.toLowerCase().includes(q) ||
        co.aka?.toLowerCase().includes(q) ||
        co.oneLiner.toLowerCase().includes(q) ||
        co.neighborhood?.toLowerCase().includes(q) ||
        co.aiDomains.some((d) => d.toLowerCase().includes(q)) ||
        co.industries?.some((i) => i.toLowerCase().includes(q)) ||
        co.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [inIndustry, query, activeTypes]);

  // dropdown suggestions: name matches float above everything else
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const score = (co: AICompany) => {
      const name = co.name.toLowerCase();
      if (name.startsWith(q)) return 0;
      if (name.includes(q)) return 1;
      if (co.aka?.toLowerCase().includes(q)) return 2;
      return 3;
    };
    return [...filtered].sort((a, b) => score(a) - score(b)).slice(0, 6);
  }, [filtered, query]);

  const toggleType = (t: CompanyType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  // switching industries clears any now-irrelevant type chips
  const changeIndustry = (next: IndustrySelection) => {
    setIndustry(next);
    setActiveTypes(new Set());
  };

  const showEmpty = !loading && filtered.length === 0;

  return (
    <main className="relative h-full w-full">
      <Map companies={filtered} selectedId={selected?.id ?? null} onSelect={setSelected} />

      {/* Montreal-palette hairline across the very top */}
      <div aria-hidden className="mtl-hairline pointer-events-none absolute inset-x-0 top-0 z-30 h-[3px]" />

      {/* top chrome */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2.5 px-3 pt-[max(0.85rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          <IndustryToggle value={industry} counts={industryCounts} onChange={changeIndustry} />
          {dataSource === 'local' && <OfflineBadge />}
        </div>
        <SearchBar
          value={query}
          onChange={setQuery}
          resultCount={filtered.length}
          suggestions={suggestions}
          onPick={setSelected}
        />
        <FilterChips
          active={activeTypes}
          counts={counts}
          onToggle={toggleType}
          onClear={() => setActiveTypes(new Set())}
          typeOrder={typeOrderFor(industry)}
        />
      </div>

      {/* brand mark + honesty legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10">
        <p className="font-display text-xs font-extrabold tracking-tight text-asphalt/80 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">
          People Are Strange
          <span className="mtl-gradient-text ml-1">MTL</span>
        </p>
        <p className="font-display text-[10px] font-bold text-asphalt/55 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">
          Montreal&apos;s AI &amp; aerospace scene, mapped
        </p>
        <div className="mt-1.5 flex items-center gap-3 rounded-lg bg-white/70 px-2 py-1 backdrop-blur-sm">
          <span className="flex items-center gap-1 text-[10px] font-semibold text-asphalt/70">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-asphalt/70" />
            exact address
          </span>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-asphalt/70">
            <span className="inline-block h-2.5 w-2.5 rounded-full border-[1.5px] border-asphalt/70 bg-transparent" />
            approx. area
          </span>
        </div>
      </div>

      {loading && <LoadingOverlay />}
      {showEmpty && <EmptyState hasData={all.length > 0} />}

      <CompanyDetail company={selected} onClose={() => setSelected(null)} />
    </main>
  );
}

function MapSkeleton() {
  return <div className="h-full w-full bg-snow-white" />;
}

/** Shown when the live DB was unreachable and the bundled dataset kicked in. */
function OfflineBadge() {
  return (
    <span
      className="pointer-events-auto inline-flex items-center gap-1.5 self-start rounded-full border border-montroyal-amber/30 bg-white/90 px-2.5 py-1.5 text-[10px] font-bold text-asphalt/70 shadow-sm backdrop-blur-xl"
      title="The live database is unreachable — showing the bundled dataset."
    >
      <span className="h-1.5 w-1.5 rounded-full bg-montroyal-amber" aria-hidden />
      offline data
    </span>
  );
}

function LoadingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/85 px-5 py-3 shadow-lg backdrop-blur-xl">
        <span className="flex items-center gap-1" aria-hidden>
          <span className="h-2 w-2 animate-bounce rounded-full bg-plateau-pink" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-montroyal-amber [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-jazz-blue [animation-delay:240ms]" />
        </span>
        <span className="text-sm font-semibold text-asphalt/80">Mapping Montréal…</span>
      </div>
    </div>
  );
}

function EmptyState({ hasData }: { hasData: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
      <div className="max-w-sm rounded-3xl border border-black/5 bg-white/90 p-6 text-center shadow-xl backdrop-blur-xl">
        <div className="mb-2 text-4xl">🛰️</div>
        <h2 className="text-lg font-bold text-asphalt">Nothing matches</h2>
        <p className="mt-1 text-sm text-asphalt/60">
          {hasData
            ? 'No companies match your search or filters. Try clearing them.'
            : 'Loading the Montreal tech scene…'}
        </p>
      </div>
    </div>
  );
}
