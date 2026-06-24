import { MONTREAL } from './colors';
import type { AIDomain, CompanyType } from './types';

export interface TypeDef {
  key: CompanyType;
  label: string;
  emoji: string;
  color: string; // hex — drives the marker colour
}

// Each kind of AI player gets its own slice of the Montreal street-art palette.
export const COMPANY_TYPES: Record<CompanyType, TypeDef> = {
  'research-lab': { key: 'research-lab', label: 'Research Lab', emoji: '🧠', color: MONTREAL.mileendViolet },
  'big-tech-lab': { key: 'big-tech-lab', label: 'Big-Tech AI Lab', emoji: '🛰️', color: MONTREAL.jazzBlue },
  startup: { key: 'startup', label: 'Startup', emoji: '🚀', color: MONTREAL.plateauPink },
  scaleup: { key: 'scaleup', label: 'Scaleup', emoji: '📈', color: MONTREAL.parcEmerald },
  'applied-ai': { key: 'applied-ai', label: 'Applied AI', emoji: '⚙️', color: MONTREAL.montroyalAmber },
  incubator: { key: 'incubator', label: 'Incubator / Fund', emoji: '🌱', color: MONTREAL.bagelGold },
};

// Order shown in the filter chips row.
export const TYPE_ORDER: CompanyType[] = [
  'research-lab',
  'big-tech-lab',
  'scaleup',
  'startup',
  'applied-ai',
  'incubator',
];

export function typeDef(t: CompanyType): TypeDef {
  return COMPANY_TYPES[t] ?? COMPANY_TYPES.startup;
}

export function typeColor(t: CompanyType): string {
  return typeDef(t).color;
}

// Human labels for AI domains (used in the detail panel + domain filter).
export const DOMAIN_LABELS: Record<AIDomain, string> = {
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
};

export function domainLabel(d: AIDomain): string {
  return DOMAIN_LABELS[d] ?? d;
}
