// Generated directly from PAS_Resume_MASTER.pdf. This contains
// only matching signals — never contact details or the resume's full text.
// The source revision makes stale profile data visible instead of pretending
// an old snapshot is current.

export interface CandidateSignal {
  label: string;
  patterns: string[];
  weight: number;
}

export interface CandidateProfile {
  name: string;
  headline: string;
  yearsExperience: number;
  location: string;
  source: {
    title: string;
    fileId: string;
    url: string;
    revisionId: string;
    syncedAt: string;
    parserVersion?: number;
  };
  targetTitles: CandidateSignal[];
  skills: CandidateSignal[];
  responsibilities: CandidateSignal[];
  domains: CandidateSignal[];
}

export const CANDIDATE_PROFILE_PARSER_VERSION = 3;

export const CANDIDATE_PROFILE: CandidateProfile = {
  name: 'Akshit Gupta',
  headline: 'DATA PRODUCT & AI STRATEGY LEADER | MBA',
  yearsExperience: 11,
  location: 'Montréal, QC',
  source: {
    title: 'PAS_Resume_MASTER.pdf',
    fileId: '1kYGzulxSB2IzTGVUNvkZLWY8cSP-aCne',
    url: 'https://drive.google.com/file/d/1kYGzulxSB2IzTGVUNvkZLWY8cSP-aCne/view',
    revisionId: 'built-in-fallback',
    syncedAt: '2026-08-27T13:22:21.928Z',
    parserVersion: CANDIDATE_PROFILE_PARSER_VERSION,
  },
  targetTitles: [
    { label: 'AI Data Product Owner', patterns: ['ai data product owner'], weight: 30 },
    { label: 'Data Product Owner', patterns: ['data product owner'], weight: 29 },
    { label: 'AI Product Manager', patterns: ['ai product manager', 'product manager ai', 'product manager artificial intelligence'], weight: 28 },
    { label: 'Data Product Manager', patterns: ['data product manager', 'product manager data'], weight: 28 },
    { label: 'Product Owner', patterns: ['product owner'], weight: 26 },
    { label: 'Technical Product Manager', patterns: ['technical product manager', 'platform product manager'], weight: 25 },
    { label: 'Product Manager', patterns: ['product manager'], weight: 22 },
    { label: 'Data Governance Lead', patterns: ['data governance lead', 'data governance manager', 'data management lead'], weight: 20 },
  ],
  skills: [
    { label: 'Google Cloud', patterns: ['google cloud', 'gcp', 'bigquery', 'gemini enterprise'], weight: 3 },
    { label: 'Palantir Foundry', patterns: ['palantir', 'foundry'], weight: 3 },
    { label: 'Snowflake', patterns: ['snowflake'], weight: 2.5 },
    { label: 'Databricks', patterns: ['databricks'], weight: 2.5 },
    { label: 'Python', patterns: ['python'], weight: 2 },
    { label: 'SQL', patterns: ['sql'], weight: 2 },
    { label: 'PySpark', patterns: ['pyspark', 'spark'], weight: 2 },
    { label: 'dbt', patterns: ['dbt'], weight: 2 },
    { label: 'Power BI', patterns: ['power bi', 'powerbi'], weight: 2 },
    { label: 'Tableau', patterns: ['tableau'], weight: 1.5 },
    { label: 'Looker', patterns: ['looker'], weight: 1.5 },
    { label: 'Jira', patterns: ['jira'], weight: 1.5 },
    { label: 'Confluence', patterns: ['confluence'], weight: 1.5 },
    { label: 'ArcGIS', patterns: ['arcgis'], weight: 1.5 },
  ],
  responsibilities: [
    { label: 'Product strategy and roadmaps', patterns: ['product strategy', 'product roadmap', 'roadmap'], weight: 3 },
    { label: 'Backlog ownership', patterns: ['backlog', 'user stories', 'product owner'], weight: 3 },
    { label: 'Stakeholder leadership', patterns: ['stakeholder', 'cross-functional', 'requirements gathering'], weight: 3 },
    { label: 'Data governance', patterns: ['data governance', 'data quality', 'metadata management', 'data lineage', 'data stewardship'], weight: 3 },
    { label: 'Ontology and knowledge mapping', patterns: ['ontology', 'knowledge mapping', 'knowledge graph', 'semantic layer'], weight: 3 },
    { label: 'Agentic AI', patterns: ['agentic ai', 'ai agents', 'generative ai'], weight: 2.5 },
    { label: 'Agile delivery', patterns: ['agile', 'scrum', 'sprint planning'], weight: 2.5 },
    { label: 'Data platforms', patterns: ['data platform', 'data product', 'data warehouse', 'data catalog'], weight: 2.5 },
    { label: 'KPIs and analytics', patterns: ['kpi', 'analytics', 'business intelligence'], weight: 2 },
  ],
  domains: [
    { label: 'Aviation and aerospace', patterns: ['aviation', 'aerospace', 'aircraft', 'manufacturing'], weight: 3 },
    { label: 'Maritime operations', patterns: ['maritime', 'shipping', 'vessel', 'fleet'], weight: 3 },
    { label: 'Automotive', patterns: ['automotive', 'vehicle', 'dealership'], weight: 2.5 },
    { label: 'Enterprise data and AI', patterns: ['enterprise data', 'enterprise ai', 'digital transformation'], weight: 3 },
    { label: 'Operations and supply chain', patterns: ['operations', 'supply chain', 'procurement', 'quality'], weight: 2.5 },
  ],
};

const SECTION_MARKERS = [
  'professional experience',
  'education',
  'certifications',
  'core competencies',
  'skills',
];

function normalizeSignal(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasResumeEvidence(text: string, signal: CandidateSignal): boolean {
  const normalized = normalizeSignal(text);
  return signal.patterns.some((pattern) => normalized.includes(normalizeSignal(pattern)));
}

function extractCompetencies(lines: string[]): CandidateSignal[] {
  const start = lines.findIndex((line) => normalizeSignal(line) === 'core competencies');
  if (start < 0) return [];

  const values: string[] = [];
  for (const line of lines.slice(start + 1)) {
    const normalized = normalizeSignal(line);
    if (SECTION_MARKERS.includes(normalized)) break;
    const withoutCategory = line.includes(':') ? line.slice(line.indexOf(':') + 1) : line;
    values.push(...withoutCategory.split(/[,•|]/));
  }

  return values
    .map((value) => value.trim().replace(/\.$/, ''))
    .filter((value) => value.length >= 2 && value.length <= 60)
    .filter((value, index, all) => all.findIndex((other) => normalizeSignal(other) === normalizeSignal(value)) === index)
    .slice(0, 30)
    .map((label) => ({ label, patterns: [label], weight: 1.5 }));
}

function mergeSignals(primary: CandidateSignal[], additional: CandidateSignal[]): CandidateSignal[] {
  const merged = new Map<string, CandidateSignal>();
  for (const signal of [...primary, ...additional]) {
    const key = normalizeSignal(signal.label);
    if (!key || merged.has(key)) continue;
    merged.set(key, signal);
  }
  return [...merged.values()];
}

/**
 * Convert text extracted from the latest master PDF into matching signals. Parsing is kept
 * deterministic so a resume revision produces the same profile everywhere and
 * does not require sending private resume text to another AI service.
 */
export function buildCandidateProfileFromResume(
  resumeText: string,
  source: Pick<CandidateProfile['source'], 'fileId' | 'revisionId' | 'syncedAt'> & {
    title?: string;
  },
): CandidateProfile {
  const lines = resumeText
    .split(/\r?\n/)
    .map((line) => line.replace(/^\uFEFF/, '').trim())
    .filter((line) => !/\bpage\s+\d+\s+of\s+\d+\b/i.test(line))
    .filter(Boolean);
  const yearsMatch = resumeText.match(/(\d{1,2})\+?\s+years?/i);
  const contactLine = lines.slice(0, 6).find((line) => /Montr[ée]al|\bQC\b/i.test(line));
  const location = contactLine?.split('|')[0]?.trim() || CANDIDATE_PROFILE.location;
  const evidenced = (signals: CandidateSignal[]) => {
    const filtered = signals.filter((signal) => hasResumeEvidence(resumeText, signal));
    return filtered.length ? filtered : signals;
  };
  const titleLine = lines.slice(1, 6).find((line) =>
    /product|data|ai|strategy|leader|manager|owner|governance/i.test(line)
    && !/@|https?:|linkedin|github|\+\d|Montr[ée]al|\bQC\b/i.test(line),
  );
  const dynamicCompetencies = extractCompetencies(lines);

  return {
    name: lines[0] || CANDIDATE_PROFILE.name,
    headline: titleLine || CANDIDATE_PROFILE.headline,
    yearsExperience: yearsMatch ? Number.parseInt(yearsMatch[1], 10) : CANDIDATE_PROFILE.yearsExperience,
    location,
    source: {
      title: source.title || 'PAS_Resume_MASTER.pdf',
      fileId: source.fileId,
      url: `https://drive.google.com/file/d/${source.fileId}/view`,
      revisionId: source.revisionId,
      syncedAt: source.syncedAt,
      parserVersion: CANDIDATE_PROFILE_PARSER_VERSION,
    },
    targetTitles: evidenced(CANDIDATE_PROFILE.targetTitles),
    skills: mergeSignals(evidenced(CANDIDATE_PROFILE.skills), dynamicCompetencies),
    responsibilities: evidenced(CANDIDATE_PROFILE.responsibilities),
    domains: evidenced(CANDIDATE_PROFILE.domains),
  };
}
