'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MapGL, {
  GeolocateControl,
  Marker,
  NavigationControl,
  useControl,
  type MapRef,
} from 'react-map-gl/maplibre';
import { MapboxOverlay, type MapboxOverlayProps } from '@deck.gl/mapbox';
import 'maplibre-gl/dist/maplibre-gl.css';

import { useCategories } from '@/lib/use-categories';
import { useCity } from '@/lib/city-context';
import { MATCH_COLORS, type CompanyOpportunity, type OpportunityLens } from '@/lib/opportunity-map';

import type { AICompany } from '@/lib/types';
import {
  createCompanyLayers,
  labelText,
  radiusFor,
  type CompanyCluster,
  type NeighborhoodShape,
} from './CompanyLayers';

// Framed on the active city's centre, tilted for that street-level,
// walk-the-city feel. mapCenter is [lat, lng].
function initialViewFor(city: { mapCenter: [number, number]; defaultZoom: number }) {
  return {
    longitude: city.mapCenter[1],
    latitude: city.mapCenter[0],
    zoom: city.defaultZoom,
    pitch: 40,
    bearing: -10,
  };
}

// Basemap fallback chain, most graceful first:
//  1. CARTO Voyager — bright, colourful streets; the vibrant city canvas.
//  2. CARTO Positron — quieter, but same CDN family.
//  3. Raw OSM raster tiles — independent of CARTO entirely, so the map still
//     draws streets even if the whole CDN is down.
const OSM_RASTER_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
};

const MAP_STYLES: (string | typeof OSM_RASTER_STYLE)[] = [
  'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  OSM_RASTER_STYLE,
];

function DeckOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  if (process.env.NODE_ENV === 'development') {
    (window as unknown as Record<string, unknown>).__overlay = overlay;
  }
  return null;
}

/**
 * Screen-space label decluttering: project every company to pixels, walk them
 * by priority (selected first, then bigger players) and keep only labels whose
 * estimated text box doesn't overlap one already kept.
 */
function declutterLabels(
  map: MapRef,
  companies: AICompany[],
  selectedId: string | null,
): Set<string> {
  const kept: { x0: number; x1: number; y0: number; y1: number }[] = [];
  const ids = new Set<string>();
  const ordered = [...companies].sort(
    (a, b) =>
      Number(b.id === selectedId) - Number(a.id === selectedId) ||
      radiusFor(b) - radiusFor(a) ||
      a.name.localeCompare(b.name),
  );
  for (const c of ordered) {
    const p = map.project([c.lng, c.lat]);
    // 12px bold Space Grotesk ≈ 6.8px/char; label floats ~20px above the dot
    const w = labelText(c).length * 6.8 + 8;
    const box = { x0: p.x - w / 2, x1: p.x + w / 2, y0: p.y - 36, y1: p.y - 18 };
    const collides = kept.some(
      (k) => box.x0 < k.x1 + 4 && box.x1 > k.x0 - 4 && box.y0 < k.y1 + 2 && box.y1 > k.y0 - 2,
    );
    if (collides) continue;
    kept.push(box);
    ids.add(c.id);
  }
  return ids;
}

function webglSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

interface MapProps {
  companies: AICompany[];
  selectedId: string | null;
  onSelect: (c: AICompany) => void;
  lens?: OpportunityLens;
  opportunities?: Map<string, CompanyOpportunity>;
  /** Active neighborhood district to outline + frame, if any. */
  neighborhood?: NeighborhoodShape | null;
  /** Bounds to fit when a neighborhood becomes active. */
  neighborhoodBounds?: [[number, number], [number, number]] | null;
}

export default function Map({
  companies,
  selectedId,
  onSelect,
  lens = 'all',
  opportunities = new globalThis.Map<string, CompanyOpportunity>(),
  neighborhood = null,
  neighborhoodBounds = null,
}: MapProps) {
  const city = useCity();
  const { typeColor } = useCategories();
  const INITIAL_VIEW = useMemo(() => initialViewFor(city), [city]);
  const mapRef = useRef<MapRef>(null);
  const styleLoadedRef = useRef(false);
  const [zoom, setZoom] = useState(INITIAL_VIEW.zoom);
  // bumped on every camera move so label decluttering tracks the projection
  const [viewTick, setViewTick] = useState(0);
  const [styleTier, setStyleTier] = useState(0);
  const [webgl] = useState(() => (typeof window === 'undefined' ? true : webglSupported()));

  const showLabels = zoom >= 13;
  const showIcons = zoom >= 13.5;

  const clustered = useMemo(() => {
    if (zoom >= 13 || companies.length < 2) {
      return { clusters: [] as CompanyCluster[], singles: companies };
    }

    const map = mapRef.current;
    if (!map) return { clusters: [] as CompanyCluster[], singles: companies };

    // Cluster in projected screen pixels instead of geographic grid cells.
    // Connected components make the result boundary-free: two nearby markers
    // cannot remain separate merely because they fall on opposite grid edges.
    const points = companies.map((company) => map.project([company.lng, company.lat]));
    const distance = zoom < 11 ? 72 : zoom < 12 ? 62 : 50;
    const distanceSquared = distance * distance;
    const parent = companies.map((_, index) => index);
    const find = (index: number): number => {
      let root = index;
      while (parent[root] !== root) root = parent[root];
      while (parent[index] !== index) {
        const next = parent[index];
        parent[index] = root;
        index = next;
      }
      return root;
    };
    const union = (left: number, right: number) => {
      const leftRoot = find(left);
      const rightRoot = find(right);
      if (leftRoot !== rightRoot) parent[rightRoot] = leftRoot;
    };

    for (let left = 0; left < points.length; left += 1) {
      for (let right = left + 1; right < points.length; right += 1) {
        const dx = points[left].x - points[right].x;
        const dy = points[left].y - points[right].y;
        if (dx * dx + dy * dy <= distanceSquared) union(left, right);
      }
    }

    const groups = new globalThis.Map<number, AICompany[]>();
    companies.forEach((company, index) => {
      const root = find(index);
      const group = groups.get(root);
      if (group) group.push(company);
      else groups.set(root, [company]);
    });

    const clusters: CompanyCluster[] = [];
    const singles: AICompany[] = [];
    for (const [id, members] of groups) {
      if (members.length === 1) {
        singles.push(members[0]);
        continue;
      }
      clusters.push({
        id: String(id),
        companies: members,
        longitude: members.reduce((sum, company) => sum + company.lng, 0) / members.length,
        latitude: members.reduce((sum, company) => sum + company.lat, 0) / members.length,
      });
    }
    return { clusters, singles };
    // viewTick updates the projected groups after a camera move completes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies, zoom, viewTick]);

  const setHoverCursor = useCallback((hovering: boolean) => {
    const canvas = mapRef.current?.getCanvas();
    if (canvas) canvas.style.cursor = hovering ? 'pointer' : '';
  }, []);

  const labelIds = useMemo(() => {
    if (!showLabels || !mapRef.current) return null;
    return declutterLabels(mapRef.current, clustered.singles, selectedId);
    // viewTick keys the recompute to camera moves
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clustered.singles, selectedId, showLabels, viewTick]);

  const openCluster = useCallback((cluster: CompanyCluster) => {
    const map = mapRef.current;
    if (!map) return;
    const lngs = cluster.companies.map((company) => company.lng);
    const lats = cluster.companies.map((company) => company.lat);
    map.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 90, maxZoom: Math.min(15, map.getZoom() + 2.5), duration: 700, essential: true },
    );
  }, []);

  const layers = useMemo(
    () =>
      createCompanyLayers({
        city,
        companies: clustered.singles,
        selectedId,
        showLabels,
        showIcons,
        labelIds,
        neighborhood,
        lens,
        opportunities,
        onClick: onSelect,
        onHover: setHoverCursor,
      }),
    [city, clustered.singles, selectedId, showLabels, showIcons, labelIds, neighborhood, lens, opportunities, onSelect, setHoverCursor],
  );

  const clusterColor = useCallback((cluster: CompanyCluster) => {
    if (lens === 'matches') {
      let best: CompanyOpportunity | undefined;
      for (const company of cluster.companies) {
        const opportunity = opportunities.get(company.id);
        if (opportunity && (!best || opportunity.best.score > best.best.score)) best = opportunity;
      }
      if (best) return MATCH_COLORS[best.best.band];
    }
    if (lens === 'hiring') return '#00B894';
    return typeColor(cluster.companies[0].type);
  }, [lens, opportunities, typeColor]);

  // Glide the camera to the selected company, lifted above the detail sheet.
  useEffect(() => {
    if (!selectedId) return;
    const company = companies.find((c) => c.id === selectedId);
    const map = mapRef.current;
    if (!company || !map) return;
    map.flyTo({
      center: [company.lng, company.lat],
      zoom: Math.max(map.getZoom(), 14),
      // shift the pin up so the bottom sheet doesn't cover it
      offset: [0, -Math.min(window.innerHeight * 0.18, 160)],
      duration: 900,
      essential: true,
    });
    // deliberately not reacting to `companies` — a filter change shouldn't re-fly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Frame the active neighborhood: fit its bounds, leaving room at the bottom
  // for the cluster summary card. Keyed to the neighborhood name so re-picking
  // the same one doesn't re-fly on every filter tweak.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !neighborhood || !neighborhoodBounds) return;
    map.fitBounds(neighborhoodBounds, {
      padding: { top: 120, bottom: 220, left: 60, right: 60 },
      maxZoom: 15,
      duration: 900,
      essential: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neighborhood?.name]);

  // Resilience net: if the map initialized before layout settled (or its own
  // resize tracking missed a beat), snap the canvas back to the container.
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    let ro: ResizeObserver | undefined;
    let tries = 0;
    const poll = setInterval(() => {
      const map = mapRef.current;
      if (!map) {
        if (++tries > 40) clearInterval(poll); // give up after ~10s
        return;
      }
      clearInterval(poll);
      try {
        map.resize();
        ro = new ResizeObserver(() => {
          try {
            map.resize();
          } catch {
            /* map already gone */
          }
        });
        ro.observe(map.getContainer());
      } catch {
        /* map already gone */
      }
    }, 250);
    return () => {
      clearInterval(poll);
      ro?.disconnect();
    };
  }, [webgl]);

  const recenter = useCallback(() => {
    mapRef.current?.flyTo({
      center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude],
      zoom: INITIAL_VIEW.zoom,
      pitch: INITIAL_VIEW.pitch,
      bearing: INITIAL_VIEW.bearing,
      duration: 1200,
      essential: true,
    });
  }, [INITIAL_VIEW]);

  // Style failed before first load → step down the fallback chain.
  const handleError = useCallback((e: { error?: Error }) => {
    if (styleLoadedRef.current) return;
    console.warn('[map] basemap failed, falling back:', e?.error?.message);
    setStyleTier((t) => Math.min(t + 1, MAP_STYLES.length - 1));
  }, []);

  if (!webgl) {
    return <CompanyListFallback companies={companies} onSelect={onSelect} />;
  }

  return (
    <MapGL
      ref={mapRef}
      initialViewState={INITIAL_VIEW}
      mapStyle={MAP_STYLES[styleTier] as string}
      onMove={(e) => {
        setZoom(e.viewState.zoom);
      }}
      onMoveEnd={() => setViewTick((tick) => tick + 1)}
      onLoad={() => {
        styleLoadedRef.current = true;
        // belt-and-braces: make sure the canvas matches the container even if
        // the map initialized before layout settled
        mapRef.current?.resize();
        setViewTick((tick) => tick + 1);
        if (process.env.NODE_ENV === 'development') {
          // debugging handle for the dev console
          (window as unknown as Record<string, unknown>).__map = mapRef.current?.getMap();
        }
      }}
      onError={handleError}
      maxPitch={60}
      style={{ width: '100%', height: '100%' }}
    >
      {/* own-canvas overlay (not interleaved): interleaving the deck layers
          into the maplibre render pass caused depth-fighting artifacts on the
          translucent markers. pickingRadius makes small dots tappable. */}
      <DeckOverlay layers={layers} pickingRadius={8} />
      {clustered.clusters.map((cluster) => {
        const color = clusterColor(cluster);
        const count = cluster.companies.length;
        const size = Math.min(58, 40 + Math.sqrt(count) * 3);
        return (
          <Marker
            key={cluster.id}
            longitude={cluster.longitude}
            latitude={cluster.latitude}
            anchor="center"
            style={{ zIndex: 8 }}
          >
            <button
              type="button"
              onClick={() => openCluster(cluster)}
              aria-label={`${count} companies in this area. Zoom in`}
              title={`${count} companies — zoom in`}
              className="flex items-center justify-center rounded-full border-[3px] border-white font-display text-[15px] font-black leading-none tabular-nums text-white transition-transform hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/90"
              style={{
                width: size,
                height: size,
                backgroundColor: color,
                boxShadow: `0 0 0 7px ${color}30, 0 5px 14px rgba(45,52,54,0.28)`,
                textShadow: '0 1px 2px rgba(45,52,54,0.5)',
              }}
            >
              {count}
            </button>
          </Marker>
        );
      })}
      <GeolocateControl
        position="bottom-right"
        trackUserLocation
        showUserLocation
        positionOptions={{ enableHighAccuracy: true }}
      />
      <NavigationControl position="bottom-right" showCompass visualizePitch />

      {/* recenter to the city's default framing */}
      <button
        onClick={recenter}
        aria-label="Recenter on the map"
        title="Recenter on the map"
        className="absolute bottom-[172px] right-[10px] z-10 flex h-[29px] w-[29px] items-center justify-center rounded-lg border border-black/5 bg-white/85 text-asphalt/70 shadow-md backdrop-blur-xl transition hover:bg-white hover:text-asphalt"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      </button>
    </MapGL>
  );
}

/** No WebGL (old device, disabled GPU)? The scene is still browsable as a list. */
function CompanyListFallback({
  companies,
  onSelect,
}: {
  companies: AICompany[];
  onSelect: (c: AICompany) => void;
}) {
  const { typeColor, typeDef } = useCategories();
  return (
    <div className="h-full w-full overflow-y-auto bg-snow-white px-4 pb-8 pt-36">
      <div className="mx-auto max-w-xl">
        <p className="mb-3 rounded-2xl border border-black/5 bg-white p-3 text-xs font-medium text-asphalt/60 shadow-sm">
          This device can&apos;t render the interactive map (WebGL unavailable), so
          here&apos;s the whole scene as a list instead.
        </p>
        <ul className="space-y-2">
          {companies.map((c) => {
            const t = typeDef(c.type);
            return (
              <li key={c.id}>
                <button
                  onClick={() => onSelect(c)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-black/5 bg-white p-3 text-left shadow-sm transition hover:shadow-md"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
                    style={{ backgroundColor: `${typeColor(c.type)}22` }}
                    aria-hidden
                  >
                    {t.emoji}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-asphalt">{c.name}</span>
                    <span className="block truncate text-xs text-asphalt/55">
                      {t.label}
                      {c.neighborhood ? ` · ${c.neighborhood}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
