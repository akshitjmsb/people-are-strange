// ── The city map ─────────────────────────────────────────────────────────
// One deployment, every city. This server component owns the /[city] segment
// and hands the id to the client tree; nothing about the map itself is
// city-specific, so a new city is a data module plus a registry line.

import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';

import CityApp from '@/components/CityApp';
import { CityProvider } from '@/lib/city-context';
import { CITY_IDS, getCity, isCityId } from '@/lib/cities';

/** Prerender every known city. */
export function generateStaticParams() {
  return CITY_IDS.map((city) => ({ city }));
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  if (!isCityId(params.city)) return {};
  const city = getCity(params.city);
  return {
    title: city.metaTitle,
    description: city.metaDescription,
    manifest: `/${city.id}/manifest.webmanifest`,
  };
}

/** Theme colour is per city, so it cannot live in the root layout. */
export function generateViewport({ params }: { params: { city: string } }): Viewport {
  return {
    themeColor: getCity(params.city).themeColor,
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  };
}

export default function CityPage({ params }: { params: { city: string } }) {
  if (!isCityId(params.city)) notFound();
  return (
    <CityProvider cityId={params.city}>
      <CityApp />
    </CityProvider>
  );
}
