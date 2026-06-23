import { H3HexagonLayer } from '@deck.gl/geo-layers';
import { categoryColor } from '@/lib/categories';
import { densityColor, hexToRgb } from '@/lib/colors';
import type { HexCell, H3Resolution } from '@/lib/types';

export type ColorMode = 'category' | 'density';

interface HexLayerOptions {
  cells: HexCell[];
  maxCount: number;
  resolution: H3Resolution;
  colorMode: ColorMode;
  selectedHexId?: string | null;
  onClick: (cell: HexCell) => void;
}

/**
 * Build the deck.gl H3HexagonLayer that paints Montreal in glowing hexes.
 * Hexes are colored either by dominant category or by POI density, with a
 * slight 3D extrusion that grows with the number of POIs inside.
 */
export function createHexLayer({
  cells,
  maxCount,
  resolution,
  colorMode,
  selectedHexId,
  onClick,
}: HexLayerOptions): H3HexagonLayer<HexCell> {
  return new H3HexagonLayer<HexCell>({
    id: `h3-hex-${resolution}`,
    data: cells,
    pickable: true,
    filled: true,
    stroked: true,
    extruded: true,
    wireframe: false,
    elevationScale: resolution === 9 ? 12 : 45,
    coverage: 0.92,
    getHexagon: (d) => d.hexId,
    getElevation: (d) => Math.sqrt(d.count) * 6,
    getFillColor: (d) => {
      const hex = colorMode === 'category'
        ? categoryColor(d.dominantCategory)
        : densityColor(d.count, maxCount);
      const [r, g, b] = hexToRgb(hex);
      // brighter/denser hexes glow more opaque
      const t = Math.min(1, Math.log(d.count + 1) / Math.log(Math.max(2, maxCount) + 1));
      const alpha = Math.round(120 + t * 120);
      const selected = selectedHexId && d.hexId === selectedHexId;
      return [r, g, b, selected ? 255 : alpha];
    },
    getLineColor: (d) => {
      const selected = selectedHexId && d.hexId === selectedHexId;
      return selected ? [248, 249, 250, 255] : [248, 249, 250, 40];
    },
    getLineWidth: (d) => (selectedHexId && d.hexId === selectedHexId ? 3 : 1),
    lineWidthUnits: 'pixels',
    onClick: (info) => {
      if (info.object) onClick(info.object as HexCell);
    },
    updateTriggers: {
      getFillColor: [colorMode, maxCount, selectedHexId],
      getLineColor: [selectedHexId],
      getLineWidth: [selectedHexId],
    },
  });
}
