// ── Per-city PWA manifest ────────────────────────────────────────────────
// One deployment serves several cities, so a single static manifest would
// install every city under the same name, colour and start_url. Each city
// gets its own so "Add to Home Screen" produces a Montréal app and a
// Victoria app, not two identical icons.

import { NextResponse } from 'next/server';
import { CITY_IDS, getCity, isCityId } from '@/lib/cities';

export function generateStaticParams() {
  return CITY_IDS.map((city) => ({ city }));
}

export async function GET(_req: Request, props: { params: Promise<{ city: string }> }) {
  const params = await props.params;
  if (!isCityId(params.city)) {
    return NextResponse.json({ error: 'unknown city' }, { status: 404 });
  }
  const city = getCity(params.city);

  return NextResponse.json(
    {
      name: `People Are Strange — ${city.name}`,
      short_name: city.name,
      description: city.metaDescription,
      start_url: `/${city.id}`,
      scope: `/${city.id}`,
      display: 'standalone',
      orientation: 'portrait',
      background_color: city.themeColor,
      theme_color: city.themeColor,
      categories: ['maps', 'navigation', 'lifestyle'],
      icons: [
        {
          src: '/icon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        },
      ],
    },
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
}
