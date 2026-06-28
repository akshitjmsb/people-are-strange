// ── People Are Strange MTL — Montreal's tech scene, on one map ───────────────
// Two industries share one map and one data shape: the AI scene (every lab and
// startup in the city) and the aerospace scene (Montreal is a top-3 global
// aerospace hub). Each company is placed on the map with as much real knowledge
// about it as we can gather.

/** Which industry layer a company belongs to. Drives the top-level toggle and
 *  the marker palette family. Existing rows default to 'ai'. */
export type Industry = 'ai' | 'aerospace';

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
  | 'aero-incubator'; // aerospace cluster / association / accelerator / fund

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

/** Any capability area, across both industries. Stored in the `aiDomains`
 *  column/field (kept that name so the data shape is identical). */
export type Domain = AIDomain | AerospaceDomain;

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
