'use client';

import Link from 'next/link';

import { CITY_IDS, getCity } from '@/lib/cities';
import { useCityId } from '@/lib/city-context';

/**
 * Persistent city filter. Every available city stays visible so switching
 * locations never depends on discovering a hidden menu.
 */
export default function CitySwitcher() {
  const cityId = useCityId();

  return (
    <nav
      aria-label="Choose city"
      className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-black/10 bg-white/95 p-1 shadow-lg backdrop-blur-xl"
    >
      <span className="px-2 text-[0.58rem] font-extrabold uppercase tracking-[0.16em] text-steel-gray">
        City
      </span>
      {CITY_IDS.map((id) => {
        const city = getCity(id);
        const active = id === cityId;

        return (
          <Link
            key={id}
            href={`/${id}`}
            aria-current={active ? 'page' : undefined}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jazz-blue focus-visible:ring-offset-1 ${
              active
                ? 'bg-asphalt text-white shadow-sm'
                : 'text-steel-gray hover:bg-smoke-white hover:text-asphalt'
            }`}
          >
            {city.name}
          </Link>
        );
      })}
    </nav>
  );
}
