import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { typeColor } from '@/lib/categories';
import { hexToRgb } from '@/lib/colors';
import type { AICompany } from '@/lib/types';

// Rough size signal: bigger dot = bigger / more notable player.
function radiusFor(c: AICompany): number {
  const big = ['research-lab', 'big-tech-lab', 'scaleup', 'oem', 'tier1', 'mro'];
  const mid = ['applied-ai', 'defense', 'space', 'tier2'];
  if (big.includes(c.type)) return 90;
  if (mid.includes(c.type)) return 70;
  return 58;
}

interface LayerOpts {
  companies: AICompany[];
  selectedId: string | null;
  showLabels: boolean;
  onClick: (c: AICompany) => void;
}

/**
 * Three stacked deck.gl layers give each company a street-art "glow":
 *  1. a soft, large translucent halo
 *  2. a solid core dot, colour-coded by company type
 *  3. floating name labels (at higher zoom)
 */
export function createCompanyLayers({ companies, selectedId, showLabels, onClick }: LayerOpts) {
  const glow = new ScatterplotLayer<AICompany>({
    id: 'company-glow',
    data: companies,
    getPosition: (c) => [c.lng, c.lat],
    getRadius: (c) => radiusFor(c) * 2.6,
    radiusUnits: 'meters',
    radiusMinPixels: 14,
    radiusMaxPixels: 64,
    getFillColor: (c) => [...hexToRgb(typeColor(c.type)), c.id === selectedId ? 90 : 55],
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
    radiusMinPixels: 6,
    radiusMaxPixels: 26,
    getFillColor: (c) => [...hexToRgb(typeColor(c.type)), isExact(c) ? 255 : 38],
    stroked: true,
    getLineColor: (c) => {
      if (c.id === selectedId) return [255, 255, 255, 255];
      return isExact(c) ? [255, 255, 255, 180] : [...hexToRgb(typeColor(c.type)), 255];
    },
    getLineWidth: (c) => (c.id === selectedId ? 3 : isExact(c) ? 1.5 : 2.5),
    lineWidthUnits: 'pixels',
    pickable: true,
    onClick: (info) => info.object && onClick(info.object as AICompany),
    updateTriggers: {
      getFillColor: selectedId,
      getLineColor: selectedId,
      getLineWidth: selectedId,
    },
  });

  const layers: (ScatterplotLayer<AICompany> | TextLayer<AICompany>)[] = [glow, core];

  if (showLabels) {
    layers.push(
      new TextLayer<AICompany>({
        id: 'company-labels',
        data: companies,
        getPosition: (c) => [c.lng, c.lat],
        getText: (c) => c.name.replace(/ — .*$/, '').replace(/ \(.*\)$/, ''),
        getSize: 12,
        sizeUnits: 'pixels',
        getColor: [25, 25, 30, 235],
        getPixelOffset: [0, -18],
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        fontWeight: 700,
        outlineWidth: 3,
        outlineColor: [255, 255, 255, 230],
        fontSettings: { sdf: true },
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'bottom',
        pickable: false,
        background: false,
      }),
    );
  }

  return layers;
}
