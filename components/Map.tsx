'use client';

import { useMemo, useState } from 'react';
import MapGL, { NavigationControl, useControl } from 'react-map-gl/maplibre';
import { MapboxOverlay, type MapboxOverlayProps } from '@deck.gl/mapbox';
import 'maplibre-gl/dist/maplibre-gl.css';

import type { AICompany } from '@/lib/types';
import { createCompanyLayers } from './CompanyLayers';

// Montreal — centred on the island, framed on the AI corridor (Mile-Ex →
// downtown), tilted for that street-level, walk-the-city feel.
const INITIAL_VIEW = {
  longitude: -73.585,
  latitude: 45.512,
  zoom: 12.4,
  pitch: 40,
  bearing: -10,
};

// CARTO Voyager — bright, colourful streets. The vibrant Montreal canvas the
// glowing company markers are painted on.
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

function DeckOverlay(props: MapboxOverlayProps) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

interface MapProps {
  companies: AICompany[];
  selectedId: string | null;
  onSelect: (c: AICompany) => void;
}

export default function Map({ companies, selectedId, onSelect }: MapProps) {
  const [zoom, setZoom] = useState(INITIAL_VIEW.zoom);
  const showLabels = zoom >= 13;

  const layers = useMemo(
    () => createCompanyLayers({ companies, selectedId, showLabels, onClick: onSelect }),
    [companies, selectedId, showLabels, onSelect],
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
      <DeckOverlay layers={layers} interleaved />
      <NavigationControl position="bottom-right" showCompass visualizePitch />
    </MapGL>
  );
}
