import { AERO, ENERGY, MARINE, MONTREAL } from './colors';
import type { Domain, CompanyType, Industry } from './types';

export interface TypeDef {
  key: CompanyType;
  label: string;
  emoji: string;
  color: string; // hex — drives the marker colour
  industry: Industry;
}

// Each kind of player gets its own slice of its industry's palette: the AI
// scene draws from the vibrant Montreal street-art colours, the aerospace
// scene from a cool industrial steel/teal family so the two read as distinct
// fleets on the map.
export const COMPANY_TYPES: Record<CompanyType, TypeDef> = {
  // ── AI ──
  'research-lab': { key: 'research-lab', label: 'Research Lab', emoji: '🧠', color: MONTREAL.mileendViolet, industry: 'ai' },
  'big-tech-lab': { key: 'big-tech-lab', label: 'Big-Tech AI Lab', emoji: '🛰️', color: MONTREAL.jazzBlue, industry: 'ai' },
  startup: { key: 'startup', label: 'Startup', emoji: '🚀', color: MONTREAL.plateauPink, industry: 'ai' },
  scaleup: { key: 'scaleup', label: 'Scaleup', emoji: '📈', color: MONTREAL.parcEmerald, industry: 'ai' },
  'applied-ai': { key: 'applied-ai', label: 'Applied AI', emoji: '⚙️', color: MONTREAL.montroyalAmber, industry: 'ai' },
  incubator: { key: 'incubator', label: 'Incubator / Fund', emoji: '🌱', color: MONTREAL.bagelGold, industry: 'ai' },
  // ── Aerospace ──
  oem: { key: 'oem', label: 'OEM / Prime', emoji: '✈️', color: AERO.jetNavy, industry: 'aerospace' },
  tier1: { key: 'tier1', label: 'Tier 1 Supplier', emoji: '🔧', color: AERO.steelBlue, industry: 'aerospace' },
  tier2: { key: 'tier2', label: 'Tier 2 Supplier', emoji: '⚙️', color: AERO.fuselageBlue, industry: 'aerospace' },
  mro: { key: 'mro', label: 'MRO', emoji: '🛠️', color: AERO.turbineTeal, industry: 'aerospace' },
  defense: { key: 'defense', label: 'Defense / Avionics', emoji: '🛡️', color: AERO.carbonSlate, industry: 'aerospace' },
  space: { key: 'space', label: 'Space', emoji: '🚀', color: AERO.rocketRust, industry: 'aerospace' },
  'aero-research': { key: 'aero-research', label: 'Research / Education', emoji: '🔬', color: AERO.skyCyan, industry: 'aerospace' },
  'aero-startup': { key: 'aero-startup', label: 'Startup / Scale-up', emoji: '🛩️', color: AERO.hangarAqua, industry: 'aerospace' },
  'aero-incubator': { key: 'aero-incubator', label: 'Cluster / Fund', emoji: '🌐', color: AERO.titaniumGrey, industry: 'aerospace' },
  // ── Energy ──
  'energy-producer': { key: 'energy-producer', label: 'Producer / Developer', emoji: '⚡', color: ENERGY.sunAmber, industry: 'energy' },
  'energy-storage': { key: 'energy-storage', label: 'Storage & Smart Energy', emoji: '🔋', color: ENERGY.voltLime, industry: 'energy' },
  'energy-installer': { key: 'energy-installer', label: 'Installer / EPC', emoji: '☀️', color: ENERGY.duskOrange, industry: 'energy' },
  'energy-distributor': { key: 'energy-distributor', label: 'Distribution', emoji: '📦', color: ENERGY.copperHeat, industry: 'energy' },
  'energy-research': { key: 'energy-research', label: 'Research / Education', emoji: '🧪', color: ENERGY.solarFlare, industry: 'energy' },
  'energy-org': { key: 'energy-org', label: 'Association / Cluster', emoji: '🤝', color: ENERGY.terracotta, industry: 'energy' },
  // ── Marine ──
  'marine-shipping': { key: 'marine-shipping', label: 'Shipowner / Carrier', emoji: '🚢', color: MARINE.deepSea, industry: 'marine' },
  'marine-port': { key: 'marine-port', label: 'Port & Terminals', emoji: '⚓', color: MARINE.containerRust, industry: 'marine' },
  'marine-services': { key: 'marine-services', label: 'Marine Services', emoji: '🛟', color: MARINE.seaGlass, industry: 'marine' },
  'marine-org': { key: 'marine-org', label: 'Cluster / Association', emoji: '🌊', color: MARINE.harbourIndigo, industry: 'marine' },
};

// Order shown in the filter chips row, per industry.
export const AI_TYPE_ORDER: CompanyType[] = [
  'research-lab',
  'big-tech-lab',
  'scaleup',
  'startup',
  'applied-ai',
  'incubator',
];

export const AERO_TYPE_ORDER: CompanyType[] = [
  'oem',
  'tier1',
  'tier2',
  'mro',
  'defense',
  'space',
  'aero-research',
  'aero-startup',
  'aero-incubator',
];

export const ENERGY_TYPE_ORDER: CompanyType[] = [
  'energy-producer',
  'energy-storage',
  'energy-installer',
  'energy-distributor',
  'energy-research',
  'energy-org',
];

export const MARINE_TYPE_ORDER: CompanyType[] = [
  'marine-shipping',
  'marine-port',
  'marine-services',
  'marine-org',
];

// Combined order used when all industries are shown at once.
export const TYPE_ORDER: CompanyType[] = [
  ...AI_TYPE_ORDER,
  ...AERO_TYPE_ORDER,
  ...ENERGY_TYPE_ORDER,
  ...MARINE_TYPE_ORDER,
];

/** The chip order to show for a given industry selection. */
export function typeOrderFor(industry: Industry | 'all'): CompanyType[] {
  if (industry === 'ai') return AI_TYPE_ORDER;
  if (industry === 'aerospace') return AERO_TYPE_ORDER;
  if (industry === 'energy') return ENERGY_TYPE_ORDER;
  if (industry === 'marine') return MARINE_TYPE_ORDER;
  return TYPE_ORDER;
}

export function typeDef(t: CompanyType): TypeDef {
  return COMPANY_TYPES[t] ?? COMPANY_TYPES.startup;
}

export function typeColor(t: CompanyType): string {
  return typeDef(t).color;
}

// Human labels for capability domains (used in the detail panel + filters),
// across both industries.
export const DOMAIN_LABELS: Record<Domain, string> = {
  // AI
  LLM: 'LLMs',
  NLP: 'NLP',
  'generative-ai': 'Generative AI',
  'computer-vision': 'Computer Vision',
  'reinforcement-learning': 'Reinforcement Learning',
  robotics: 'Robotics',
  speech: 'Speech / Voice',
  'ml-platform': 'ML Platform / MLOps',
  recommendation: 'Recommendation',
  forecasting: 'Forecasting',
  'edge-ai': 'Edge AI',
  research: 'Fundamental Research',
  // Aerospace
  propulsion: 'Propulsion / Engines',
  avionics: 'Avionics',
  aerostructures: 'Aerostructures',
  mro: 'MRO',
  space: 'Space / Satellites',
  defense: 'Defense',
  uav: 'UAV / Drones',
  simulation: 'Simulation / Training',
  'landing-gear': 'Landing Gear',
  interiors: 'Cabin Interiors',
  materials: 'Advanced Materials',
  systems: 'Aircraft Systems',
  manufacturing: 'Advanced Manufacturing',
  'aero-research': 'Aerospace Research',
  'sustainable-aviation': 'Sustainable Aviation',
  // Energy
  photovoltaics: 'Photovoltaics',
  'energy-storage': 'Energy Storage',
  'solar-thermal': 'Solar Thermal',
  'grid-services': 'Grid Services',
  'ev-charging': 'EV Charging',
  'building-solar': 'Building-Integrated Solar',
  'off-grid': 'Off-Grid Systems',
  'project-development': 'Project Development',
  wind: 'Wind Power',
  hydro: 'Hydropower',
  'gas-distribution': 'Gas & Distribution',
  // Marine
  shipping: 'Shipping',
  'port-operations': 'Port Operations',
  'cargo-handling': 'Cargo Handling',
  'towing-salvage': 'Towing & Salvage',
  'marine-logistics': 'Marine Logistics',
  'arctic-shipping': 'Arctic Shipping',
  'green-shipping': 'Green Shipping',
  'ship-services': 'Ship Services',
};

export function domainLabel(d: Domain): string {
  return DOMAIN_LABELS[d] ?? d;
}
