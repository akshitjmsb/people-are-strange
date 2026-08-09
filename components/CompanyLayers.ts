import type { Layer } from '@deck.gl/core';
import { PolygonLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { typeColor } from '@/lib/categories';
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
 * Stacked deck.gl layers give each company a compact map marker:
 *  1. a solid core dot, colour-coded by company type
 *  2. floating, collision-managed name labels (at higher zoom)
 *  3. a white ring pulsing attention onto the selected company
 * Company logos are screen-facing HTML markers rendered by Map.tsx.
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

  // Once the screen-facing company logo is visible, it replaces this map dot
  // instead of stacking on top of it as a thick coloured halo.
  if (!showIcons) layers.push(core);

  // Selected company gets a calm, oversized white ring — easy to find again
  // after the detail sheet opens and the camera glides over.
  const selected = selectedId ? companies.find((c) => c.id === selectedId) : undefined;
  if (selected && !showIcons) {
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
