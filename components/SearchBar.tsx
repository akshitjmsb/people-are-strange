'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  source: 'supabase' | 'local' | null;
}

/** Floating frosted-glass search bar pinned to the top of the map. */
export default function SearchBar({ value, onChange, resultCount, source }: SearchBarProps) {
  return (
    <div className="pointer-events-auto w-full">
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-asphalt/70 px-4 py-3 shadow-lg backdrop-blur-2xl">
        <span aria-hidden className="text-snow-white/50">🔎</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search Montreal — Mila, Schwartz's, Mont-Royal…"
          className="w-full bg-transparent text-sm text-snow-white placeholder:text-snow-white/35 focus:outline-none"
          aria-label="Search POIs"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="text-snow-white/40 transition hover:text-snow-white"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      <div className="mt-1.5 flex items-center justify-between px-1">
        <p className="text-[11px] text-snow-white/45">
          {resultCount} {resultCount === 1 ? 'place' : 'places'}
        </p>
        {source && (
          <span className="flex items-center gap-1 text-[11px] text-snow-white/40">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                source === 'supabase' ? 'bg-parc-emerald' : 'bg-bagel-gold'
              }`}
            />
            {source === 'supabase' ? 'live' : 'seed data'}
          </span>
        )}
      </div>
    </div>
  );
}
