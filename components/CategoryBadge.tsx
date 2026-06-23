import { categoryDef } from '@/lib/categories';
import type { POICategory } from '@/lib/types';

interface CategoryBadgeProps {
  category: POICategory;
  size?: 'sm' | 'md';
}

/** A small colored pill identifying a POI's category. */
export default function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const def = categoryDef(category);
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold tracking-wide ${pad}`}
      style={{
        backgroundColor: `${def.color}22`,
        color: def.color,
        border: `1px solid ${def.color}55`,
      }}
    >
      <span aria-hidden>{def.emoji}</span>
      {def.label}
    </span>
  );
}
