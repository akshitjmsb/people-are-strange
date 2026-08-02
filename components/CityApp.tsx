'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';

import CompanyDetail from '@/components/CompanyDetail';
import Dashboard from '@/components/Dashboard';
import FilterChips from '@/components/FilterChips';
import HiringToggle from '@/components/HiringToggle';
import IndustryToggle, { type IndustrySelection } from '@/components/IndustryToggle';
import ListView from '@/components/ListView';
import NeighborhoodPanel from '@/components/NeighborhoodPanel';
import NeighborhoodSummary from '@/components/NeighborhoodSummary';
import SavedToggle from '@/components/SavedToggle';
import SearchBar from '@/components/SearchBar';
import ViewSwitcher, { type ViewMode } from '@/components/ViewSwitcher';
import { useCategories } from '@/lib/use-categories';
import { loadCompanies } from '@/lib/companies';
import { companiesToCsv, downloadCsv } from '@/lib/csv';
import { suggestCompanyUrl } from '@/lib/feedback';
import { useSavedCompanies } from '@/lib/saved';
import { fold } from '@/lib/text';
import {
  buildNeighborhoodClusters,
  canonicalNeighborhood,
  neighborhoodSlug,
  resolveNeighborhoodSlug,
} from '@/lib/neighborhoods';
import { buildEcosystemStats } from '@/lib/stats';
import { useCity, useCityId } from '@/lib/city-context';
import type { AICompany, CompanyType, Industry } from '@/lib/types';

/** A company's industry, defaulting legacy rows to the city's first industry. */
const industryOf = (c: AICompany, fallback: Industry) => c.industry ?? fallback;

/** True when a company belongs to an industry lens — its primary industry, or
 *  any of its secondaryIndustries (e.g. an AI-native drug-discovery startup
 *  matches both 'ai' and 'lifesci'). */
const matchesIndustry = (c: AICompany, ind: Industry, fallback: Industry) =>
  industryOf(c, fallback) === ind || c.secondaryIndustries?.includes(ind) === true;

// Map touches browser-only APIs (WebGL, maplibre) — load it client-side only.
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default function CityApp() {
  const city = useCity();
  const cityId = useCityId();
  const { AREA_ACCENT, COMPANY_TYPES, typeOrderFor } = useCategories();
  const INDUSTRIES: Industry[] = city.industries;
  const fallbackIndustry = city.industries[0];
  const isIndustry = (v: string): v is Industry => (INDUSTRIES as string[]).includes(v);
  const isCompanyType = (v: string): v is CompanyType => v in COMPANY_TYPES;
  const [all, setAll] = useState<AICompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'db' | 'local' | null>(null);

  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState<IndustrySelection>('all');
  const [activeTypes, setActiveTypes] = useState<Set<CompanyType>>(new Set());
  const [hiringOnly, setHiringOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [selected, setSelected] = useState<AICompany | null>(null);

  // star-shortlist (localStorage) — one instance, shared by every star button
  const { saved, toggleSaved } = useSavedCompanies();

  // additive views
  const [view, setView] = useState<ViewMode>('map');
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [areasOpen, setAreasOpen] = useState(false);
  const [activeArea, setActiveArea] = useState<string | null>(null);

  // deep-link plumbing: `urlReady` gates the URL writer until the initial read
  // is done; `pending` holds params that can't resolve until data has loaded.
  const [urlReady, setUrlReady] = useState(false);
  const pending = useRef<{ company?: string; neighborhood?: string }>({});

  // measured height of the top chrome, so the list view can clear it exactly
  const chromeRef = useRef<HTMLDivElement>(null);
  const [topInset, setTopInset] = useState(184);

  // Restore view state from the URL on first paint. Data-dependent params
  // (company, neighborhood) are stashed in `pending` and applied once loaded.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);

    const ind = p.get('industry');
    if (ind && isIndustry(ind)) setIndustry(ind);

    const types = (p.get('type') ?? '').split(',').filter(isCompanyType);
    if (types.length) setActiveTypes(new Set(types));

    const q = p.get('q');
    if (q) setQuery(q);

    if (p.get('view') === 'list') setView('list');
    if (p.get('hiring') === '1') setHiringOnly(true);
    if (p.get('saved') === '1') setSavedOnly(true);

    pending.current = {
      company: p.get('company') ?? undefined,
      neighborhood: p.get('neighborhood') ?? undefined,
    };

    setUrlReady(true);
    // Runs once on mount by design; the guards are recreated each render and
    // would turn this into a per-render effect if listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let alive = true;
    loadCompanies(cityId).then((res) => {
      if (!alive) return;
      setAll(res.companies);
      setDataSource(res.source);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [cityId]);

  // Apply the data-dependent deep-link params once companies have loaded.
  useEffect(() => {
    if (!all.length) return;
    const { company, neighborhood } = pending.current;
    if (company) {
      const c = all.find((x) => x.id === company);
      if (c) setSelected(c);
    }
    if (neighborhood) {
      const name = resolveNeighborhoodSlug(city, neighborhood, all);
      if (name) setActiveArea(name);
    }
    pending.current = {};
  }, [all, city]);

  // keep the list view's top padding in sync with the actual chrome height
  useEffect(() => {
    const el = chromeRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setTopInset(el.offsetHeight + 10));
    ro.observe(el);
    setTopInset(el.offsetHeight + 10);
    return () => ro.disconnect();
  }, []);

  // Mirror the view state into the URL (replaceState — no history spam), so the
  // current map/list, filters, search, area and open company are shareable.
  useEffect(() => {
    if (!urlReady) return;
    const p = new URLSearchParams();
    if (industry !== 'all') p.set('industry', industry);
    if (activeTypes.size) p.set('type', [...activeTypes].join(','));
    if (activeArea) p.set('neighborhood', neighborhoodSlug(activeArea));
    if (query.trim()) p.set('q', query.trim());
    if (hiringOnly) p.set('hiring', '1');
    if (savedOnly) p.set('saved', '1');
    if (view === 'list') p.set('view', 'list');
    if (selected) p.set('company', selected.id);
    const qs = p.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [urlReady, industry, activeTypes, activeArea, query, hiringOnly, savedOnly, view, selected]);

  // count per industry across the whole dataset (for the top-level toggle).
  // A cross-listed company (secondaryIndustries) increments every lens it
  // belongs to, so these can sum to more than all.length — intentional.
  const industryCounts = useMemo(() => {
    const c: Record<string, number> = { all: all.length };
    for (const ind of INDUSTRIES) c[ind] = 0;
    for (const co of all) {
      const primary = industryOf(co, fallbackIndustry);
      c[primary] = (c[primary] ?? 0) + 1;
      for (const ind of co.secondaryIndustries ?? []) c[ind] = (c[ind] ?? 0) + 1;
    }
    return c;
  }, [all]);

  // the dataset narrowed to the selected industry (drives chips + counts)
  const inIndustry = useMemo(
    () => (industry === 'all' ? all : all.filter((co) => matchesIndustry(co, industry, fallbackIndustry))),
    [all, industry],
  );

  // neighborhood clusters within the current industry lens
  const clusters = useMemo(() => buildNeighborhoodClusters(city, inIndustry), [city, inIndustry]);
  const activeCluster = useMemo(
    () => (activeArea ? clusters.find((c) => c.name === activeArea) ?? null : null),
    [clusters, activeArea],
  );

  // count per type within the selected industry (for the chips)
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const co of inIndustry) c[co.type] = (c[co.type] ?? 0) + 1;
    return c;
  }, [inIndustry]);

  // number of companies hiring within the current industry lens (for the chip)
  const hiringCount = useMemo(
    () => inIndustry.reduce((n, co) => n + (co.hiring ? 1 : 0), 0),
    [inIndustry],
  );

  // number of saved companies within the current industry lens (for the chip)
  const savedCount = useMemo(
    () => inIndustry.reduce((n, co) => n + (saved.has(co.id) ? 1 : 0), 0),
    [inIndustry, saved],
  );

  // apply saved + hiring + neighborhood + search + type filters within the
  // industry; matching is accent-insensitive ("energir" finds Énergir)
  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return inIndustry.filter((co) => {
      if (savedOnly && !saved.has(co.id)) return false;
      if (hiringOnly && !co.hiring) return false;
      if (activeArea && canonicalNeighborhood(city, co.neighborhood) !== activeArea) return false;
      if (activeTypes.size > 0 && !activeTypes.has(co.type)) return false;
      if (!q) return true;
      return (
        fold(co.name).includes(q) ||
        (co.aka && fold(co.aka).includes(q)) ||
        fold(co.oneLiner).includes(q) ||
        (co.neighborhood && fold(co.neighborhood).includes(q)) ||
        co.aiDomains.some((d) => fold(d).includes(q)) ||
        co.industries?.some((i) => fold(i).includes(q)) ||
        co.tags?.some((t) => fold(t).includes(q))
      );
    });
  }, [city, inIndustry, query, activeTypes, activeArea, hiringOnly, savedOnly, saved]);

  // dropdown suggestions: name matches float above everything else
  const suggestions = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return [];
    const score = (co: AICompany) => {
      const name = fold(co.name);
      if (name.startsWith(q)) return 0;
      if (name.includes(q)) return 1;
      if (co.aka && fold(co.aka).includes(q)) return 2;
      return 3;
    };
    return [...filtered].sort((a, b) => score(a) - score(b)).slice(0, 6);
  }, [filtered, query]);

  // ecosystem stats for the dashboard (industry lens, ignores search/type)
  const stats = useMemo(
    () => buildEcosystemStats(city, inIndustry, industry === 'all' ? undefined : industry),
    [city, inIndustry, industry],
  );

  const toggleType = (t: CompanyType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  // switching industries clears now-irrelevant type chips + neighborhood
  const changeIndustry = (next: IndustrySelection) => {
    setIndustry(next);
    setActiveTypes(new Set());
    setActiveArea(null);
  };

  // pick a neighborhood cluster: filter to it and show it framed on the map
  const pickNeighborhood = (name: string) => {
    setActiveArea((cur) => (cur === name ? null : name));
    setAreasOpen(false);
    setDashboardOpen(false);
    setSelected(null);
    setView('map');
  };

  // open a company's detail from either view
  const showOnMap = (c: AICompany) => {
    setView('map');
    setSelected(c);
  };

  // export the currently-filtered list as CSV, with a filter-aware filename
  const exportCsv = () => {
    if (!filtered.length) return;
    const parts = [city.csvPrefix];
    if (hiringOnly) parts.push('hiring');
    if (industry !== 'all') parts.push(industry);
    if (activeArea) parts.push(neighborhoodSlug(activeArea));
    parts.push('companies');
    downloadCsv(`${parts.join('-')}.csv`, companiesToCsv(city, filtered));
  };

  const neighborhoodShape = activeCluster
    ? {
        name: activeCluster.name,
        polygon: activeCluster.polygon,
        centroid: activeCluster.centroid,
        color: AREA_ACCENT,
      }
    : null;

  const showEmpty = !loading && view === 'map' && filtered.length === 0;

  return (
    <main className="relative h-full w-full">
      <Map
        companies={filtered}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
        neighborhood={neighborhoodShape}
        neighborhoodBounds={activeCluster?.bounds ?? null}
      />

      {view === 'list' && (
        <ListView
          companies={filtered}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
          onShowOnMap={showOnMap}
          onExport={exportCsv}
          topInset={topInset}
          savedIds={saved}
          onToggleSave={toggleSaved}
        />
      )}

      {/* Montreal-palette hairline across the very top */}
      <div aria-hidden className="mtl-hairline pointer-events-none absolute inset-x-0 top-0 z-30 h-[3px]" />

      {/* top chrome */}
      <div
        ref={chromeRef}
        className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2.5 px-3 pt-[max(0.85rem,env(safe-area-inset-top))]"
      >
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
        <div className="flex items-center gap-2">
          <HiringToggle
            active={hiringOnly}
            count={hiringCount}
            onToggle={() => setHiringOnly((v) => !v)}
          />
          <SavedToggle
            active={savedOnly}
            count={savedCount}
            onToggle={() => setSavedOnly((v) => !v)}
          />
          <div className="min-w-0 flex-1">
            <FilterChips
              active={activeTypes}
              counts={counts}
              onToggle={toggleType}
              onClear={() => setActiveTypes(new Set())}
              typeOrder={typeOrderFor(industry)}
            />
          </div>
        </div>
      </div>

      {/* brand mark + honesty legend (map view only; hidden while a cluster
          summary card occupies the bottom so the corner doesn't clutter) */}
      {view === 'map' && !activeCluster && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-10">
          <p className="font-display text-xs font-extrabold tracking-tight text-asphalt/80 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">
            People Are <span className="mtl-gradient-text">Strange</span>
          </p>
          <p className="font-display text-[10px] font-bold text-asphalt/55 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">
            {city.tagline}
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
      )}

      {/* active neighborhood cluster readout */}
      {activeCluster && (
        <NeighborhoodSummary cluster={activeCluster} onClear={() => setActiveArea(null)} />
      )}

      {/* bottom view switcher */}
      <ViewSwitcher
        view={view}
        onView={setView}
        onOpenAreas={() => setAreasOpen(true)}
        onOpenDashboard={() => setDashboardOpen(true)}
        activeArea={activeArea}
      />

      {loading && <LoadingOverlay />}
      {showEmpty && <EmptyState hasData={all.length > 0} />}

      {areasOpen && (
        <NeighborhoodPanel
          clusters={clusters}
          activeName={activeArea}
          onPick={pickNeighborhood}
          onClose={() => setAreasOpen(false)}
        />
      )}

      {dashboardOpen && (
        <Dashboard
          stats={stats}
          industry={industry}
          onClose={() => setDashboardOpen(false)}
          onPickNeighborhood={pickNeighborhood}
          onExport={exportCsv}
          exportCount={filtered.length}
        />
      )}

      <CompanyDetail
        company={selected}
        onClose={() => setSelected(null)}
        saved={selected ? saved.has(selected.id) : false}
        onToggleSave={toggleSaved}
      />
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
  const city = useCity();
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/85 px-5 py-3 shadow-lg backdrop-blur-xl">
        <span className="flex items-center gap-1" aria-hidden>
          <span className="h-2 w-2 animate-bounce rounded-full bg-plateau-pink" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-montroyal-amber [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-jazz-blue [animation-delay:240ms]" />
        </span>
        <span className="text-sm font-semibold text-asphalt/80">{city.loadingText}</span>
      </div>
    </div>
  );
}

function EmptyState({ hasData }: { hasData: boolean }) {
  const city = useCity();
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
      <div className="pointer-events-auto max-w-sm rounded-3xl border border-black/5 bg-white/90 p-6 text-center shadow-xl backdrop-blur-xl">
        <div className="mb-2 text-4xl">🛰️</div>
        <h2 className="text-lg font-bold text-asphalt">Nothing matches</h2>
        <p className="mt-1 text-sm text-asphalt/60">
          {hasData
            ? 'No companies match your search or filters. Try clearing them.'
            : `Loading the ${city.name} tech scene…`}
        </p>
        {hasData && (
          <p className="mt-2 text-xs font-semibold text-asphalt/50">
            Looking for a company we don&apos;t have?{' '}
            <a
              href={suggestCompanyUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-asphalt/70 underline"
            >
              Suggest it
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
