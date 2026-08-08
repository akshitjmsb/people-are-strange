// ── Victoria BC city configuration ───────────────────────────────────────
// Pacific Northwest capital: naval base, ocean tech hub, government town,
// and a growing software scene. When NEXT_PUBLIC_CITY=victoria, this is
// the config that drives the map.

import { LIFESCI } from '../colors';
import type { CityConfig } from '../city-config';

// ── Victoria's own palette ──────────────────────────────────────────────
// Pacific Northwest mist, harbour steel, Garry oak canopy, Parliament gold.
const PALETTE = {
  innerHarbourTeal: '#1B6B8A',
  mossGreen: '#4A7C59',
  driftwoodGrey: '#8B8D8A',
  parliamentGold: '#C19A3E',
  oceanSlate: '#2C4F5C',
  garryOak: '#5D6E3E',
  fogSilver: '#B0BEC5',
  salishTeal: '#0D6E6E',
  harbourBlue: '#1565C0',
  basaltInk: '#263238',
} as const;

// ── Victoria's industry palettes ────────────────────────────────────────
// Each industry gets its own colour family so the layers read as distinct
// fleets on the map, just like Montreal's.

const VIC_TECH = {
  softwareBlue: '#2196F3',
  startupTeal: '#00ACC1',
  scaleupGreen: '#43A047',
  enterpriseNavy: '#1A237E',
  agencyAmber: '#FF8F00',
  govTechSlate: '#546E7A',
} as const;

const VIC_DEFENSE = {
  navalNavy: '#0D47A1',
  contractorSteel: '#37474F',
  defenseGreen: '#2E7D32',
  researchCyan: '#00838F',
} as const;

const VIC_OCEAN = {
  deepOcean: '#006064',
  oceanStartup: '#00897B',
  marineServices: '#4DB6AC',
  researchIndigo: '#283593',
} as const;

const VIC_CLEANTECH = {
  solarAmber: '#F57F17',
  utilityGreen: '#1B5E20',
  cleanStartup: '#7CB342',
  cleanServices: '#8D6E63',
  cleanResearch: '#FDD835',
} as const;

const VIC_GOV = {
  provincialBlue: '#1976D2',
  federalRed: '#C62828',
  crownTeal: '#00695C',
  municipalGrey: '#616161',
} as const;

export const victoria: CityConfig = {
  id: 'victoria',
  name: 'Victoria',
  tagline: "Victoria's tech, defense, ocean & government scene, mapped",
  mapCenter: [48.4284, -123.3656],
  defaultZoom: 12,
  themeColor: '#1B6B8A',

  industries: ['tech', 'defense', 'ocean', 'cleantech', 'government', 'lifesci'] as CityConfig['industries'],

  industryMeta: {
    tech: { label: 'Tech', emoji: '💻', color: VIC_TECH.softwareBlue },
    defense: { label: 'Defense', emoji: '⚓', color: VIC_DEFENSE.navalNavy },
    ocean: { label: 'Ocean Tech', emoji: '🌊', color: VIC_OCEAN.deepOcean },
    cleantech: { label: 'Clean Tech', emoji: '🌿', color: VIC_CLEANTECH.utilityGreen },
    government: { label: 'Government', emoji: '🏛️', color: VIC_GOV.provincialBlue },
    lifesci: { label: 'Life Sciences', emoji: '🧬', color: LIFESCI.pharmaTeal },
  },

  companyTypes: {
    // ── Tech ──
    'tech-startup': { key: 'tech-startup', label: 'Startup', emoji: '🚀', color: VIC_TECH.startupTeal, industry: 'tech' },
    'tech-scaleup': { key: 'tech-scaleup', label: 'Scaleup', emoji: '📈', color: VIC_TECH.scaleupGreen, industry: 'tech' },
    'tech-enterprise': { key: 'tech-enterprise', label: 'Enterprise', emoji: '🏢', color: VIC_TECH.enterpriseNavy, industry: 'tech' },
    'tech-agency': { key: 'tech-agency', label: 'Agency / Services', emoji: '⚙️', color: VIC_TECH.agencyAmber, industry: 'tech' },
    'tech-govtech': { key: 'tech-govtech', label: 'GovTech', emoji: '🖥️', color: VIC_TECH.govTechSlate, industry: 'tech' },
    'tech-platform': { key: 'tech-platform', label: 'Platform / SaaS', emoji: '☁️', color: VIC_TECH.softwareBlue, industry: 'tech' },
    // ── Defense ──
    'defense-naval': { key: 'defense-naval', label: 'Naval Prime', emoji: '⚓', color: VIC_DEFENSE.navalNavy, industry: 'defense' },
    'defense-contractor': { key: 'defense-contractor', label: 'Defense Contractor', emoji: '🛡️', color: VIC_DEFENSE.contractorSteel, industry: 'defense' },
    'defense-services': { key: 'defense-services', label: 'Defense Services', emoji: '🔧', color: VIC_DEFENSE.defenseGreen, industry: 'defense' },
    'defense-research': { key: 'defense-research', label: 'Defense Research', emoji: '🔬', color: VIC_DEFENSE.researchCyan, industry: 'defense' },
    // ── Ocean Tech ──
    'ocean-tech': { key: 'ocean-tech', label: 'Ocean Tech', emoji: '🌊', color: VIC_OCEAN.deepOcean, industry: 'ocean' },
    'ocean-research': { key: 'ocean-research', label: 'Ocean Research', emoji: '🔬', color: VIC_OCEAN.researchIndigo, industry: 'ocean' },
    'ocean-services': { key: 'ocean-services', label: 'Marine Services', emoji: '🛟', color: VIC_OCEAN.marineServices, industry: 'ocean' },
    'ocean-startup': { key: 'ocean-startup', label: 'Ocean Startup', emoji: '🚀', color: VIC_OCEAN.oceanStartup, industry: 'ocean' },
    // ── Clean Tech ──
    'cleantech-utility': { key: 'cleantech-utility', label: 'Utility / Producer', emoji: '⚡', color: VIC_CLEANTECH.utilityGreen, industry: 'cleantech' },
    'cleantech-startup': { key: 'cleantech-startup', label: 'CleanTech Startup', emoji: '🌱', color: VIC_CLEANTECH.cleanStartup, industry: 'cleantech' },
    'cleantech-services': { key: 'cleantech-services', label: 'CleanTech Services', emoji: '🔧', color: VIC_CLEANTECH.cleanServices, industry: 'cleantech' },
    'cleantech-research': { key: 'cleantech-research', label: 'CleanTech Research', emoji: '🧪', color: VIC_CLEANTECH.cleanResearch, industry: 'cleantech' },
    // ── Government ──
    'gov-provincial': { key: 'gov-provincial', label: 'Provincial', emoji: '🏛️', color: VIC_GOV.provincialBlue, industry: 'government' },
    'gov-federal': { key: 'gov-federal', label: 'Federal', emoji: '🍁', color: VIC_GOV.federalRed, industry: 'government' },
    'gov-crown': { key: 'gov-crown', label: 'Crown Corp', emoji: '👑', color: VIC_GOV.crownTeal, industry: 'government' },
    'gov-municipal': { key: 'gov-municipal', label: 'Municipal', emoji: '🏘️', color: VIC_GOV.municipalGrey, industry: 'government' },
    // ── Life Sciences ──
    'lifesci-pharma': { key: 'lifesci-pharma', label: 'Pharma', emoji: '💊', color: LIFESCI.pharmaTeal, industry: 'lifesci' },
    'lifesci-biotech': { key: 'lifesci-biotech', label: 'Biotech', emoji: '🧬', color: LIFESCI.biotechGreen, industry: 'lifesci' },
    'lifesci-research': { key: 'lifesci-research', label: 'Research Institute', emoji: '🏥', color: LIFESCI.researchIndigo, industry: 'lifesci' },
  },

  typeOrder: {
    tech: ['tech-startup', 'tech-scaleup', 'tech-enterprise', 'tech-platform', 'tech-agency', 'tech-govtech'],
    defense: ['defense-naval', 'defense-contractor', 'defense-services', 'defense-research'],
    ocean: ['ocean-tech', 'ocean-startup', 'ocean-services', 'ocean-research'],
    cleantech: ['cleantech-utility', 'cleantech-startup', 'cleantech-services', 'cleantech-research'],
    government: ['gov-provincial', 'gov-crown', 'gov-federal', 'gov-municipal'],
    lifesci: ['lifesci-pharma', 'lifesci-biotech', 'lifesci-research'],
    all: [
      'tech-startup', 'tech-scaleup', 'tech-enterprise', 'tech-platform', 'tech-agency', 'tech-govtech',
      'defense-naval', 'defense-contractor', 'defense-services', 'defense-research',
      'ocean-tech', 'ocean-startup', 'ocean-services', 'ocean-research',
      'cleantech-utility', 'cleantech-startup', 'cleantech-services', 'cleantech-research',
      'gov-provincial', 'gov-crown', 'gov-federal', 'gov-municipal',
      'lifesci-pharma', 'lifesci-biotech', 'lifesci-research',
    ],
  },

  domainLabels: {
    // Tech
    'saas': 'SaaS', 'fintech': 'Fintech', 'edtech': 'EdTech',
    'healthtech': 'HealthTech', 'proptech': 'PropTech', 'martech': 'MarTech',
    'cybersecurity': 'Cybersecurity', 'data-analytics': 'Data & Analytics',
    'cloud-infra': 'Cloud / Infrastructure', 'devtools': 'DevTools',
    'ai-ml': 'AI / ML', 'iot': 'IoT', 'gaming-tech': 'Gaming',
    'ecommerce': 'E-commerce', 'gis-geospatial': 'GIS / Geospatial',
    // Defense
    'naval-engineering': 'Naval Engineering', 'submarine-support': 'Submarine Support',
    'shipbuilding': 'Shipbuilding & Repair', 'defense-electronics': 'Defense Electronics',
    'simulation-training': 'Simulation & Training', 'fleet-maintenance': 'Fleet Maintenance',
    // Ocean
    'ocean-monitoring': 'Ocean Monitoring', 'autonomous-vessels': 'Autonomous Vessels',
    'marine-biology': 'Marine Biology', 'hydrography': 'Hydrography',
    'coastal-intelligence': 'Coastal Intelligence', 'ocean-instruments': 'Ocean Instruments',
    'fisheries-tech': 'Fisheries Tech', 'marine-renewables': 'Marine Renewables',
    // Clean Tech
    'clean-water': 'Clean Water', 'renewable-energy': 'Renewable Energy',
    'grid-management': 'Grid Management', 'energy-efficiency': 'Energy Efficiency',
    'electric-utility': 'Electric Utility', 'gas-utility': 'Gas Utility',
    // Government
    'public-service': 'Public Service', 'insurance-crown': 'Insurance',
    'pension-admin': 'Pension Admin', 'digital-services': 'Digital Services',
    'resource-management': 'Resource Management',
    // Life Sciences (shared with Montreal)
    pharmaceuticals: 'Pharmaceuticals', 'biotech-rd': 'Biotech R&D',
    'clinical-trials': 'Clinical Trials', 'precision-medicine': 'Precision Medicine',
    immunotherapy: 'Immunotherapy', 'drug-discovery': 'Drug Discovery',
  },

  canonicalNeighborhoods: {
    'Downtown': 'Downtown',
    'Downtown Victoria': 'Downtown',
    'Harris Green': 'Downtown',
    'James Bay': 'James Bay',
    'Fernwood': 'Fernwood',
    'Fairfield': 'Fairfield',
    'Gonzales': 'Fairfield',
    'Oak Bay': 'Oak Bay',
    'Esquimalt': 'Esquimalt',
    'CFB Esquimalt': 'Esquimalt',
    'Vic West': 'Vic West',
    'Victoria West': 'Vic West',
    'Burnside': 'Burnside-Gorge',
    'Burnside-Gorge': 'Burnside-Gorge',
    'Hillside': 'Hillside-Quadra',
    'Hillside-Quadra': 'Hillside-Quadra',
    'North Park': 'North Park',
    'Rockland': 'Rockland',
    'Saanich': 'Saanich',
    'Central Saanich': 'Central Saanich',
    'North Saanich': 'North Saanich',
    'Sidney': 'Sidney',
    'Langford': 'Langford',
    'Colwood': 'Colwood',
    'View Royal': 'View Royal',
    'Sooke': 'Sooke',
    'Metchosin': 'Metchosin',
    'Highlands': 'Highlands',
    'Saanichton': 'Central Saanich',
    'Brentwood Bay': 'Central Saanich',
    'Royal Oak': 'Saanich',
    'Gordon Head': 'Saanich',
    'Cordova Bay': 'Saanich',
    'Cadboro Bay': 'Saanich',
    'UVic': 'Saanich',
    'University of Victoria': 'Saanich',
    'Victoria': 'Greater Victoria',
  },

  localityPattern: /victoria|esquimalt|saanich|sidney|langford|colwood|sooke|oak bay|metchosin|view royal|vancouver island|\bvi\b|\bbc\b|british columbia/,
  localityAmbiguousPattern: /^(?:canada\s*[-–—]?\s*)?(?:remote|hybrid)$|^canada$|^anywhere$|^worldwide$/,

  lngScale: 1 / Math.cos((48.4 * Math.PI) / 180),

  cityPalette: PALETTE,
  areaAccent: PALETTE.basaltInk,

  metaTitle: 'People Are Strange — Victoria Industry Map',
  metaDescription: "Victoria's tech, defense, ocean tech and government scenes on one living map. Every company, base, lab and agency — what they're building, where they are.",
  loadingText: 'Mapping Victoria…',
  csvPrefix: 'victoria',
};
