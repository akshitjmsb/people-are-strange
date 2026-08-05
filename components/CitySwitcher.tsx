'use client';

import { useState } from 'react';
import Link from 'next/link';

import { CITY_IDS, getCity } from '@/lib/cities';
import { useCityId } from '@/lib/city-context';

/**
 * The "People Are Strange" brand mark, doubling as the city switcher. Cities
 * are route-addressable (/montreal, /victoria) but had no in-app discovery
 * path — you had to know a URL. Tapping the wordmark opens a short list of
 * every city in the registry, rendered as real <Link>s to /[city] so cities
 * stay crawlable and navigable without JS. Falls back to a plain wordmark when
 * the build knows only one city.
 */
export default function CitySwitcher() {
  const cityId = useCityId();
  const [open, setOpen] = useState(false);
  const current = getCity(cityId);
  const multi = CITY_IDS.length > 1;

  const wordmark = (
    <>
      People Are <span className="mtl-gradient-text">Strange</span>
    </>
  );

  // Single-city build: nothing to switch to, so keep the original wordmark.
  if (!multi) {
    return (
      <p className="font-display text-xs font-extrabold tracking-tight text-asphalt/80 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">
        {wordmark}
      </p>
    );
  }

  return (
    <div className="pointer-events-auto relative">
      {open && (
        <>
          {/* dismiss on outside tap */}
          <button
            type="button"
            aria-label="Close city menu"
            className="fixed inset-0 z-0 cursor-default"
            onClick={() => setOpen(false)}
          />
          <ul
            role="menu"
            className="absolute bottom-full left-0 z-10 mb-1.5 min-w-[9rem] overflow-hidden rounded-xl border border-black/5 bg-white/95 py-1 shadow-xl backdrop-blur-xl"
          >
            {CITY_IDS.map((id) => {
              const c = getCity(id);
              const active = id === cityId;
              return (
                <li key={id} role="none">
                  <Link
                    role="menuitem"
                    href={`/${id}`}
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center justify-between gap-3 px-3 py-1.5 text-xs font-bold transition ${
                      active
                        ? 'text-jazz-blue'
                        : 'text-asphalt/70 hover:bg-black/[0.04] hover:text-asphalt'
                    }`}
                  >
                    {c.name}
                    {active && <span aria-hidden>✓</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`City: ${current.name}. Change city`}
        className="flex items-center gap-1.5 rounded-lg bg-white/75 px-1.5 py-0.5 shadow-sm backdrop-blur-sm transition hover:bg-white/90"
      >
        <span className="font-display text-xs font-extrabold tracking-tight text-asphalt/80">
          {wordmark}
        </span>
        <span className="flex items-center gap-0.5 text-[10px] font-bold text-asphalt/55">
          {current.name}
          <svg
            width="9"
            height="9"
            viewBox="0 0 10 10"
            aria-hidden
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path
              d="M2 3.5 L5 6.5 L8 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </div>
  );
}
