'use client';

// ── Saved companies ──────────────────────────────────────────────────────
// A star-your-shortlist feature backed by localStorage — no accounts, works
// offline (it's a PWA), survives visits. One hook instance lives in the page
// and is passed down, so every star button shares the same state.

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'pas-mtl:saved-companies';

function readSaved(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr: unknown = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

export function useSavedCompanies() {
  // start empty and hydrate after mount so SSR markup never mismatches
  const [saved, setSaved] = useState<Set<string>>(new Set());
  useEffect(() => setSaved(readSaved()), []);

  const toggleSaved = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // storage full / private mode — the in-memory set still works this visit
      }
      return next;
    });
  }, []);

  return { saved, toggleSaved };
}
