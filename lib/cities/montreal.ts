// ── Montreal city configuration ──────────────────────────────────────────
// Everything that makes the app "Montréal" lives here. When the app runs
// with NEXT_PUBLIC_CITY=montreal (the default), this is the config.

import { AERO, ENERGY, ENTERPRISE, FINANCE, GAMING, LIFESCI, MARINE } from '../colors';
import type { CityConfig } from '../city-config';

// ── Montreal's own palette ──────────────────────────────────────────────
// The city itself: mural alleys, painted staircases, jazz fest neon, autumn
// on Mont-Royal. These are the street-art colours the whole map is built from.
const PALETTE = {
  plateauPink: '#E84393',
  montroyalAmber: '#F39C12',
  jazzBlue: '#0984E3',
  mileendViolet: '#6C5CE7',
  parcEmerald: '#00B894',
  stlaurentRed: '#FF6B6B',
  metroOrange: '#E17055',
  snowWhite: '#F8F9FA',
  asphalt: '#2D3436',
  bagelGold: '#FDCB6E',
} as const;

export const montreal: CityConfig = {
  id: 'montreal',
  name: 'Montréal',
  tagline: "Montreal's AI, aerospace, energy & marine scene, mapped",
  mapCenter: [45.5017, -73.5673],
  defaultZoom: 12,
  themeColor: '#E84393',

  industries: ['ai', 'aerospace', 'energy', 'marine', 'gaming', 'lifesci', 'financial', 'enterprise'],

  industryMeta: {
    ai: { label: 'AI', emoji: '🧠', color: PALETTE.mileendViolet },
    aerospace: { label: 'Aerospace', emoji: '✈️', color: AERO.jetNavy },
    energy: { label: 'Energy', emoji: '⚡', color: ENERGY.sunAmber },
    marine: { label: 'Marine', emoji: '🚢', color: MARINE.deepSea },
    gaming: { label: 'Gaming', emoji: '🎮', color: GAMING.neonPurple },
    lifesci: { label: 'Life Sciences', emoji: '🧬', color: LIFESCI.pharmaTeal },
    financial: { label: 'Financial', emoji: '🏦', color: FINANCE.vaultGreen },
    enterprise: { label: 'Enterprise Tech', emoji: '💼', color: ENTERPRISE.cloudIndigo },
  },

  companyTypes: {
    // ── AI ──
    'research-lab': { key: 'research-lab', label: 'Research Lab', emoji: '🧠', color: PALETTE.mileendViolet, industry: 'ai' },
    'big-tech-lab': { key: 'big-tech-lab', label: 'Big-Tech AI Lab', emoji: '🛰️', color: PALETTE.jazzBlue, industry: 'ai' },
    startup: { key: 'startup', label: 'Startup', emoji: '🚀', color: PALETTE.plateauPink, industry: 'ai' },
    scaleup: { key: 'scaleup', label: 'Scaleup', emoji: '📈', color: PALETTE.parcEmerald, industry: 'ai' },
    'applied-ai': { key: 'applied-ai', label: 'Applied AI', emoji: '⚙️', color: PALETTE.montroyalAmber, industry: 'ai' },
    incubator: { key: 'incubator', label: 'Incubator / Fund', emoji: '🌱', color: PALETTE.bagelGold, industry: 'ai' },
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
    // ── Gaming / VFX ──
    'gaming-aaa': { key: 'gaming-aaa', label: 'AAA Studio', emoji: '🎮', color: GAMING.neonPurple, industry: 'gaming' },
    'gaming-mid': { key: 'gaming-mid', label: 'Mid-Size Studio', emoji: '🕹️', color: GAMING.pixelGreen, industry: 'gaming' },
    'gaming-indie': { key: 'gaming-indie', label: 'Indie Studio', emoji: '👾', color: GAMING.controllerBlue, industry: 'gaming' },
    'gaming-vfx': { key: 'gaming-vfx', label: 'VFX / Animation', emoji: '🎬', color: GAMING.renderOrange, industry: 'gaming' },
    'gaming-services': { key: 'gaming-services', label: 'Game Services', emoji: '🧪', color: GAMING.questGold, industry: 'gaming' },
    'gaming-org': { key: 'gaming-org', label: 'Industry Org', emoji: '🏛️', color: GAMING.arcadeMagenta, industry: 'gaming' },
    // ── Life Sciences ──
    'lifesci-pharma': { key: 'lifesci-pharma', label: 'Pharma', emoji: '💊', color: LIFESCI.pharmaTeal, industry: 'lifesci' },
    'lifesci-biotech': { key: 'lifesci-biotech', label: 'Biotech', emoji: '🧬', color: LIFESCI.biotechGreen, industry: 'lifesci' },
    'lifesci-cro': { key: 'lifesci-cro', label: 'CRO / Services', emoji: '🔬', color: LIFESCI.labCoral, industry: 'lifesci' },
    'lifesci-research': { key: 'lifesci-research', label: 'Research Institute', emoji: '🏥', color: LIFESCI.researchIndigo, industry: 'lifesci' },
    'lifesci-org': { key: 'lifesci-org', label: 'Cluster / Association', emoji: '🤝', color: LIFESCI.clusterSlate, industry: 'lifesci' },
    // ── Financial Services ──
    'fin-bank': { key: 'fin-bank', label: 'Bank', emoji: '🏦', color: FINANCE.vaultGreen, industry: 'financial' },
    'fin-insurance': { key: 'fin-insurance', label: 'Insurance', emoji: '☂️', color: FINANCE.shieldTeal, industry: 'financial' },
    'fin-fintech': { key: 'fin-fintech', label: 'Fintech / Payments', emoji: '💳', color: FINANCE.fintechLime, industry: 'financial' },
    'fin-asset': { key: 'fin-asset', label: 'Asset & Wealth Mgmt', emoji: '💹', color: FINANCE.goldLeaf, industry: 'financial' },
    'fin-pension': { key: 'fin-pension', label: 'Pension Fund', emoji: '🏛️', color: FINANCE.pensionNavy, industry: 'financial' },
    // ── Enterprise Tech ──
    'ent-bigtech': { key: 'ent-bigtech', label: 'Big-Tech Office', emoji: '💻', color: ENTERPRISE.cloudIndigo, industry: 'enterprise' },
    'ent-consulting': { key: 'ent-consulting', label: 'Consulting', emoji: '📊', color: ENTERPRISE.consultBlue, industry: 'enterprise' },
    'ent-saas': { key: 'ent-saas', label: 'SaaS / Enterprise', emoji: '☁️', color: ENTERPRISE.saasSky, industry: 'enterprise' },
    'ent-telecom': { key: 'ent-telecom', label: 'Telecom', emoji: '📡', color: ENTERPRISE.telecomPlum, industry: 'enterprise' },
    'ent-itservices': { key: 'ent-itservices', label: 'IT Services', emoji: '🖥️', color: ENTERPRISE.itGraphite, industry: 'enterprise' },
  },

  typeOrder: {
    ai: ['research-lab', 'big-tech-lab', 'scaleup', 'startup', 'applied-ai', 'incubator'],
    aerospace: ['oem', 'tier1', 'tier2', 'mro', 'defense', 'space', 'aero-research', 'aero-startup', 'aero-incubator'],
    energy: ['energy-producer', 'energy-storage', 'energy-installer', 'energy-distributor', 'energy-research', 'energy-org'],
    marine: ['marine-shipping', 'marine-port', 'marine-services', 'marine-org'],
    gaming: ['gaming-aaa', 'gaming-mid', 'gaming-indie', 'gaming-vfx', 'gaming-services', 'gaming-org'],
    lifesci: ['lifesci-pharma', 'lifesci-biotech', 'lifesci-cro', 'lifesci-research', 'lifesci-org'],
    financial: ['fin-bank', 'fin-insurance', 'fin-asset', 'fin-pension', 'fin-fintech'],
    enterprise: ['ent-bigtech', 'ent-saas', 'ent-itservices', 'ent-consulting', 'ent-telecom'],
    all: [
      'research-lab', 'big-tech-lab', 'scaleup', 'startup', 'applied-ai', 'incubator',
      'oem', 'tier1', 'tier2', 'mro', 'defense', 'space', 'aero-research', 'aero-startup', 'aero-incubator',
      'energy-producer', 'energy-storage', 'energy-installer', 'energy-distributor', 'energy-research', 'energy-org',
      'marine-shipping', 'marine-port', 'marine-services', 'marine-org',
      'gaming-aaa', 'gaming-mid', 'gaming-indie', 'gaming-vfx', 'gaming-services', 'gaming-org',
      'lifesci-pharma', 'lifesci-biotech', 'lifesci-cro', 'lifesci-research', 'lifesci-org',
      'fin-bank', 'fin-insurance', 'fin-asset', 'fin-pension', 'fin-fintech',
      'ent-bigtech', 'ent-saas', 'ent-itservices', 'ent-consulting', 'ent-telecom',
    ],
  },

  domainLabels: {
    // AI
    LLM: 'LLMs', NLP: 'NLP', 'generative-ai': 'Generative AI',
    'computer-vision': 'Computer Vision', 'reinforcement-learning': 'Reinforcement Learning',
    robotics: 'Robotics', speech: 'Speech / Voice', 'ml-platform': 'ML Platform / MLOps',
    recommendation: 'Recommendation', forecasting: 'Forecasting', 'edge-ai': 'Edge AI',
    research: 'Fundamental Research',
    // Aerospace
    propulsion: 'Propulsion / Engines', avionics: 'Avionics', aerostructures: 'Aerostructures',
    mro: 'MRO', space: 'Space / Satellites', defense: 'Defense', uav: 'UAV / Drones',
    simulation: 'Simulation / Training', 'landing-gear': 'Landing Gear',
    interiors: 'Cabin Interiors', materials: 'Advanced Materials', systems: 'Aircraft Systems',
    manufacturing: 'Advanced Manufacturing', 'aero-research': 'Aerospace Research',
    'sustainable-aviation': 'Sustainable Aviation',
    // Energy
    photovoltaics: 'Photovoltaics', 'energy-storage': 'Energy Storage',
    'solar-thermal': 'Solar Thermal', 'grid-services': 'Grid Services',
    'ev-charging': 'EV Charging', 'building-solar': 'Building-Integrated Solar',
    'off-grid': 'Off-Grid Systems', 'project-development': 'Project Development',
    wind: 'Wind Power', hydro: 'Hydropower', 'gas-distribution': 'Gas & Distribution',
    // Marine
    shipping: 'Shipping', 'port-operations': 'Port Operations',
    'cargo-handling': 'Cargo Handling', 'towing-salvage': 'Towing & Salvage',
    'marine-logistics': 'Marine Logistics', 'arctic-shipping': 'Arctic Shipping',
    'green-shipping': 'Green Shipping', 'ship-services': 'Ship Services',
    // Gaming / VFX
    'aaa-games': 'AAA Games', 'indie-games': 'Indie Games', 'mobile-games': 'Mobile Games',
    'live-service': 'Live Service', 'vfx-film': 'Film VFX', 'vfx-tv': 'TV VFX',
    animation: 'Animation', 'game-qa': 'Game QA', 'co-development': 'Co-Development',
    horror: 'Horror', 'open-world': 'Open World', narrative: 'Narrative',
    // Life Sciences
    pharmaceuticals: 'Pharmaceuticals', 'biotech-rd': 'Biotech R&D',
    'clinical-trials': 'Clinical Trials', 'precision-medicine': 'Precision Medicine',
    immunotherapy: 'Immunotherapy', neuroscience: 'Neuroscience',
    'rare-diseases': 'Rare Diseases', 'medical-devices': 'Medical Devices',
    'contract-research': 'Contract Research', 'drug-discovery': 'Drug Discovery',
    'cell-gene-therapy': 'Cell & Gene Therapy', diagnostics: 'Diagnostics',
    // Financial Services
    'retail-banking': 'Retail Banking', 'commercial-banking': 'Commercial Banking',
    insurance: 'Insurance', fintech: 'Fintech', 'asset-management': 'Asset Management',
    'pension-fund': 'Pension Fund', payments: 'Payments',
    'wealth-management': 'Wealth Management', 'capital-markets': 'Capital Markets',
    // Enterprise Tech
    'enterprise-software': 'Enterprise Software', 'it-consulting': 'IT Consulting',
    'cloud-computing': 'Cloud Computing', saas: 'SaaS', telecom: 'Telecom',
    erp: 'ERP', cybersecurity: 'Cybersecurity', 'digital-transformation': 'Digital Transformation',
  },

  canonicalNeighborhoods: {
    'Downtown': 'Downtown',
    'Downtown / McGill': 'Downtown',
    'McGill / Downtown': 'Downtown',
    'Downtown / Concordia': 'Downtown',
    'Mile-Ex': 'Mile-Ex',
    'Mile-End': 'Mile-End',
    'Plateau': 'Plateau',
    'Old Montreal': 'Old Montreal & Old Port',
    'Old Port': 'Old Montreal & Old Port',
    'Griffintown': 'Griffintown',
    'Saint-Henri': 'Saint-Henri',
    'Centre-Sud': 'Centre-Sud',
    'Côte-des-Neiges': 'Côte-des-Neiges',
    'Côte-des-Neiges / UdeM': 'Côte-des-Neiges',
    'Ville Saint-Laurent': 'Saint-Laurent',
    'Saint-Laurent': 'Saint-Laurent',
    'Dorval / Saint-Laurent': 'Saint-Laurent',
    'Dorval (YUL)': 'Dorval',
    'Saint-Léonard / Anjou': 'Saint-Léonard / Anjou',
    'Lachine': 'Lachine',
    'Pointe-Claire': 'West Island',
    'Sainte-Anne-de-Bellevue': 'West Island',
    'Montréal (West)': 'West Island',
    'Mirabel': 'Mirabel',
    'Mirabel (YMX)': 'Mirabel',
    'Laval': 'Laval',
    'Longueuil': 'Longueuil & Rive-Sud',
    'Saint-Hubert (Longueuil)': 'Longueuil & Rive-Sud',
    'Saint-Bruno-de-Montarville': 'Longueuil & Rive-Sud',
    'Varennes': 'Longueuil & Rive-Sud',
    'Saint-Jean-sur-Richelieu': 'Montérégie',
    'Bromont': 'Montérégie',
    'Sherbrooke': 'Estrie',
    'Port de Montréal (east end)': 'Port de Montréal',
    'Port de Montréal (Viau / Maisonneuve)': 'Port de Montréal',
    'Bickerdike Terminal / Cité du Havre': 'Port de Montréal',
    'Cité du Havre': 'Port de Montréal',
    'Montréal': 'Greater Montréal',
  },

  localityPattern: /montr[eé]al|qu[eé]bec|\bqc\b|laval|longueuil|brossard|saint-laurent/,
  localityAmbiguousPattern: /^canada$|remote|anywhere|worldwide|monde entier|hybrid/,

  lngScale: 1 / Math.cos((45.5 * Math.PI) / 180),

  cityPalette: PALETTE,
  areaAccent: PALETTE.asphalt,

  metaTitle: 'People Are Strange — Montréal Industry Map',
  metaDescription: "Montreal's AI, aerospace, energy and marine scenes on one living map. Every lab, startup, plant and port — what they're building, where they are.",
  loadingText: 'Mapping Montréal…',
  csvPrefix: 'montreal',
};
