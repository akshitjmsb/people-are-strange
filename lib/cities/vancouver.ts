// ── Metro Vancouver city configuration ──────────────────────────────────────
// A Pacific technology hub spanning Vancouver, Burnaby, Richmond, and the
// North Shore. The data is regional because the local job market crosses
// municipal borders every day.

import { GAMING, LIFESCI, MARINE } from '../colors';
import type { CityConfig } from '../city-config';

const PALETTE = {
  pacificBlue: '#0B6E99',
  rainGreen: '#17825B',
  mountainInk: '#263746',
  sunsetCoral: '#E76F51',
  glassBlue: '#4C9FD8',
  cedarGold: '#C58B2A',
} as const;

const TECH = {
  startup: '#08A6A6',
  scaleup: '#2F9E44',
  enterprise: '#2457A7',
  agency: '#D97706',
  govtech: '#607D8B',
  platform: '#6C5CE7',
} as const;

const CLEAN = {
  utility: '#1B5E20',
  startup: '#65A30D',
  services: '#8D6E63',
  research: '#CA8A04',
} as const;

export const vancouver: CityConfig = {
  id: 'vancouver',
  name: 'Vancouver',
  tagline: "Vancouver's tech, gaming, clean-tech & life-science scene, mapped",
  mapCenter: [49.2675, -123.0900],
  defaultZoom: 10.5,
  themeColor: PALETTE.pacificBlue,

  industries: ['tech', 'gaming', 'cleantech', 'lifesci', 'marine'],

  industryMeta: {
    tech: { label: 'Tech & AI', emoji: '💻', color: TECH.enterprise },
    gaming: { label: 'Gaming / VFX', emoji: '🎮', color: GAMING.neonPurple },
    cleantech: { label: 'Clean Tech', emoji: '🌿', color: CLEAN.utility },
    lifesci: { label: 'Life Sciences', emoji: '🧬', color: LIFESCI.pharmaTeal },
    marine: { label: 'Marine', emoji: '🚢', color: MARINE.deepSea },
  },

  companyTypes: {
    'tech-startup': { key: 'tech-startup', label: 'Startup', emoji: '🚀', color: TECH.startup, industry: 'tech' },
    'tech-scaleup': { key: 'tech-scaleup', label: 'Scaleup', emoji: '📈', color: TECH.scaleup, industry: 'tech' },
    'tech-enterprise': { key: 'tech-enterprise', label: 'Enterprise', emoji: '🏢', color: TECH.enterprise, industry: 'tech' },
    'tech-agency': { key: 'tech-agency', label: 'Agency / Services', emoji: '⚙️', color: TECH.agency, industry: 'tech' },
    'tech-govtech': { key: 'tech-govtech', label: 'GovTech', emoji: '🖥️', color: TECH.govtech, industry: 'tech' },
    'tech-platform': { key: 'tech-platform', label: 'Platform / SaaS', emoji: '☁️', color: TECH.platform, industry: 'tech' },

    'gaming-aaa': { key: 'gaming-aaa', label: 'AAA Studio', emoji: '🎮', color: GAMING.neonPurple, industry: 'gaming' },
    'gaming-mid': { key: 'gaming-mid', label: 'Established Studio', emoji: '🕹️', color: GAMING.pixelGreen, industry: 'gaming' },
    'gaming-indie': { key: 'gaming-indie', label: 'Independent Studio', emoji: '👾', color: GAMING.controllerBlue, industry: 'gaming' },
    'gaming-vfx': { key: 'gaming-vfx', label: 'VFX / Animation', emoji: '🎬', color: GAMING.renderOrange, industry: 'gaming' },
    'gaming-services': { key: 'gaming-services', label: 'Services / Co-dev', emoji: '🧩', color: GAMING.questGold, industry: 'gaming' },
    'gaming-org': { key: 'gaming-org', label: 'Industry / Education', emoji: '🌐', color: GAMING.arcadeMagenta, industry: 'gaming' },

    'cleantech-utility': { key: 'cleantech-utility', label: 'Utility / Producer', emoji: '⚡', color: CLEAN.utility, industry: 'cleantech' },
    'cleantech-startup': { key: 'cleantech-startup', label: 'CleanTech Company', emoji: '🌱', color: CLEAN.startup, industry: 'cleantech' },
    'cleantech-services': { key: 'cleantech-services', label: 'CleanTech Services', emoji: '🔧', color: CLEAN.services, industry: 'cleantech' },
    'cleantech-research': { key: 'cleantech-research', label: 'CleanTech Research', emoji: '🧪', color: CLEAN.research, industry: 'cleantech' },

    'lifesci-pharma': { key: 'lifesci-pharma', label: 'Pharma', emoji: '💊', color: LIFESCI.pharmaTeal, industry: 'lifesci' },
    'lifesci-biotech': { key: 'lifesci-biotech', label: 'Biotech', emoji: '🧬', color: LIFESCI.biotechGreen, industry: 'lifesci' },
    'lifesci-cro': { key: 'lifesci-cro', label: 'Research Services', emoji: '🔬', color: LIFESCI.labCoral, industry: 'lifesci' },
    'lifesci-research': { key: 'lifesci-research', label: 'Research Institute', emoji: '🏥', color: LIFESCI.researchIndigo, industry: 'lifesci' },
    'lifesci-org': { key: 'lifesci-org', label: 'Cluster / Accelerator', emoji: '🌐', color: LIFESCI.clusterSlate, industry: 'lifesci' },

    'marine-shipping': { key: 'marine-shipping', label: 'Shipowner / Carrier', emoji: '🚢', color: MARINE.deepSea, industry: 'marine' },
    'marine-port': { key: 'marine-port', label: 'Port & Terminals', emoji: '⚓', color: MARINE.containerRust, industry: 'marine' },
    'marine-services': { key: 'marine-services', label: 'Marine Services', emoji: '🛟', color: MARINE.seaGlass, industry: 'marine' },
    'marine-org': { key: 'marine-org', label: 'Cluster / Association', emoji: '🌊', color: MARINE.harbourIndigo, industry: 'marine' },
  },

  typeOrder: {
    tech: ['tech-startup', 'tech-scaleup', 'tech-enterprise', 'tech-platform', 'tech-agency', 'tech-govtech'],
    gaming: ['gaming-aaa', 'gaming-mid', 'gaming-indie', 'gaming-vfx', 'gaming-services', 'gaming-org'],
    cleantech: ['cleantech-startup', 'cleantech-utility', 'cleantech-services', 'cleantech-research'],
    lifesci: ['lifesci-biotech', 'lifesci-pharma', 'lifesci-cro', 'lifesci-research', 'lifesci-org'],
    marine: ['marine-shipping', 'marine-port', 'marine-services', 'marine-org'],
    all: [
      'tech-startup', 'tech-scaleup', 'tech-enterprise', 'tech-platform', 'tech-agency', 'tech-govtech',
      'gaming-aaa', 'gaming-mid', 'gaming-indie', 'gaming-vfx', 'gaming-services', 'gaming-org',
      'cleantech-startup', 'cleantech-utility', 'cleantech-services', 'cleantech-research',
      'lifesci-biotech', 'lifesci-pharma', 'lifesci-cro', 'lifesci-research', 'lifesci-org',
      'marine-shipping', 'marine-port', 'marine-services', 'marine-org',
    ],
  },

  domainLabels: {
    saas: 'SaaS', fintech: 'Fintech', healthtech: 'HealthTech', cybersecurity: 'Cybersecurity',
    'data-analytics': 'Data & Analytics', 'cloud-infra': 'Cloud / Infrastructure', devtools: 'DevTools',
    'ai-ml': 'AI / ML', robotics: 'Robotics', ecommerce: 'E-commerce', 'gis-geospatial': 'GIS / Geospatial',
    'aaa-games': 'AAA Games', 'indie-games': 'Independent Games', 'mobile-games': 'Mobile Games',
    'live-service': 'Live Service', 'vfx-film': 'Film VFX', 'vfx-tv': 'TV VFX', animation: 'Animation',
    'game-qa': 'Game QA', 'co-development': 'Co-development', 'open-world': 'Open World',
    'clean-water': 'Clean Water', 'renewable-energy': 'Renewable Energy', 'grid-management': 'Grid Management',
    'energy-efficiency': 'Energy Efficiency', 'energy-storage': 'Energy Storage', 'marine-renewables': 'Marine Renewables',
    hydrogen: 'Hydrogen', 'carbon-capture': 'Carbon Capture', 'fusion-energy': 'Fusion Energy',
    'battery-materials': 'Battery Materials', 'industrial-decarbonization': 'Industrial Decarbonization',
    'mining-tech': 'Mining Technology',
    pharmaceuticals: 'Pharmaceuticals', 'biotech-rd': 'Biotech R&D', 'clinical-trials': 'Clinical Trials',
    'precision-medicine': 'Precision Medicine', immunotherapy: 'Immunotherapy', 'drug-discovery': 'Drug Discovery',
    'medical-devices': 'Medical Devices', 'cell-gene-therapy': 'Cell & Gene Therapy', diagnostics: 'Diagnostics',
    shipping: 'Shipping', 'port-operations': 'Port Operations', 'marine-logistics': 'Marine Logistics',
    'ship-services': 'Shipbuilding & Services', 'green-shipping': 'Green Shipping',
  },

  canonicalNeighborhoods: {
    Downtown: 'Downtown', Yaletown: 'Yaletown', Gastown: 'Gastown', Railtown: 'Railtown',
    'Mount Pleasant': 'Mount Pleasant', 'False Creek Flats': 'False Creek Flats',
    'East Vancouver': 'East Vancouver', Kitsilano: 'Kitsilano', Marpole: 'Marpole',
    UBC: 'UBC', Burnaby: 'Burnaby', Richmond: 'Richmond', Surrey: 'Surrey', Delta: 'Delta',
    'North Vancouver': 'North Vancouver', 'West Vancouver': 'West Vancouver',
    'New Westminster': 'New Westminster', Coquitlam: 'Coquitlam', 'Port Coquitlam': 'Port Coquitlam',
    Vancouver: 'Vancouver', 'Metro Vancouver': 'Metro Vancouver',
  },

  localityPattern: /vancouver|burnaby|richmond|surrey|delta|north vancouver|west vancouver|new westminster|coquitlam|port coquitlam|lower mainland|metro vancouver|ubc|university of british columbia/,
  localityAmbiguousPattern: /^(?:canada\s*[-–—]?\s*)?(?:remote|hybrid)$|^canada$|^british columbia$|^bc$|^anywhere$|^worldwide$/,

  lngScale: 1 / Math.cos((49.27 * Math.PI) / 180),
  cityPalette: PALETTE,
  areaAccent: PALETTE.mountainInk,

  metaTitle: 'People Are Strange — Vancouver Industry Map',
  metaDescription: "Metro Vancouver's tech, gaming, clean-tech, life-science and marine employers on one living map — what they build, where they are, and where to look for work.",
  loadingText: 'Mapping Vancouver…',
  csvPrefix: 'vancouver',
};
