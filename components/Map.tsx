'use client';

import { useMemo, useState } from 'react';
import MapGL, { NavigationControl, useControl } from 'react-map-gl/maplibre';
import { MapboxOverlay, type MapboxOverlayProps } from '@deck.gl/mapbox';
import 'maplibre-gl/dist/maplibre-gl.css';

import { aggregateToHexes, maxCount, resolutionForZoom } from '@/lib/h3-utils';
import type { HexCell, POI } from '@/lib/types';
import { createHexLayer, type ColorMode } from './HexLayer';

// Montreal — centred on the island, zoomed to see the whole thing.
const INITIAL_VIEW = {
  longitude: -73.5673,
  latitude: 45.5017,
  zoom: 12,
  pitch: 38,
  bearing: -8,
};

// CARTO dark-matter — free vector tiles, no API key, matches our dark UI.
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

function DeckOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

interface MapProps {
  pois: POI[];
  colorMode: ColorMode;
  selectedHexId: string | null;
  onSelectHex: (cell: HexCell) => void;
}

export default function Map({ pois, colorMode, selectedHexId, onSelectHex }: MapProps) {
  const [zoom, setZoom] = useState(INITIAL_VIEW.zoom);

  const resolution = useMemo(() => resolutionForZoom(zoom), [zoom]);

  const cells = useMemo(() => aggregateToHexes(pois, resolution), [pois, resolution]);
  const max = useMemo(() => maxCount(cells), [cells]);

  const layer = useMemo(
    () =>
      createHexLayer({
        cells,
        maxCount: max,
        resolution,
        colorMode,
        selectedHexId,
        onClick: onSelectHex,
      }),
    [cells, max, resolution, colorMode, selectedHexId, onSelectHex],
  );

  return (
    <MapGL
      initialViewState={INITIAL_VIEW}
      mapStyle={MAP_STYLE}
      onMove={(e) => setZoom(e.viewState.zoom)}
      maxPitch={60}
      reuseMaps
      style={{ width: '100%', height: '100%' }}
    >
      <DeckOverlay layers={[layer]} interleaved />
      <NavigationControl position="bottom-right" showCompass visualizePitch />
    </MapGL>
  );
}
