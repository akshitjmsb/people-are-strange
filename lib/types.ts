// ── People Are Strange MTL — Montreal's tech scene, on one map ───────────────
// Four industries share one map and one data shape: the AI scene (every lab
// and startup in the city), the aerospace scene (Montreal is a top-3 global
// aerospace hub), the energy scene (producers, storage tech, installers and
// distributors powering Québec's energy transition), and the marine scene
// (the port, shipowners and services that make Montreal a great inland port).
// Each company is placed on the map with as much real knowledge about it as
// we can gather.

/** Which industry layer a company belongs to. Drives the top-level toggle and
 *  the marker palette family. Existing rows default to 'ai'. */
export type Industry = 'ai' | 'aerospace' | 'energy' | 'marine';

/** What kind of player in an ecosystem this is. Drives marker colour. The union
 *  spans both industries; AI types and aerospace types never collide. */
export type CompanyType =
  // ── AI ecosystem ──
  | 'research-lab' // academic / non-profit AI institute (Mila, IVADO)
  | 'big-tech-lab' // a global company's Montreal AI lab (DeepMind, MSR, FAIR)
  | 'startup' // early-stage venture
  | 'scaleup' // funded, growing, past product-market fit
  | 'applied-ai' // applies AI to a vertical (health, fintech, etc.)
  | 'incubator' // accelerator / venture studio / fund
  // ── Aerospace ecosystem ──
  | 'oem' // aircraft / engine prime manufacturer (Bombardier, P&WC, Airbus)
  | 'tier1' // Tier 1 structures / systems supplier (Héroux-Devtek, Sonaca)
  | 'tier2' // Tier 2 / specialist parts, machining, composites supplier
  | 'mro' // maintenance, repair & overhaul (Air Canada, HAECO, Avianor)
  | 'defense' // defense & avionics primes (L3Harris, Thales, CMC Electronics)
  | 'space' // space & satellite (MDA, Magellan, GHGSat)
  | 'aero-research' // research lab, NRC, CRIAQ, university / training
  | 'aero-startup' // aerospace startup / scale-up (eVTOL, drones, clean aviation)
  | 'aero-incubator' // aerospace cluster / association / accelerator / fund
  // ── Energy ecosystem ──
  | 'energy-producer' // producer / project developer / utility (Hydro-Québec, Innergex)
  | 'energy-storage' // energy storage & smart home energy tech (EVLO, dcbel)
  | 'energy-installer' // installer / EPC / engineering (Quebec Solar, WSP)
  | 'energy-distributor' // energy & equipment distribution (Énergir, Rematek)
  | 'energy-research' // research lab / university centre (Concordia CZEBS)
  | 'energy-org' // association / cluster (Énergie Solaire Québec)
  // ── Marine ecosystem ──
  | 'marine-shipping' // shipowners & carriers (CSL, Fednav, Oceanex)
  | 'marine-port' // port authority & container terminals (MPA, MGT, Termont)
  | 'marine-services' // cargo handling, towing, harbour services (Logistec, Océan)
  | 'marine-org'; // cluster / association (CargoM)

/** Broad AI capability areas — used for filtering and tags. */
export type AIDomain =
  | 'LLM'
  | 'NLP'
  | 'generative-ai'
  | 'computer-vision'
  | 'reinforcement-learning'
  | 'robotics'
  | 'speech'
  | 'ml-platform'
  | 'recommendation'
  | 'forecasting'
  | 'edge-ai'
  | 'research';

/** Broad aerospace capability areas — the aerospace analogue of AIDomain. */
export type AerospaceDomain =
  | 'propulsion'
  | 'avionics'
  | 'aerostructures'
  | 'mro'
  | 'space'
  | 'defense'
  | 'uav'
  | 'simulation'
  | 'landing-gear'
  | 'interiors'
  | 'materials'
  | 'systems'
  | 'manufacturing'
  | 'aero-research'
  | 'sustainable-aviation';

/** Broad energy capability areas. */
export type EnergyDomain =
  | 'photovoltaics'
  | 'energy-storage'
  | 'solar-thermal'
  | 'grid-services'
  | 'ev-charging'
  | 'building-solar'
  | 'off-grid'
  | 'project-development'
  | 'wind'
  | 'hydro'
  | 'gas-distribution';

/** Broad marine capability areas. */
export type MarineDomain =
  | 'shipping'
  | 'port-operations'
  | 'cargo-handling'
  | 'towing-salvage'
  | 'marine-logistics'
  | 'arctic-shipping'
  | 'green-shipping'
  | 'ship-services';

/** Any capability area, across all industries. Stored in the `aiDomains`
 *  column/field (kept that name so the data shape is identical). */
export type Domain = AIDomain | AerospaceDomain | EnergyDomain | MarineDomain;

export interface Funding {
  totalRaised?: string; // e.g. "$45M"
  lastRound?: string; // e.g. "Series B"
  lastRoundDate?: string; // e.g. "2024-03"
  investors?: string[];
}

/** One AI company / lab in Montreal — the atom of this whole app. */
export interface AICompany {
  id: string;
  name: string;
  aka?: string; // former / alternate name (e.g. "ex-Element AI")

  // Which industry layer this belongs to. Optional for back-compat: a missing
  // value means 'ai' (the original dataset predates this field).
  industry?: Industry;

  // Where it sits on the map (REAL Montreal coordinates).
  lat: number;
  lng: number;
  address?: string;
  neighborhood?: string; // Mile-End, Plateau, Downtown, Griffintown…
  // Honesty flag: 'exact' = pin sits on a verified street address;
  // 'approximate' = we only know the neighbourhood, so the pin is
  // neighbourhood-level, not a precise location. Derived in the loader.
  locationPrecision?: 'exact' | 'approximate';

  // What it is.
  type: CompanyType;
  oneLiner: string; // the one-sentence pitch
  problem?: string; // the problem they're attacking
  solution?: string; // what they actually build to solve it

  // What they work on. (Named `aiDomains` for historical reasons; holds AI
  // domains for AI companies and aerospace domains for aerospace companies.)
  aiDomains: Domain[];
  industries?: string[]; // healthcare, fintech, gaming, retail…
  tags?: string[];

  // Signals — "maximum knowledge, as much as is available".
  founded?: number;
  headcount?: string; // e.g. "51-200"
  funding?: Funding;
  hiring?: boolean;
  notable?: string; // founders, flagship products, claims to fame
  status?: string; // "active", "acquired by X", "wound down"…

  // Provenance.
  website?: string;
  linkedin?: string;
  sources?: string[]; // URLs the data was gathered from
}
