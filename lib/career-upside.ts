import type { CompanyOpportunity } from './opportunity-map';
import type { AICompany, CompanyType } from './types';

export type UpsideTrack = 'equity' | 'cash';

export interface FinancialEvidence {
  entity: string;
  result: string;
  period: string;
  sourceUrl: string;
}

interface PayProfile {
  confidence: 'Exceptional' | 'Strong' | 'Role-dependent';
  targetLevel: string;
  marketPoints: number;
  roleFitPoints: number;
}

export interface UpsideAssessment {
  company: AICompany;
  score: number;
  label: string;
  risk: string;
  reasons: string[];
  cautions: string[];
  targetLevel?: string;
  opportunity?: CompanyOpportunity;
  financialEvidence?: FinancialEvidence;
}

// Annual, company-wide results from primary investor-relations sources. These
// prove financial capacity, not what a Montreal team will offer one candidate.
const FINANCIAL_EVIDENCE: Record<string, FinancialEvidence> = {
  'microsoft-research-montreal': {
    entity: 'Microsoft',
    result: 'US$101.8B net income',
    period: 'FY2025',
    sourceUrl: 'https://www.microsoft.com/investor/reports/ar25/index.html',
  },
  'meta-fair-montreal': {
    entity: 'Meta',
    result: 'US$60.5B net income',
    period: 'FY2025',
    sourceUrl: 'https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Fourth-Quarter-and-Full-Year-2025-Results/',
  },
  'google-deepmind-montreal': {
    entity: 'Alphabet',
    result: 'US$132.2B net income',
    period: 'FY2025',
    sourceUrl: 'https://abc.xyz/investor/news/news-details/2026/Alphabet-Announces-Fourth-Quarter-2025-and-Fiscal-Year-Results-2026-KEvZIMKBLS/default.aspx',
  },
  'servicenow-research': {
    entity: 'ServiceNow',
    result: 'US$1.75B GAAP net income',
    period: 'FY2025',
    sourceUrl: 'https://newsroom.servicenow.com/press-releases/details/2026/ServiceNow-Reports-Fourth-Quarter-and-Full-Year-2025-Financial-Results-Board-of-Directors-Authorizes-Additional-5B-for-Share-Repurchase-Program/default.aspx',
  },
  sap: {
    entity: 'SAP SE',
    result: '€7.33B profit after tax',
    period: 'FY2025',
    sourceUrl: 'https://www.sap.com/integrated-reports/2025/en/datahub/financial-data.html',
  },
  oracle: {
    entity: 'Oracle',
    result: 'US$17.0B GAAP net income',
    period: 'FY2026',
    sourceUrl: 'https://www.oracle.com/news/announcement/q4fy26-earnings-release-2026-06-10/',
  },
  ibm: {
    entity: 'IBM',
    result: 'US$10.6B net income from continuing operations',
    period: 'FY2025',
    sourceUrl: 'https://newsroom.ibm.com/2026-01-28-IBM-RELEASES-FOURTH-QUARTER-RESULTS',
  },
  cisco: {
    entity: 'Cisco',
    result: 'US$10.5B GAAP net income',
    period: 'FY2025',
    sourceUrl: 'https://investor.cisco.com/news/news-details/2025/CISCO-REPORTS-FOURTH-QUARTER-AND-FISCAL-YEAR-2025-EARNINGS/',
  },
  autodesk: {
    entity: 'Autodesk',
    result: 'US$1.12B net income',
    period: 'FY2026',
    sourceUrl: 'https://investors.autodesk.com/news-releases/news-release-details/autodesk-inc-announces-fiscal-2026-fourth-quarter-results',
  },
  workday: {
    entity: 'Workday',
    result: 'US$693M net income',
    period: 'FY2026',
    sourceUrl: 'https://investor.workday.com/news-and-events/press-releases/news-details/2026/Workday-Announces-Fiscal-2026-Fourth-Quarter-and-Full-Year-Financial-Results/default.aspx',
  },
  'morgan-stanley': {
    entity: 'Morgan Stanley',
    result: 'US$16.9B net income',
    period: 'FY2025',
    sourceUrl: 'https://www.morganstanley.com/press-releases/morgan-stanley-reports-fourth-quarter-and-full-year-2025',
  },
  rbc: {
    entity: 'RBC',
    result: 'C$20.4B net income',
    period: 'FY2025',
    sourceUrl: 'https://www.rbc.com/investor-relations/_assets-custom/pdf/ar_2025_e.pdf',
  },
  'td-bank': {
    entity: 'TD Bank Group',
    result: 'C$20.0B reported net income available to common shareholders',
    period: 'FY2025',
    sourceUrl: 'https://www.td.com/content/dam/tdcom/canada/about-td/pdf/quarterly-results/2025/q4/2025-annual-report-en.pdf',
  },
  bmo: {
    entity: 'BMO Financial Group',
    result: 'C$8.7B net income',
    period: 'FY2025',
    sourceUrl: 'https://www.bmo.com/ir/archive/en/bmo_ar2025.pdf',
  },
  scotiabank: {
    entity: 'Scotiabank',
    result: 'C$7.76B net income',
    period: 'FY2025',
    sourceUrl: 'https://www.scotiabank.com/ca/en/about/investors-shareholders/annual-reports.html',
  },
  cibc: {
    entity: 'CIBC',
    result: 'C$8.45B net income',
    period: 'FY2025',
    sourceUrl: 'https://www.cibc.com/en/about-cibc/investor-relations/annual-reports-and-proxy-circulars.html',
  },
  'national-bank': {
    entity: 'National Bank of Canada',
    result: 'C$4.0B net income',
    period: 'FY2025',
    sourceUrl: 'https://www.nbc.ca/content/dam/bnc/a-propos-de-nous/relations-investisseurs/assemblee-annuelle/2026/na-annual-report-2025.pdf',
  },
  desjardins: {
    entity: 'Desjardins Group',
    result: 'C$3.8B surplus earnings before member dividends',
    period: 'FY2025',
    sourceUrl: 'https://www.desjardins.com/ca/about-us/investor-relations/desjardins-group-annual-report/index.jsp',
  },
  cgi: {
    entity: 'CGI',
    result: 'C$1.66B net earnings',
    period: 'FY2025',
    sourceUrl: 'https://www.cgi.com/sites/default/files/2025-12/cgi-2025-annual-report.pdf',
  },
  telus: {
    entity: 'TELUS',
    result: 'C$1.1B net income attributable to common shares',
    period: 'FY2025',
    sourceUrl: 'https://www.telus.com/en/about/investor-relations/reports/annual-reports/2025/performance-at-a-glance',
  },
  'airbus-canada-a220': {
    entity: 'Airbus',
    result: '€5.22B net income',
    period: 'FY2025',
    sourceUrl: 'https://www.airbus.com/en/newsroom/press-releases/2026-02-airbus-reports-full-year-fy-2025-results',
  },
};

// Pay-market strength is deliberately separate from profit. A bank may earn
// more than a SaaS company while the SaaS company has the stronger pay ceiling
// for a senior AI/data/product role. These profiles express that distinction.
const PAY_PROFILES: Record<string, PayProfile> = {
  'google-deepmind-montreal': { confidence: 'Exceptional', targetLevel: 'Senior / Staff / Lead', marketPoints: 34, roleFitPoints: 20 },
  'microsoft-research-montreal': { confidence: 'Exceptional', targetLevel: 'Senior / Principal / Manager', marketPoints: 34, roleFitPoints: 20 },
  'meta-fair-montreal': { confidence: 'Exceptional', targetLevel: 'Senior / Staff / Manager', marketPoints: 34, roleFitPoints: 20 },
  'servicenow-research': { confidence: 'Exceptional', targetLevel: 'Senior / Staff / Product Manager', marketPoints: 34, roleFitPoints: 20 },
  'morgan-stanley': { confidence: 'Exceptional', targetLevel: 'Vice President / Senior Manager', marketPoints: 32, roleFitPoints: 18 },
  sap: { confidence: 'Strong', targetLevel: 'Senior / Principal / Product Manager', marketPoints: 30, roleFitPoints: 20 },
  oracle: { confidence: 'Strong', targetLevel: 'Senior / Principal / Manager', marketPoints: 30, roleFitPoints: 18 },
  autodesk: { confidence: 'Strong', targetLevel: 'Senior / Staff / Product Manager', marketPoints: 30, roleFitPoints: 19 },
  workday: { confidence: 'Strong', targetLevel: 'Senior / Principal / Manager', marketPoints: 29, roleFitPoints: 18 },
  cisco: { confidence: 'Strong', targetLevel: 'Senior / Principal / Manager', marketPoints: 28, roleFitPoints: 17 },
  ibm: { confidence: 'Strong', targetLevel: 'Senior / Managing Consultant / Manager', marketPoints: 27, roleFitPoints: 17 },
  rbc: { confidence: 'Strong', targetLevel: 'Senior Manager / Director', marketPoints: 26, roleFitPoints: 16 },
  'td-bank': { confidence: 'Strong', targetLevel: 'Senior Manager / Director', marketPoints: 26, roleFitPoints: 15 },
  bmo: { confidence: 'Strong', targetLevel: 'Senior Manager / Director', marketPoints: 26, roleFitPoints: 15 },
  'national-bank': { confidence: 'Strong', targetLevel: 'Senior Manager / Director', marketPoints: 26, roleFitPoints: 16 },
  scotiabank: { confidence: 'Strong', targetLevel: 'Senior Manager / Director', marketPoints: 26, roleFitPoints: 15 },
  cibc: { confidence: 'Strong', targetLevel: 'Senior Manager / Director', marketPoints: 26, roleFitPoints: 15 },
  desjardins: { confidence: 'Strong', targetLevel: 'Senior Manager / Director', marketPoints: 25, roleFitPoints: 16 },
  cgi: { confidence: 'Role-dependent', targetLevel: 'Director / Vice-President', marketPoints: 22, roleFitPoints: 17 },
  telus: { confidence: 'Role-dependent', targetLevel: 'Senior Manager / Director', marketPoints: 23, roleFitPoints: 15 },
  'airbus-canada-a220': { confidence: 'Role-dependent', targetLevel: 'Senior Manager / HO / Director', marketPoints: 22, roleFitPoints: 17 },
};

const EQUITY_TYPES = new Set<CompanyType>([
  'startup',
  'scaleup',
  'aero-startup',
  'space',
  'lifesci-biotech',
  'fin-fintech',
  'ent-saas',
  'tech-startup',
  'tech-scaleup',
  'ocean-startup',
  'cleantech-startup',
]);

const STARTUP_IDENTITY_TYPES = new Set<CompanyType>([
  'startup',
  'scaleup',
  'aero-startup',
  'tech-startup',
  'tech-scaleup',
  'ocean-startup',
  'cleantech-startup',
]);

const DISQUALIFYING_OWNERSHIP = /public|subsidiary|acquired|government|non-profit|university|cooperative/i;
const DISQUALIFYING_STATUS = /public|acquired|inactive|offline|unverified|taken private|majority-owned/i;

function fundingMillions(value?: string): number {
  if (!value) return 0;
  const match = value.replace(/,/g, '').match(/([\d.]+)\s*([BMK])/i);
  if (!match) return 0;
  const amount = Number(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === 'B') return amount * 1000;
  if (unit === 'K') return amount / 1000;
  return amount;
}

function headcountUpper(value?: string): number {
  if (!value) return 0;
  const numbers = [...value.replace(/,/g, '').matchAll(/\d+/g)].map((match) => Number(match[0]));
  return numbers.length ? Math.max(...numbers) : 0;
}

function isEquityCandidate(company: AICompany): boolean {
  const stage = company.fundingStage ?? '';
  const status = `${company.status ?? ''} ${company.funding?.lastRound ?? ''}`;
  if (!EQUITY_TYPES.has(company.type)) return false;
  if (DISQUALIFYING_OWNERSHIP.test(stage) || DISQUALIFYING_STATUS.test(status)) return false;
  if (/likely inactive/i.test(status)) return false;
  // A generic "Private" label is not enough to call an established biotech,
  // space supplier or SaaS firm a pre-IPO opportunity. Those broader types
  // need an actual venture/round signal; startup/scale-up types carry that
  // identity in the curated taxonomy already.
  return STARTUP_IDENTITY_TYPES.has(company.type) || Boolean(
    company.funding || /venture|pre-seed|seed|series [a-g]/i.test(stage),
  );
}

function fitPoints(opportunity?: CompanyOpportunity): number {
  return opportunity ? Math.min(14, Math.round(opportunity.best.score / 7)) : 0;
}

function stageDetails(company: AICompany, raised: number): { points: number; label: string; risk: string } {
  const stage = `${company.fundingStage ?? ''} ${company.funding?.lastRound ?? ''}`;
  if (/series [cd-g]/i.test(stage) || raised >= 100) return { points: 22, label: 'Late-stage private', risk: 'Medium' };
  if (/series b/i.test(stage) || raised >= 25) return { points: 19, label: 'Growth-stage private', risk: 'Medium–high' };
  if (/series a/i.test(stage) || raised >= 5) return { points: 13, label: 'Early-stage private', risk: 'High' };
  return { points: 8, label: 'Very early private', risk: 'Very high' };
}

export function rankEquityUpside(
  companies: AICompany[],
  opportunities: Map<string, CompanyOpportunity>,
): UpsideAssessment[] {
  return companies
    .filter(isEquityCandidate)
    .map((company) => {
      const opportunity = opportunities.get(company.id);
      const raised = fundingMillions(company.funding?.totalRaised);
      const headcount = headcountUpper(company.headcount);
      const stage = stageDetails(company, raised);
      let score = 28 + stage.points + fitPoints(opportunity);
      if (raised >= 100) score += 16;
      else if (raised >= 25) score += 12;
      else if (raised >= 5) score += 8;
      else if (raised > 0) score += 4;
      if (headcount >= 50 && headcount <= 1500) score += 9;
      else if (headcount > 0) score += 4;
      if (company.hiring || (company.openRolesTotal ?? 0) > 0) score += 8;
      if (company.founded && company.founded >= 2012) score += 4;

      const roundStage = `${company.funding?.lastRound ?? ''} ${company.fundingStage ?? ''}`.match(/pre-seed|seed|series [a-g]/i)?.[0];
      const reasons = [roundStage ? `${roundStage} funding stage` : company.fundingStage ? `${company.fundingStage} ownership stage` : stage.label];
      if (company.funding?.totalRaised) reasons.push(`${company.funding.totalRaised} raised`);
      if (company.headcount) reasons.push(`${company.headcount} employees`);
      if (company.hiring || (company.openRolesTotal ?? 0) > 0) reasons.push('Active careers or hiring signal');
      if (opportunity) reasons.push(`${opportunity.best.score}% resume match on the best live role`);

      return {
        company,
        score: Math.min(99, score),
        label: stage.label,
        risk: stage.risk,
        reasons: reasons.slice(0, 4),
        cautions: [
          'Employee equity is not confirmed until it appears in the written offer.',
          'Ask for grant size, fully diluted ownership, strike price, vesting and liquidity terms.',
        ],
        opportunity,
      };
    })
    .sort((a, b) => b.score - a.score || a.company.name.localeCompare(b.company.name));
}

function profitScale(result: string): number {
  const amount = fundingMillions(result);
  if (amount >= 50_000) return 20;
  if (amount >= 10_000) return 18;
  if (amount >= 5_000) return 16;
  if (amount >= 1_000) return 14;
  return 12;
}

export function rankCashCapacity(
  companies: AICompany[],
  opportunities: Map<string, CompanyOpportunity>,
): UpsideAssessment[] {
  return companies
    .flatMap((company) => {
      const financialEvidence = FINANCIAL_EVIDENCE[company.id];
      const payProfile = PAY_PROFILES[company.id];
      if (!financialEvidence || !payProfile) return [];
      const opportunity = opportunities.get(company.id);
      let score = profitScale(financialEvidence.result) + payProfile.marketPoints + payProfile.roleFitPoints;
      score += Math.min(10, fitPoints(opportunity));
      if (headcountUpper(company.headcount) >= 1_000) score += 7;
      else if (headcountUpper(company.headcount) >= 50) score += 4;
      else if (headcountUpper(company.headcount) > 0) score += 2;
      if (company.hiring || (company.openRolesTotal ?? 0) > 0) score += 6;
      if (company.careersUrl) score += 3;

      const reasons = [
        `${payProfile.confidence} C$150K total-comp path at ${payProfile.targetLevel} level`,
        `${financialEvidence.entity}: ${financialEvidence.result} (${financialEvidence.period})`,
      ];
      if (company.headcount) reasons.push(`${company.headcount} local or listed-team employees`);
      if (company.hiring || (company.openRolesTotal ?? 0) > 0) reasons.push('Active careers or hiring signal');
      if (opportunity) reasons.push(`${opportunity.best.score}% resume match on the best live role`);

      return [{
        company,
        score: Math.min(99, score),
        label: `${payProfile.confidence} target`,
        risk: payProfile.confidence === 'Exceptional' ? 'Lower' : payProfile.confidence === 'Strong' ? 'Moderate' : 'Role-dependent',
        reasons: reasons.slice(0, 4),
        cautions: [
          'The C$150K target is total compensation, not guaranteed base salary.',
          'Confirm base, target bonus, pension and equity as separate offer components.',
        ],
        targetLevel: payProfile.targetLevel,
        opportunity,
        financialEvidence,
      } satisfies UpsideAssessment];
    })
    .sort((a, b) => b.score - a.score || a.company.name.localeCompare(b.company.name));
}
