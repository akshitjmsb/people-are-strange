export type POICategory =
  | 'company'
  | 'job'
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'park'
  | 'culture'
  | 'shopping'
  | 'transit'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'service'
  | 'other';

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  subcategory?: string;
  description?: string;
  lat: number;
  lng: number;
  h3_res9: string;
  h3_res7: string;
  address?: string;
  tags?: string[];
  source?: string;
  source_id?: string;
  metadata?: Record<string, unknown>;
}

/** One aggregated H3 cell, ready to feed the deck.gl H3HexagonLayer. */
export interface HexCell {
  hexId: string;
  count: number;
  categories: POICategory[];
  dominantCategory: POICategory;
}

export type H3Resolution = 7 | 9;
