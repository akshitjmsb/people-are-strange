'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

import FilterChips from '@/components/FilterChips';
import POISheet from '@/components/POISheet';
import SearchBar from '@/components/SearchBar';
import type { ColorMode } from '@/components/HexLayer';
import { loadPOIs } from '@/lib/pois';
import type { HexCell, POI, POICategory } from '@/lib/types';

// Map touches browser-only APIs (WebGL, maplibre) — load it client-side only.
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default function Page() {
  const [allPois, setAllPois] = useState<POI[]>([]);
  const [source, setSource] = useState<'supabase' | 'local' | null>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [activeCats, setActiveCats] = useState<Set<POICategory>>(new Set());
  const [colorMode, setColorMode] = useState<ColorMode>('category');

  const [selectedHexId, setSelectedHexId] = useState<string | null>(null);
  const [sheetPois, setSheetPois] = useState<POI[]>([]);

  useEffect(() => {
    let alive = true;
    loadPOIs().then((res) => {
      if (!alive) return;
      setAllPois(res.pois);
      setSource(res.source);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  // count per category across the full dataset (for the chips)
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of allPois) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [allPois]);

  // apply search + category filters
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allPois.filter((p) => {
      if (activeCats.size > 0 && !activeCats.has(p.category)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.subcategory?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [allPois, query, activeCats]);

  const handleSelectHex = (cell: HexCell) => {
    const inHex = filtered.filter(
      (p) => p.h3_res7 === cell.hexId || p.h3_res9 === cell.hexId,
    );
    setSelectedHexId(cell.hexId);
    setSheetPois(inHex);
  };

  const closeSheet = () => {
    setSelectedHexId(null);
    setSheetPois([]);
  };

  const toggleCat = (cat: POICategory) => {
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const showEmpty = !loading && filtered.length === 0;

  return (
    <main className="relative h-full w-full">
      <Map
        pois={filtered}
        colorMode={colorMode}
        selectedHexId={selectedHexId}
        onSelectHex={handleSelectHex}
      />

      {/* top chrome */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-2.5 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <SearchBar
              value={query}
              onChange={setQuery}
              resultCount={filtered.length}
              source={source}
            />
          </div>
          <ColorModeToggle mode={colorMode} onChange={setColorMode} />
        </div>
        <FilterChips
          active={activeCats}
          counts={counts}
          onToggle={toggleCat}
          onClear={() => setActiveCats(new Set())}
        />
      </div>

      {/* brand mark */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-10">
        <p className="font-display text-xs font-bold tracking-tight text-snow-white/70">
          People Are Strange
          <span className="ml-1 text-plateau-pink">MTL</span>
        </p>
      </div>

      {loading && <LoadingOverlay />}
      {showEmpty && <EmptyState filtered={allPois.length > 0} />}

      <POISheet
        open={sheetPois.length > 0}
        pois={sheetPois}
        hexId={selectedHexId}
        onClose={closeSheet}
      />
    </main>
  );
}

function ColorModeToggle({
  mode,
  onChange,
}: {
  mode: ColorMode;
  onChange: (m: ColorMode) => void;
}) {
  return (
    <button
      onClick={() => onChange(mode === 'category' ? 'density' : 'category')}
      className="pointer-events-auto shrink-0 rounded-2xl border border-white/10 bg-asphalt/70 px-3 py-3 text-xs font-semibold text-snow-white/80 shadow-lg backdrop-blur-2xl transition hover:bg-asphalt/90"
      title="Toggle hex coloring"
    >
      {mode === 'category' ? '🎨 Category' : '🔥 Density'}
    </button>
  );
}

function MapSkeleton() {
  return <div className="h-full w-full bg-asphalt" />;
}

function LoadingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-asphalt/70 px-5 py-3 backdrop-blur-2xl">
        <span className="h-3 w-3 animate-pulse-slow rounded-full bg-plateau-pink" />
        <span className="text-sm font-medium text-snow-white/80">Mapping Montréal…</span>
      </div>
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6">
      <div className="max-w-sm rounded-3xl border border-white/10 bg-asphalt/70 p-6 text-center backdrop-blur-2xl">
        <div className="mb-2 text-4xl">🗺️</div>
        <h2 className="text-lg font-bold text-snow-white">Kuch nahi mila yahan</h2>
        <p className="mt-1 text-sm text-snow-white/60">
          {filtered
            ? 'No places match your search or filters. Try clearing them.'
            : 'POIs loading soon — the city is waking up.'}
        </p>
      </div>
    </div>
  );
}
