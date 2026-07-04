'use client';

import { useEffect, useRef, useState } from 'react';

import { typeColor, typeDef } from '@/lib/categories';
import type { AICompany } from '@/lib/types';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  /** Top matches for the current query — shown as a jump-to dropdown. */
  suggestions: AICompany[];
  onPick: (c: AICompany) => void;
}

/**
 * Floating search bar pinned to the top of the map. Typing narrows the map
 * live; the dropdown underneath jumps straight to a company (arrow keys +
 * Enter work too).
 */
export default function SearchBar({
  value,
  onChange,
  resultCount,
  suggestions,
  onPick,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const open = focused && value.trim().length > 0 && suggestions.length > 0;

  // reset keyboard highlight whenever the candidate list changes
  useEffect(() => setHighlighted(-1), [value, suggestions.length]);

  const pick = (c: AICompany) => {
    onPick(c);
    setFocused(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (value) onChange('');
      else inputRef.current?.blur();
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => (h + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(suggestions[highlighted >= 0 ? highlighted : 0]);
    }
  };

  return (
    <div className="pointer-events-auto w-full">
      <div
        className={`flex items-center gap-2.5 rounded-2xl border bg-white/90 px-4 py-3 shadow-lg backdrop-blur-xl transition-shadow ${
          focused ? 'border-plateau-pink/40 shadow-xl' : 'border-black/5'
        }`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          className="shrink-0 text-asphalt/35"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          placeholder="Search Montreal — Mila, Bombardier, avionics, Mirabel…"
          className="w-full bg-transparent text-sm text-asphalt placeholder:text-asphalt/35 focus:outline-none"
          aria-label="Search companies"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {value && (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="shrink-0 rounded-full bg-black/5 p-1 text-asphalt/40 transition hover:bg-black/10 hover:text-asphalt"
            aria-label="Clear search"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      {/* jump-to dropdown */}
      {open && (
        <ul
          role="listbox"
          className="mt-1.5 overflow-hidden rounded-2xl border border-black/5 bg-white/95 shadow-xl backdrop-blur-xl"
        >
          {suggestions.map((c, i) => {
            const t = typeDef(c.type);
            return (
              <li key={c.id} role="option" aria-selected={i === highlighted}>
                <button
                  // mousedown so the click wins the race against input blur
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(c);
                  }}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition ${
                    i === highlighted ? 'bg-black/[0.045]' : ''
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: typeColor(c.type) }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-asphalt">
                      {c.name}
                    </span>
                    <span className="block truncate text-[11px] text-asphalt/50">
                      {t.label}
                      {c.neighborhood ? ` · ${c.neighborhood}` : ''}
                    </span>
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-asphalt/30" aria-hidden>
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-1.5 px-1">
        <p className="text-[11px] font-medium text-asphalt/55 drop-shadow-sm">
          <span className="font-bold tabular-nums text-asphalt/75">{resultCount}</span>{' '}
          {resultCount === 1 ? 'company' : 'companies'} on the map
        </p>
      </div>
    </div>
  );
}
