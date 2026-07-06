'use client';

interface Props {
  active: boolean;
  count: number;
  onToggle: () => void;
}

/**
 * One-tap "Hiring now" filter, pinned at the head of the type-chip row. Reads
 * in the parc-emerald "hiring" green used across the app; the live dot pulses
 * when active so it's obvious the map/list is narrowed to who's hiring.
 */
export default function HiringToggle({ active, count, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      title="Show only companies that are hiring"
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
      Hiring now
      <span className={`tabular-nums ${active ? 'opacity-80' : 'opacity-60'}`}>{count}</span>
    </button>
  );
}
