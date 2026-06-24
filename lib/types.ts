// ── People Are Strange MTL — the Montreal AI scene, on one map ───────────────
// The whole product is now about ONE thing: Montreal's AI companies. No hexes,
// no restaurants, no transit. Just every AI lab and startup in the city, placed
// on the map with as much real knowledge about each as we can gather.

/** What kind of player in the ecosystem this is. Drives marker colour. */
export type CompanyType =
  | 'research-lab' // academic / non-profit AI institute (Mila, IVADO)
  | 'big-tech-lab' // a global company's Montreal AI lab (DeepMind, MSR, FAIR)
  | 'startup' // early-stage venture
  | 'scaleup' // funded, growing, past product-market fit
  | 'applied-ai' // applies AI to a vertical (health, fintech, etc.)
  | 'incubator'; // accelerator / venture studio / fund

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

  // What they work on.
  aiDomains: AIDomain[];
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
