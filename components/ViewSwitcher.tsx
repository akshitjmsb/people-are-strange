'use client';

import { AREA_ACCENT } from '@/lib/categories';

export type ViewMode = 'map' | 'list';

interface Props {
  view: ViewMode;
  onView: (v: ViewMode) => void;
  onOpenAreas: () => void;
  onOpenDashboard: () => void;
  /** Name of the active neighborhood, shown as a badge on the Areas button. */
  activeArea: string | null;
}

/**
 * Floating bottom toolbar: the Map/List switch plus quick access to the
 * neighborhood picker and the ecosystem dashboard. Thumb-reachable on mobile,
 * centred on desktop; the whole app's extra views hang off this one bar.
 */
export default function ViewSwitcher({
  view,
  onView,
  onOpenAreas,
  onOpenDashboard,
  activeArea,
}: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(0.9rem,env(safe-area-inset-bottom))] z-20 flex justify-center px-3">
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-black/5 bg-white/90 p-1.5 shadow-xl backdrop-blur-xl">
        {/* Map / List segmented control */}
        <div className="flex items-center rounded-xl bg-black/[0.04] p-0.5">
          <SegButton active={view === 'map'} onClick={() => onView('map')} label="Map">
            <MapIcon />
          </SegButton>
          <SegButton active={view === 'list'} onClick={() => onView('list')} label="List">
            <ListIcon />
          </SegButton>
        </div>

        <span className="mx-0.5 h-6 w-px bg-black/10" aria-hidden />

        <ToolButton
          onClick={onOpenAreas}
          label="Areas"
          badge={activeArea ? '1' : null}
          accent={AREA_ACCENT}
        >
          <PinIcon />
        </ToolButton>
        <ToolButton onClick={onOpenDashboard} label="Stats">
          <ChartIcon />
        </ToolButton>
      </div>
    </div>
  );
}

function SegButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
        active ? 'bg-asphalt text-snow-white shadow-sm' : 'text-asphalt/60 hover:text-asphalt'
      }`}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

function ToolButton({
  onClick,
  label,
  children,
  badge,
  accent,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  badge?: string | null;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-asphalt/70 transition hover:bg-black/[0.04] hover:text-asphalt"
    >
      {children}
      <span>{label}</span>
      {badge && (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[9px] font-black text-white"
          style={{ backgroundColor: accent ?? '#2D3436' }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function MapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3v18h18" />
      <rect x="7" y="11" width="3" height="6" rx="0.5" />
      <rect x="12.5" y="7" width="3" height="10" rx="0.5" />
      <rect x="18" y="13" width="3" height="4" rx="0.5" />
    </svg>
  );
}
