'use client';

interface Props {
  active: boolean;
  count: number;
  onToggle: () => void;
}

/**
 * One-tap "Careers page" filter, pinned at the head of the type-chip row.
 *
 * Deliberately NOT labelled "Hiring now": the underlying `hiring` flag tracks
 * whether we have a verified link to the company's jobs page, which is a
 * subset of who's actually hiring. Bombardier and CAE hire constantly but
 * carry no link, so "hiring" would tell the user they're not — the failure
 * mode that matters. This label promises exactly what it delivers: somewhere
 * to click. Reads in the parc-emerald green used for opportunity across the
 * app; the dot pulses when active so the narrowed view is obvious.
 */
export default function HiringToggle({ active, count, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      title="Show only companies with a careers page we link to directly"
      className={`pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-xl transition ${
        active
          ? 'border-parc-emerald bg-parc-emerald text-white'
          : 'border-black/5 bg-white/85 text-asphalt/75 hover:bg-white'
      }`}
      style={active ? { boxShadow: '0 2px 12px rgba(0,184,148,0.35)' } : undefined}
    >
      <span className="relative flex h-2 w-2 items-center justify-center" aria-hidden>
        {active && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
        )}
        <span
          className="relative inline-flex h-2 w-2 rounded-full"
          style={{ backgroundColor: active ? '#fff' : '#00B894' }}
        />
      </span>
      Careers page
      <span className={`tabular-nums ${active ? 'opacity-80' : 'opacity-60'}`}>{count}</span>
    </button>
  );
}
