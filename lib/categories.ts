import { MONTREAL } from './colors';
import type { POICategory } from './types';

export interface CategoryDef {
  key: POICategory;
  label: string;
  emoji: string;
  color: string; // hex
}

// Each POI category gets its own slice of the Montreal palette.
export const CATEGORIES: Record<POICategory, CategoryDef> = {
  company: { key: 'company', label: 'Companies', emoji: '🏢', color: MONTREAL.jazzBlue },
  job: { key: 'job', label: 'Jobs', emoji: '💼', color: MONTREAL.mileendViolet },
  restaurant: { key: 'restaurant', label: 'Restaurants', emoji: '🍽️', color: MONTREAL.stlaurentRed },
  cafe: { key: 'cafe', label: 'Cafés', emoji: '☕', color: MONTREAL.bagelGold },
  bar: { key: 'bar', label: 'Bars', emoji: '🍸', color: MONTREAL.plateauPink },
  park: { key: 'park', label: 'Parks', emoji: '🌳', color: MONTREAL.parcEmerald },
  culture: { key: 'culture', label: 'Culture', emoji: '🎨', color: MONTREAL.mileendViolet },
  shopping: { key: 'shopping', label: 'Shopping', emoji: '🛍️', color: MONTREAL.plateauPink },
  transit: { key: 'transit', label: 'Transit', emoji: '🚇', color: MONTREAL.metroOrange },
  health: { key: 'health', label: 'Health', emoji: '🏥', color: MONTREAL.stlaurentRed },
  education: { key: 'education', label: 'Education', emoji: '🎓', color: MONTREAL.jazzBlue },
  entertainment: { key: 'entertainment', label: 'Entertainment', emoji: '🎭', color: MONTREAL.montroyalAmber },
  service: { key: 'service', label: 'Services', emoji: '🔧', color: MONTREAL.metroOrange },
  other: { key: 'other', label: 'Other', emoji: '📍', color: MONTREAL.snowWhite },
};

// Order shown in the filter chips row.
export const CATEGORY_ORDER: POICategory[] = [
  'company',
  'job',
  'restaurant',
  'cafe',
  'bar',
  'park',
  'culture',
  'entertainment',
  'transit',
  'education',
  'health',
  'shopping',
  'service',
  'other',
];

export function categoryDef(cat: POICategory): CategoryDef {
  return CATEGORIES[cat] ?? CATEGORIES.other;
}

export function categoryColor(cat: POICategory): string {
  return categoryDef(cat).color;
}
