import type { Layer } from '@deck.gl/core';
import { IconLayer, PolygonLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { companyTypes, typeColor } from '@/lib/categories';
import type { CityConfig } from '@/lib/city-config';
import { hexToRgb } from '@/lib/colors';
import { MATCH_COLORS, type CompanyOpportunity, type OpportunityLens } from '@/lib/opportunity-map';
import type { AICompany } from '@/lib/types';

/** A neighborhood boundary + label drawn beneath the company markers. */
export interface NeighborhoodShape {
  name: string;
  polygon: [number, number][];
  centroid: [number, number];
  color: string; // hex
}

export interface CompanyCluster {
  id: string;
  longitude: number;
  latitude: number;
  companies: AICompany[];
}

function markerColor(
  city: CityConfig,
  company: AICompany,
  lens: OpportunityLens,
  opportunities?: Map<string, CompanyOpportunity>,
): string {
  const opportunity = opportunities?.get(company.id);
  if (lens === 'matches' && opportunity) return MATCH_COLORS[opportunity.best.band];
  if (lens === 'hiring') return '#00B894';
  return typeColor(city, company.type);
}

// Rough size signal: bigger dot = bigger / more notable player.
export function radiusFor(c: AICompany): number {
  const big = ['research-lab', 'big-tech-lab', 'scaleup', 'oem', 'tier1', 'mro', 'energy-producer', 'marine-shipping', 'marine-port'];
  const mid = ['applied-ai', 'defense', 'space', 'tier2', 'energy-storage', 'energy-distributor', 'marine-services'];
  if (big.includes(c.type)) return 90;
  if (mid.includes(c.type)) return 70;
  return 58;
}

/** The short display name floated above a marker. */
export function labelText(c: AICompany): string {
  return c.name.replace(/ — .*$/, '').replace(/ \(.*\)$/, '');
}

// ── Emoji icon atlas ─────────────────────────────────────────────────────
// deck.gl's TextLayer can't render colour emoji (its font atlas is
// alpha-only), so we rasterize each company type's emoji onto a canvas once
// and feed it to an IconLayer. Built lazily on the client, cached forever.
interface EmojiAtlas {
  atlas: string; // data URL
  mapping: Record<string, { x: number; y: number; width: number; height: number }>;
}

const emojiAtlases = new Map<string, EmojiAtlas>();

function getEmojiAtlas(city: CityConfig): EmojiAtlas | null {
  const cached = emojiAtlases.get(city.id);
  if (cached || typeof document === 'undefined') return cached ?? null;
  const CELL = 64;
  const defs = Object.values(companyTypes(city));
  const canvas = document.createElement('canvas');
  canvas.width = CELL * defs.length;
  canvas.height = CELL;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${CELL * 0.72}px system-ui, sans-serif`;
  const mapping: EmojiAtlas['mapping'] = {};
  defs.forEach((d, i) => {
    ctx.fillText(d.emoji, i * CELL + CELL / 2, CELL / 2 + CELL * 0.04);
    mapping[d.key] = { x: i * CELL, y: 0, width: CELL, height: CELL };
  });
  const built = { atlas: canvas.toDataURL(), mapping };
  emojiAtlases.set(city.id, built);
  return built;
}

interface LayerOpts {
  city: CityConfig;
  companies: AICompany[];
  selectedId: string | null;
  showLabels: boolean;
  showIcons: boolean;
  /** Which companies get a label (screen-space decluttered). null = all. */
  labelIds?: Set<string> | null;
  /** Active neighborhood boundary to outline beneath the markers, if any. */
  neighborhood?: NeighborhoodShape | null;
  lens?: OpportunityLens;
  opportunities?: Map<string, CompanyOpportunity>;
  onClick: (c: AICompany) => void;
  onHover?: (hovering: boolean) => void;
}

/**
 * Stacked deck.gl layers give each company a street-art "glow":
 *  1. a soft, large translucent halo
 *  2. a solid core dot, colour-coded by company type
 *  3. the type's emoji stamped on the dot (at street-level zoom)
 *  4. floating, collision-managed name labels (at higher zoom)
 *  5. a white ring pulsing attention onto the selected company
 */
export function createCompanyLayers({
  city,
  companies,
  selectedId,
  showLabels,
  showIcons,
  labelIds,
  neighborhood,
  lens = 'all',
  opportunities,
  onClick,
  onHover,
}: LayerOpts) {
  const layers: Layer[] = [];

  // Active neighborhood: a soft filled boundary with a dashed-feel outline,
  // drawn first so it sits under every marker like a highlighted district.
  if (neighborhood) {
    const rgb = hexToRgb(neighborhood.color);
    layers.push(
      new PolygonLayer<{ polygon: [number, number][] }>({
        id: 'neighborhood-area',
        data: [{ polygon: neighborhood.polygon }],
        getPolygon: (d) => d.polygon,
        getFillColor: [...rgb, 26],
        getLineColor: [...rgb, 200],
        getLineWidth: 2,
        lineWidthUnits: 'pixels',
        stroked: true,
        filled: true,
        pickable: false,
      }),
    );
  }

  const glow = new ScatterplotLayer<AICompany>({
    id: 'company-glow',
    data: companies,
    getPosition: (c) => [c.lng, c.lat],
    getRadius: (c) => radiusFor(c) * 2.6,
    radiusUnits: 'meters',
    radiusMinPixels: 14,
    radiusMaxPixels: 64,
    getFillColor: (c) => [...hexToRgb(markerColor(city, c, lens, opportunities)), c.id === selectedId ? 90 : 55],
    stroked: false,
    pickable: false,
    updateTriggers: { getFillColor: selectedId },
  });

  // Verified address → solid filled dot. Neighbourhood-only → hollow ring,
  // so the map never pretends an approximate pin is a precise location.
  const isExact = (c: AICompany) => c.locationPrecision !== 'approximate';

  const core = new ScatterplotLayer<AICompany>({
    id: 'company-core',
    data: companies,
    getPosition: (c) => [c.lng, c.lat],
    getRadius: radiusFor,
    radiusUnits: 'meters',
    radiusMinPixels: 7,
    radiusMaxPixels: 26,
    getFillColor: (c) => [...hexToRgb(markerColor(city, c, lens, opportunities)), isExact(c) ? 255 : 38],
    stroked: true,
    getLineColor: (c) => {
      if (c.id === selectedId) return [255, 255, 255, 255];
      return isExact(c) ? [255, 255, 255, 180] : [...hexToRgb(markerColor(city, c, lens, opportunities)), 255];
    },
    getLineWidth: (c) => (c.id === selectedId ? 3 : isExact(c) ? 1.5 : 2.5),
    lineWidthUnits: 'pixels',
    pickable: true,
    onClick: (info) => info.object && onClick(info.object as AICompany),
    onHover: (info) => onHover?.(Boolean(info.object)),
    updateTriggers: {
      getFillColor: selectedId,
      getLineColor: selectedId,
      getLineWidth: selectedId,
    },
  });

  layers.push(glow, core);

  // Selected company gets a calm, oversized white ring — easy to find again
  // after the detail sheet opens and the camera glides over.
  const selected = selectedId ? companies.find((c) => c.id === selectedId) : undefined;
  if (selected) {
    layers.push(
      new ScatterplotLayer<AICompany>({
        id: 'company-selected-ring',
        data: [selected],
        getPosition: (c) => [c.lng, c.lat],
        getRadius: (c) => radiusFor(c) * 1.9,
        radiusUnits: 'meters',
        radiusMinPixels: 15,
        radiusMaxPixels: 44,
        filled: false,
        stroked: true,
        getLineColor: [255, 255, 255, 235],
        getLineWidth: 2.5,
        lineWidthUnits: 'pixels',
        pickable: false,
      }),
    );
  }

  // Street-level zoom: each dot becomes a little POI badge — a white inner
  // disc with the type's emoji inside (🧠 research, ✈️ OEM, 🚀 startup…) —
  // so the map reads at a glance without losing the colour coding.
  const atlas = showIcons ? getEmojiAtlas(city) : null;
  if (atlas) {
    layers.push(
      new ScatterplotLayer<AICompany>({
        id: 'company-icon-disc',
        data: companies,
        getPosition: (c) => [c.lng, c.lat],
        getRadius: (c) => radiusFor(c) * 0.78,
        radiusUnits: 'meters',
        radiusMinPixels: 5,
        radiusMaxPixels: 20,
        getFillColor: (c) => [255, 255, 255, isExact(c) ? 235 : 200],
        stroked: false,
        pickable: false,
      }),
      new IconLayer<AICompany>({
        id: 'company-icons',
        data: companies,
        getPosition: (c) => [c.lng, c.lat],
        iconAtlas: atlas.atlas,
        iconMapping: atlas.mapping,
        getIcon: (c) => c.type,
        getSize: (c) => radiusFor(c) * 1.1,
        sizeUnits: 'meters',
        sizeMinPixels: 8,
        sizeMaxPixels: 28,
        alphaCutoff: 0.05,
        pickable: false,
      }),
    );
  }

  if (showLabels) {
    const labelled = labelIds ? companies.filter((c) => labelIds.has(c.id)) : companies;
    layers.push(
      new TextLayer<AICompany>({
        id: 'company-labels',
        data: labelled,
        getPosition: (c) => [c.lng, c.lat],
        getText: labelText,
        getSize: 12,
        sizeUnits: 'pixels',
        getColor: [25, 25, 30, 235],
        getPixelOffset: [0, -20],
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        fontWeight: 700,
        outlineWidth: 3,
        outlineColor: [255, 255, 255, 230],
        fontSettings: { sdf: true },
        characterSet: 'auto',
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'bottom',
        pickable: false,
        background: false,
      }),
    );
  }

  // Neighborhood name, floated at the district centroid above everything.
  if (neighborhood) {
    layers.push(
      new TextLayer<NeighborhoodShape>({
        id: 'neighborhood-label',
        data: [neighborhood],
        getPosition: (n) => n.centroid,
        getText: (n) => n.name.toUpperCase(),
        getSize: 13,
        sizeUnits: 'pixels',
        getColor: [...hexToRgb(neighborhood.color), 255],
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        fontWeight: 800,
        outlineWidth: 4,
        outlineColor: [255, 255, 255, 240],
        fontSettings: { sdf: true },
        characterSet: 'auto',
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        pickable: false,
        background: false,
      }),
    );
  }

  return layers;
}

interface ClusterLayerOpts {
  city: CityConfig;
  clusters: CompanyCluster[];
  lens: OpportunityLens;
  opportunities: Map<string, CompanyOpportunity>;
  onClick: (cluster: CompanyCluster) => void;
  onHover?: (hovering: boolean) => void;
}

/** City-level clusters keep dense maps legible. Their colour follows the best
 * resume match in the group, or the active opportunity lens. */
export function createClusterLayers({
  city,
  clusters,
  lens,
  opportunities,
  onClick,
  onHover,
}: ClusterLayerOpts): Layer[] {
  if (!clusters.length) return [];
  const color = (cluster: CompanyCluster) => {
    const ranked = cluster.companies
      .map((company) => opportunities.get(company.id))
      .filter((value): value is CompanyOpportunity => Boolean(value))
      .sort((a, b) => b.best.score - a.best.score);
    if (lens === 'matches' && ranked[0]) return MATCH_COLORS[ranked[0].best.band];
    if (lens === 'hiring') return '#00B894';
    return markerColor(city, cluster.companies[0], lens, opportunities);
  };

  return [
    new ScatterplotLayer<CompanyCluster>({
      id: 'company-cluster-glow',
      data: clusters,
      getPosition: (cluster) => [cluster.longitude, cluster.latitude],
      getRadius: (cluster) => 150 + Math.sqrt(cluster.companies.length) * 55,
      radiusUnits: 'meters',
      radiusMinPixels: 24,
      radiusMaxPixels: 58,
      getFillColor: (cluster) => [...hexToRgb(color(cluster)), 65],
      pickable: false,
    }),
    new ScatterplotLayer<CompanyCluster>({
      id: 'company-cluster-core',
      data: clusters,
      getPosition: (cluster) => [cluster.longitude, cluster.latitude],
      getRadius: (cluster) => 80 + Math.sqrt(cluster.companies.length) * 30,
      radiusUnits: 'meters',
      radiusMinPixels: 16,
      radiusMaxPixels: 38,
      getFillColor: (cluster) => [...hexToRgb(color(cluster)), 245],
      getLineColor: [255, 255, 255, 235],
      getLineWidth: 2,
      lineWidthUnits: 'pixels',
      stroked: true,
      pickable: true,
      onClick: (info) => info.object && onClick(info.object as CompanyCluster),
      onHover: (info) => onHover?.(Boolean(info.object)),
    }),
    new TextLayer<CompanyCluster>({
      id: 'company-cluster-count',
      data: clusters,
      getPosition: (cluster) => [cluster.longitude, cluster.latitude],
      getText: (cluster) => String(cluster.companies.length),
      getSize: 13,
      sizeUnits: 'pixels',
      getColor: [255, 255, 255, 255],
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      fontWeight: 800,
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      pickable: false,
    }),
  ];
}
