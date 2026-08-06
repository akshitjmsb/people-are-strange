// ── People Are Strange — city industry maps ─────────────────────────────────
// Multiple cities share one map and one data shape. Each city defines its own
// industries (Montreal has AI/aerospace/energy/marine/gaming/lifesci; Victoria
// has tech/defense/ocean/cleantech/government/lifesci). Each company is placed
// on the map with as much real knowledge about it as we can gather.

/** Which industry layer a company belongs to. Drives the top-level toggle and
 *  the marker palette family. The union covers ALL cities — each city config
 *  declares which subset it uses. Existing rows default to 'ai'. */
export type Industry =
  // Montreal industries
  | 'ai' | 'aerospace' | 'energy' | 'marine' | 'gaming' | 'lifesci'
  | 'financial' | 'enterprise'
  // Victoria industries
  | 'tech' | 'defense' | 'ocean' | 'cleantech' | 'government';

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
  | 'marine-org' // cluster / association (CargoM)
  // ── Gaming / VFX ecosystem ──
  | 'gaming-aaa' // AAA studio (Ubisoft, WB Games, EA Motive)
  | 'gaming-mid' // mid-size / established studio (Behaviour, Gameloft, Ludia)
  | 'gaming-indie' // indie / boutique studio (Kitfox, Tribute, Thunder Lotus)
  | 'gaming-vfx' // VFX / animation house (Rodeo FX, DNEG, Framestore)
  | 'gaming-services' // QA, co-dev, localisation services (Keywords Studios)
  | 'gaming-org' // industry association / cluster / event
  // ── Life Sciences ecosystem ──
  | 'lifesci-pharma' // big pharma Canadian HQ (Pfizer, Novartis, Merck, AbbVie)
  | 'lifesci-biotech' // biotech company (Knight, CellCarta, Congruence)
  | 'lifesci-cro' // contract research / services (Altasciences, Charles River)
  | 'lifesci-research' // research institute (IRCM, The Neuro, adMare)
  | 'lifesci-org' // cluster / association (Montréal InVivo)
  // ── Financial Services ecosystem ──
  | 'fin-bank' // chartered bank / credit union (National Bank, Desjardins, RBC)
  | 'fin-insurance' // insurer (Intact, iA, Sun Life, Beneva)
  | 'fin-fintech' // payments / fintech (Nuvei)
  | 'fin-asset' // asset & wealth management (Fiera, Addenda)
  | 'fin-pension' // pension fund / institutional investor (CDPQ, PSP)
  // ── Enterprise Tech ecosystem ──
  | 'ent-bigtech' // global tech company's Montreal office (SAP, Oracle, IBM)
  | 'ent-consulting' // IT / management consulting (Accenture, Deloitte, KPMG)
  | 'ent-saas' // SaaS / enterprise software (Datadog, Workday, Unity)
  | 'ent-telecom' // telecom operator (Bell, Telus, Videotron)
  | 'ent-itservices' // IT services / systems integration (CGI)
  // ── Victoria: Tech ecosystem ──
  | 'tech-startup' | 'tech-scaleup' | 'tech-enterprise' | 'tech-agency' | 'tech-govtech' | 'tech-platform'
  // ── Victoria: Defense ecosystem ──
  | 'defense-naval' | 'defense-contractor' | 'defense-services' | 'defense-research'
  // ── Victoria: Ocean Tech ecosystem ──
  | 'ocean-tech' | 'ocean-research' | 'ocean-services' | 'ocean-startup'
  // ── Victoria: CleanTech ecosystem ──
  | 'cleantech-utility' | 'cleantech-startup' | 'cleantech-services' | 'cleantech-research'
  // ── Victoria: Government ecosystem ──
  | 'gov-provincial' | 'gov-federal' | 'gov-crown' | 'gov-municipal';

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

/** Broad gaming / VFX capability areas. */
export type GamingDomain =
  | 'aaa-games'
  | 'indie-games'
  | 'mobile-games'
  | 'live-service'
  | 'vfx-film'
  | 'vfx-tv'
  | 'animation'
  | 'game-qa'
  | 'co-development'
  | 'horror'
  | 'open-world'
  | 'narrative';

/** Broad life sciences capability areas. */
export type LifeSciDomain =
  | 'pharmaceuticals'
  | 'biotech-rd'
  | 'clinical-trials'
  | 'precision-medicine'
  | 'immunotherapy'
  | 'neuroscience'
  | 'rare-diseases'
  | 'medical-devices'
  | 'contract-research'
  | 'drug-discovery'
  | 'cell-gene-therapy'
  | 'diagnostics';

/** Broad financial services capability areas. */
export type FinancialDomain =
  | 'retail-banking'
  | 'commercial-banking'
  | 'insurance'
  | 'fintech'
  | 'asset-management'
  | 'pension-fund'
  | 'payments'
  | 'wealth-management'
  | 'capital-markets';

/** Broad enterprise tech capability areas. */
export type EnterpriseDomain =
  | 'enterprise-software'
  | 'it-consulting'
  | 'cloud-computing'
  | 'saas'
  | 'telecom'
  | 'erp'
  | 'cybersecurity'
  | 'digital-transformation';

// ── Victoria domain types ────────────────────────────────────────────────

/** Victoria tech capability areas. */
export type TechDomain =
  | 'saas' | 'fintech' | 'edtech' | 'healthtech' | 'proptech' | 'martech'
  | 'cybersecurity' | 'data-analytics' | 'cloud-infra' | 'devtools'
  | 'ai-ml' | 'iot' | 'gaming-tech' | 'ecommerce' | 'gis-geospatial';

/** Victoria defense capability areas. */
export type DefenseDomain =
  | 'naval-engineering' | 'submarine-support' | 'shipbuilding'
  | 'defense-electronics' | 'simulation-training' | 'fleet-maintenance';

/** Victoria ocean tech capability areas. */
export type OceanDomain =
  | 'ocean-monitoring' | 'autonomous-vessels' | 'marine-biology'
  | 'hydrography' | 'coastal-intelligence' | 'ocean-instruments'
  | 'fisheries-tech' | 'marine-renewables';

/** Victoria clean tech capability areas. */
export type CleanTechDomain =
  | 'clean-water' | 'renewable-energy' | 'grid-management'
  | 'energy-efficiency' | 'electric-utility' | 'gas-utility';

/** Victoria government capability areas. */
export type GovernmentDomain =
  | 'public-service' | 'insurance-crown' | 'pension-admin'
  | 'digital-services' | 'resource-management';

/** Any capability area, across all cities and industries. Stored in the
 *  `aiDomains` column/field (kept that name so the data shape is identical). */
export type Domain =
  | AIDomain | AerospaceDomain | EnergyDomain | MarineDomain
  | GamingDomain | LifeSciDomain | FinancialDomain | EnterpriseDomain
  | TechDomain | DefenseDomain | OceanDomain | CleanTechDomain | GovernmentDomain;

import type { AtsRef } from './ats';

export type { AtsRef };

export interface Funding {
  totalRaised?: string; // e.g. "$45M"
  lastRound?: string; // e.g. "Series B"
  lastRoundDate?: string; // e.g. "2024-03"
  investors?: string[];
}

/** How a key person is useful to someone networking / job-hunting. Drives the
 *  grouping on the card: who founded it, who runs it, who to reach about a job. */
export type PersonRole = 'founder' | 'executive' | 'hiring';

/** One key person at a company — a real, verified individual who CURRENTLY holds
 *  the stated role. Only sourced people belong here; a name that can't be
 *  verified is left off rather than guessed (see lib/company-profiles.ts). A
 *  wrong name is worse than no name. */
export interface KeyPerson {
  name: string;
  title: string; // role as it reads today, e.g. "Co-founder & CEO", "VP Talent"
  role: PersonRole;
  linkedIn?: string; // full linkedin.com profile URL when a real one is known
}

/** One AI company / lab in Montreal — the atom of this whole app. */
export interface AICompany {
  id: string;
  name: string;
  aka?: string; // former / alternate name (e.g. "ex-Element AI")

  // Which industry layer this belongs to (drives the marker's home lens and
  // `type` must be one of that industry's CompanyTypes). Optional for
  // back-compat: a missing value means 'ai'.
  industry?: Industry;

  /** Other industry lenses this company is genuinely native to, beyond its
   *  primary `industry` — e.g. an AI-first drug-discovery startup is
   *  discoverable from both the AI and Life Sciences toggles. Reserved for
   *  companies whose OWN product is substantively built for that industry
   *  (a dedicated aiDomains + industries signal on both sides), not a vendor
   *  relationship or a passing mention — see scripts/validate-data.ts, which
   *  rejects a value equal to the primary industry or duplicated within the
   *  array. The primary `type`/color/pin identity is unaffected: this only
   *  widens which industry filters surface the company. */
  secondaryIndustries?: Industry[];

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
  /** Plain-language funding / ownership status for the card — e.g. "Series B",
   *  "Public", "Government", "Private", "Bootstrapped", "Subsidiary". A softer,
   *  always-present signal than the detailed `funding` object above. */
  fundingStage?: string;

  // ── Rich profile (key people + origin story) ────────────────────────────
  /** Real, verified key people to know — founders, C-suite, and talent/hiring
   *  contacts — for networking and job-hunting. Never inferred. */
  people?: KeyPerson[];
  /** A 2–3 sentence, factual origin story / company history for the card. */
  story?: string;
  /** A few marquee customers / partners, where they're publicly known. */
  notableClients?: string[];
  /** We hold a verified link to this company's jobs page — NOT a claim that
   *  they have open roles. It tracks `careersUrl` 1:1, so a false here means
   *  "no link curated yet", never "not hiring". The UI is worded accordingly
   *  ("Careers page", not "Hiring now"). Companies with an `ats` below get a
   *  real, live signal on top of this. */
  hiring?: boolean;
  careersUrl?: string; // careers / jobs page — what the flag above points at

  /** Applicant-tracking system whose public board API serves this company's
   *  postings. Present only where the board has been verified to respond; the
   *  live open-role count is fetched from it on a schedule and stored on the
   *  row, never in this file. */
  ats?: AtsRef;

  /** Live counts, filled in by scripts/refresh-roles.ts — never hand-edited.
   *  Absent means we have no live data, which is different from zero. */
  openRolesMontreal?: number;
  openRolesTotal?: number;
  rolesFetchedAt?: string; // ISO timestamp of the last successful fetch
  notable?: string; // founders, flagship products, claims to fame
  status?: string; // "active", "acquired by X", "wound down"…

  // Provenance.
  website?: string;
  linkedin?: string;
  sources?: string[]; // URLs the data was gathered from
  verifiedAt?: string; // when this row was last checked against sources, e.g. "2026-06"
}

/** One person worth knowing at a company — the "who do I actually message?"
 *  layer on top of the map. Only curated for companies that are hiring. */
export interface Person {
  id: string; // slug, unique across the dataset (e.g. "mila-valerie-pisano")
  companyId: string; // matches AICompany.id
  name: string;
  role: string; // title as it reads on the company's own site

  /** Best-effort profile URL, built from the lowercase first-last pattern.
   *  Not every one resolves — the UI offers a LinkedIn search fallback. */
  linkedinUrl: string;

  note?: string; // why they're worth a message, or context on the role
  /** True when they've left the company — kept for context, never a live lead. */
  former?: boolean;
}
