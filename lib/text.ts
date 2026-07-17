// ── Text matching ────────────────────────────────────────────────────────
// Montréal is a bilingual city: "energir" must match "Énergir" and "ocean"
// must match "Océan". `fold` lowercases and strips diacritics so search and
// suggestions compare accent-insensitively on both sides.

/** Lowercase + strip diacritics (é→e, ô→o) for accent-insensitive matching. */
export function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}
