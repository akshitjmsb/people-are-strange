// ── Vibrant Montreal palette ─────────────────────────────────────────────
// The city itself: mural alleys, painted staircases, jazz fest neon, autumn
// on Mont-Royal. These are the street-art colours the whole map is built from.

export const MONTREAL = {
  plateauPink: '#E84393', // iconic painted doors & staircases
  montroyalAmber: '#F39C12', // autumn foliage on the mountain
  jazzBlue: '#0984E3', // festival nights, winter sky
  mileendViolet: '#6C5CE7', // arts district, creative energy
  parcEmerald: '#00B894', // Parc La Fontaine, summer green
  stlaurentRed: '#FF6B6B', // the Main, neon signs
  metroOrange: '#E17055', // the rubber-tired metro
  snowWhite: '#F8F9FA', // Montreal winters
  asphalt: '#2D3436', // the city grid
  bagelGold: '#FDCB6E', // Fairmount vs St-Viateur, warm accent
} as const;

export type MontrealColor = keyof typeof MONTREAL;

// ── Aerospace palette ────────────────────────────────────────────────────
// A deliberately cool, industrial family — steel, titanium, turbine teal,
// jet navy — so the aerospace layer reads as one distinct fleet against the
// AI layer's vibrant street-art colours. (One warm "rocket" accent for space.)
export const AERO = {
  jetNavy: '#1F4E79', // deep aviation navy — OEM primes
  steelBlue: '#3A6EA5', // brushed steel — Tier 1 suppliers
  fuselageBlue: '#5B8FB0', // lighter alloy blue — Tier 2 suppliers
  turbineTeal: '#0E8174', // engine / MRO teal
  carbonSlate: '#394B59', // carbon-fibre slate — defense & avionics
  rocketRust: '#C0563A', // launch flame — space
  skyCyan: '#17A2B8', // open-sky cyan — research & education
  hangarAqua: '#2BB3A3', // bright aqua — aerospace startups
  titaniumGrey: '#6C7A89', // titanium — clusters / funds
} as const;

export type AeroColor = keyof typeof AERO;

/** Convert a #rrggbb hex string to a deck.gl [r,g,b] tuple. */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Convert a #rrggbb hex to a deck.gl [r,g,b,a] tuple (alpha 0-255). */
export function hexToRgba(hex: string, alpha = 255): [number, number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  return [r, g, b, alpha];
}
