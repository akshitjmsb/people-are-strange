'use client';

interface Props {
  active: boolean;
  count: number;
  onToggle: () => void;
}

/**
 * One-tap "Saved" filter — the star-shortlist twin of HiringToggle, sitting
 * beside it at the head of the chip row. Reads in montroyal-amber. Hidden
 * until the user has starred at least one company, so first-run chrome stays
 * lean on a 375px screen.
 */
export default function SavedToggle({ active, count, onToggle }: Props) {
  if (count === 0 && !active) return null;
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      title="Show only companies you saved"
      className={`pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-xl transition ${
        active
          ? 'border-montroyal-amber bg-montroyal-amber text-white'
          : 'border-black/5 bg-white/85 text-asphalt/75 hover:bg-white'
      }`}
      style={active ? { boxShadow: '0 2px 12px rgba(253,203,110,0.45)' } : undefined}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" aria-hidden>
        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      Saved
      <span className={`tabular-nums ${active ? 'opacity-80' : 'opacity-60'}`}>{count}</span>
    </button>
  );
}
