'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

/** Floating search bar pinned to the top of the map. */
export default function SearchBar({ value, onChange, resultCount }: SearchBarProps) {
  return (
    <div className="pointer-events-auto w-full">
      <div className="flex items-center gap-2 rounded-2xl border border-black/5 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-xl">
        <span aria-hidden className="text-asphalt/40">🔎</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search Montreal — Mila, Bombardier, avionics, Mirabel…"
          className="w-full bg-transparent text-sm text-asphalt placeholder:text-asphalt/35 focus:outline-none"
          aria-label="Search companies"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="text-asphalt/35 transition hover:text-asphalt"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      <div className="mt-1.5 px-1">
        <p className="text-[11px] font-medium text-asphalt/55 drop-shadow-sm">
          {resultCount} {resultCount === 1 ? 'company' : 'companies'}
        </p>
      </div>
    </div>
  );
}
