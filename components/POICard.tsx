import { categoryDef } from '@/lib/categories';
import type { POI } from '@/lib/types';
import CategoryBadge from './CategoryBadge';

interface POICardProps {
  poi: POI;
}

/** One POI inside the bottom sheet — name, category, blurb, tags. */
export default function POICard({ poi }: POICardProps) {
  const def = categoryDef(poi.category);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:bg-white/10"
      style={{ boxShadow: `inset 3px 0 0 0 ${def.color}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-snow-white">{poi.name}</h3>
          {poi.subcategory && (
            <p className="mt-0.5 text-xs text-snow-white/50">{poi.subcategory}</p>
          )}
        </div>
        <CategoryBadge category={poi.category} size="sm" />
      </div>

      {poi.description && (
        <p className="mt-2 line-clamp-2 text-sm leading-snug text-snow-white/70">
          {poi.description}
        </p>
      )}

      {poi.address && (
        <p className="mt-2 flex items-center gap-1 text-xs text-snow-white/45">
          <span aria-hidden>📍</span>
          <span className="truncate">{poi.address}</span>
        </p>
      )}

      {poi.tags && poi.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {poi.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-snow-white/60"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
