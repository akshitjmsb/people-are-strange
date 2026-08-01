// ── City palettes ────────────────────────────────────────────────────────
// Each city's own palette lives in its config file (lib/cities/*.ts). The
// shared industry palettes below are used by all cities.

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

// ── Energy palette ───────────────────────────────────────────────────────
// A warm power family — amber, dusk orange, copper, gold — with one battery
// lime for storage, so the energy layer reads as its own sunrise against the
// AI street-art colours and the aerospace steel/teal fleet.
export const ENERGY = {
  sunAmber: '#F59E0B', // high noon — producers & developers
  duskOrange: '#EA580C', // sunset over the grid — installers & EPC
  voltLime: '#65A30D', // battery charge — storage & smart energy
  copperHeat: '#B45309', // copper wiring — distribution & equipment
  solarFlare: '#FACC15', // pure sunlight — research & education
  terracotta: '#C97B5C', // rooftop tiles — associations & clusters
} as const;

export type EnergyColor = keyof typeof ENERGY;

// ── Marine palette ───────────────────────────────────────────────────────
// The St. Lawrence at work — deep-sea blue, container rust, sea-glass teal,
// harbour indigo — so the marine layer reads as the river against the other
// industries' palettes.
export const MARINE = {
  deepSea: '#0D4F6E', // open-water blue — shipowners & carriers
  containerRust: '#B34233', // weathered container steel — port & terminals
  seaGlass: '#00838F', // river teal — marine services
  harbourIndigo: '#455A9E', // dusk over the harbour — clusters & associations
} as const;

export type MarineColor = keyof typeof MARINE;

// ── Gaming / VFX palette ────────────────────────────────────────────────
// Montreal is a top-3 global gaming city — 250+ studios and 15,000+ jobs.
// A neon-lit, screen-glow family: electric purple, pixel green, controller
// blue, render orange — so the gaming layer reads as the arcade against
// the other industries' palettes.
export const GAMING = {
  neonPurple: '#7B2FF7', // studio-glow purple — AAA studios
  pixelGreen: '#10B981', // HP-bar green — mid-size studios
  controllerBlue: '#3B82F6', // screen blue — indie studios
  renderOrange: '#F97316', // render-farm amber — VFX / animation houses
  questGold: '#EAB308', // loot-drop gold — game services & QA
  arcadeMagenta: '#D946EF', // cabinet magenta — industry orgs
} as const;

export type GamingColor = keyof typeof GAMING;

// ── Life Sciences palette ───────────────────────────────────────────────
// The health corridor — clinical white-coat teal, pharma blue, biotech
// green, research violet — so the life sciences layer reads as the lab
// against the other industries' palettes.
export const LIFESCI = {
  pharmaTeal: '#0891B2', // clinical teal — big pharma HQs
  biotechGreen: '#059669', // growth green — biotech companies
  labCoral: '#E11D48', // lab-coat coral — CROs / contract research
  researchIndigo: '#4F46E5', // deep indigo — research institutes
  clusterSlate: '#64748B', // cool slate — industry orgs
} as const;

export type LifeSciColor = keyof typeof LIFESCI;

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
