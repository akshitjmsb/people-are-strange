import type { Person } from './types';

// ── The People Layer ─────────────────────────────────────────────────────────
// A map of companies tells you where to look. This tells you who to message.
// Key people at the companies that are actually hiring — founders, lab leads,
// CTOs and the executives who own headcount — so a pin on the map turns into a
// LinkedIn conversation.
//
// Two honesty notes, because this data ages fast:
//   • `linkedinUrl` is constructed from the lowercase first-last pattern
//     (linkedin.com/in/valerie-pisano). It's the right guess for most public
//     figures, but it is a guess — the UI offers a name search as a fallback.
//   • People move. Anyone known to have left carries `former: true` and stays
//     in the list only for context; the UI greys them out.
//
// Deliberately skipped: WSP Energy and Port de Montréal — a global engineering
// firm and a government port authority, where the named executives aren't the
// people who answer a cold message. Apply through their portals instead.

export const PEOPLE: Person[] = [
  // ── AI ─────────────────────────────────────────────────────────────────────
  {
    id: 'mila-valerie-pisano',
    companyId: 'mila',
    name: 'Valérie Pisano',
    role: 'President & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/valerie-pisano',
    note: 'Runs the institute day to day; sets hiring priorities across the 1,400-researcher community.',
  },
  {
    id: 'mila-yoshua-bengio',
    companyId: 'mila',
    name: 'Yoshua Bengio',
    role: 'Founder & Scientific Advisor',
    linkedinUrl: 'https://www.linkedin.com/in/yoshua-bengio',
    note: 'Turing Award laureate and the gravitational centre of the Montreal AI scene.',
  },
  {
    id: 'mila-stephane-letourneau',
    companyId: 'mila',
    name: 'Stéphane Létourneau',
    role: 'Executive Vice-President',
    linkedinUrl: 'https://www.linkedin.com/in/stephane-letourneau',
    note: 'Owns partnerships and operations — the route in for industry collaboration.',
  },
  {
    id: 'mila-benjamin-prudhomme',
    companyId: 'mila',
    name: "Benjamin Prud'homme",
    role: 'VP, Policy, Society & Global Affairs',
    linkedinUrl: 'https://www.linkedin.com/in/benjamin-prudhomme',
    note: 'Leads AI policy and governance work — the contact for anything non-technical.',
  },

  {
    id: 'msr-geoff-gordon',
    companyId: 'microsoft-research-montreal',
    name: 'Geoff Gordon',
    role: 'Lab Director',
    linkedinUrl: 'https://www.linkedin.com/in/geoff-gordon',
    note: 'Heads the Montreal lab; ex-CMU machine learning faculty.',
  },
  {
    id: 'msr-adam-trischler',
    companyId: 'microsoft-research-montreal',
    name: 'Adam Trischler',
    role: 'Research Manager',
    linkedinUrl: 'https://www.linkedin.com/in/adam-trischler',
    note: 'Manages the NLP/machine-reading research group — hires interns and researchers directly.',
  },
  {
    id: 'msr-fernando-diaz',
    companyId: 'microsoft-research-montreal',
    name: 'Fernando Diaz',
    role: 'FATE Research Lead',
    linkedinUrl: 'https://www.linkedin.com/in/fernando-diaz',
    note: 'Fairness, accountability, transparency & ethics in AI — information retrieval background.',
  },

  {
    id: 'fair-joelle-pineau',
    companyId: 'meta-fair-montreal',
    name: 'Joelle Pineau',
    role: 'VP AI Research (departed May 2025)',
    linkedinUrl: 'https://www.linkedin.com/in/joelle-pineau',
    note: 'Built and led FAIR Montreal for years. Left Meta in May 2025 — still the best-connected person in Montreal robotics/RL, just not a route into Meta.',
    former: true,
  },
  {
    id: 'fair-michael-rabbat',
    companyId: 'meta-fair-montreal',
    name: 'Michael Rabbat',
    role: 'Research Director',
    linkedinUrl: 'https://www.linkedin.com/in/michael-rabbat',
    note: 'Long-time FAIR Montreal researcher and McGill professor; the current research anchor.',
  },

  {
    id: 'deepmind-doina-precup',
    companyId: 'google-deepmind-montreal',
    name: 'Doina Precup',
    role: 'Lab Lead, Montreal',
    linkedinUrl: 'https://www.linkedin.com/in/doina-precup',
    note: 'Also a McGill professor and Mila core member — reinforcement learning is her field.',
  },
  {
    id: 'deepmind-shibl-mourad',
    companyId: 'google-deepmind-montreal',
    name: 'Shibl Mourad',
    role: 'Head of Engineering & Product Management',
    linkedinUrl: 'https://www.linkedin.com/in/shibl-mourad',
    note: 'Owns the engineering side of the Montreal office — the non-research hiring path.',
  },

  {
    id: 'servicenow-yoshua-bengio',
    companyId: 'servicenow-research',
    name: 'Yoshua Bengio',
    role: 'Advisor',
    linkedinUrl: 'https://www.linkedin.com/in/yoshua-bengio',
    note: 'Advises the lab, which came to ServiceNow through the Element AI acquisition. No separate Montreal leadership is publicly named — go through the ServiceNow careers site.',
  },

  {
    id: 'cohere-aidan-gomez',
    companyId: 'cohere-montreal',
    name: 'Aidan Gomez',
    role: 'Co-founder & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/aidan-gomez',
    note: 'Co-author of "Attention Is All You Need"; posts openly about hiring.',
  },
  {
    id: 'cohere-nick-frosst',
    companyId: 'cohere-montreal',
    name: 'Nick Frosst',
    role: 'Co-founder',
    linkedinUrl: 'https://www.linkedin.com/in/nick-frosst',
    note: 'First employee at Google Brain Toronto under Geoff Hinton.',
  },
  {
    id: 'cohere-ivan-zhang',
    companyId: 'cohere-montreal',
    name: 'Ivan Zhang',
    role: 'Co-founder',
    linkedinUrl: 'https://www.linkedin.com/in/ivan-zhang',
    note: 'Drives applied research and the model-training side.',
  },
  {
    id: 'cohere-phil-blunsom',
    companyId: 'cohere-montreal',
    name: 'Phil Blunsom',
    role: 'Chief Technology Officer',
    linkedinUrl: 'https://www.linkedin.com/in/phil-blunsom',
    note: 'Ex-DeepMind and Oxford professor; owns the research org.',
  },

  {
    id: 'coveo-laurent-simoneau',
    companyId: 'coveo',
    name: 'Laurent Simoneau',
    role: 'Founder, President & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/laurent-simoneau',
    note: 'Founder who returned to the CEO seat in April 2025 — expect a builder-first pitch to land best.',
  },
  {
    id: 'coveo-richard-tessier',
    companyId: 'coveo',
    name: 'Richard Tessier',
    role: 'SVP & Field CTO',
    linkedinUrl: 'https://www.linkedin.com/in/richard-tessier',
    note: 'Customer-facing technical leadership — good entry point for solutions/AI engineering roles.',
  },

  {
    id: 'hopper-frederic-lalonde',
    companyId: 'hopper',
    name: 'Frederic Lalonde',
    role: 'Founder & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/frederic-lalonde',
    note: 'Serial founder (sold Newtrade to Expedia); very vocal about Montreal as a tech city.',
  },
  {
    id: 'hopper-dakota-smith',
    companyId: 'hopper',
    name: 'Dakota Smith',
    role: 'President & Co-founder',
    linkedinUrl: 'https://www.linkedin.com/in/dakota-smith',
    note: 'Runs the commercial side including the HTS B2B business.',
  },
  {
    id: 'hopper-joost-ouwerkerk',
    companyId: 'hopper',
    name: 'Joost Ouwerkerk',
    role: 'Chief Technology Officer',
    linkedinUrl: 'https://www.linkedin.com/in/joost-ouwerkerk',
    note: 'Owns the engineering org — the person behind senior technical hires.',
  },
  {
    id: 'hopper-ken-pickering',
    companyId: 'hopper',
    name: 'Ken Pickering',
    role: 'VP Engineering',
    linkedinUrl: 'https://www.linkedin.com/in/ken-pickering',
    note: 'Closest to day-to-day engineering hiring.',
  },

  {
    id: 'botpress-sylvain-perron',
    companyId: 'botpress',
    name: 'Sylvain Perron',
    role: 'Co-founder & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/sylvain-perron',
    note: 'Open-source-first founder; the community is a legitimate way to get noticed before messaging.',
  },
  {
    id: 'botpress-justin-watson',
    companyId: 'botpress',
    name: 'Justin Watson',
    role: 'Co-founder',
    linkedinUrl: 'https://www.linkedin.com/in/justin-watson',
    note: 'Co-founded the agent platform out of Montreal.',
  },
  {
    id: 'botpress-jean-bernard-perron',
    companyId: 'botpress',
    name: 'Jean-Bernard Perron',
    role: 'COO & CFO',
    linkedinUrl: 'https://www.linkedin.com/in/jean-bernard-perron',
    note: 'Operations and finance — owns headcount planning at a company this size.',
  },

  {
    id: 'lightspeed-dax-dasilva',
    companyId: 'lightspeed',
    name: 'Dax Dasilva',
    role: 'Founder & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/dax-dasilva',
    note: 'Founder back in the CEO seat; also founded the Never Apart cultural non-profit in Montreal.',
  },
  {
    id: 'lightspeed-bhawna-singh',
    companyId: 'lightspeed',
    name: 'Bhawna Singh',
    role: 'Chief Technology Officer',
    linkedinUrl: 'https://www.linkedin.com/in/bhawna-singh',
    note: 'Ex-Okta engineering leader; rebuilding the technical org — active hiring surface.',
  },
  {
    id: 'lightspeed-john-shapiro',
    companyId: 'lightspeed',
    name: 'John Shapiro',
    role: 'Chief Product Officer',
    linkedinUrl: 'https://www.linkedin.com/in/john-shapiro',
    note: 'Owns product; the route in for PM and product-adjacent roles.',
  },
  {
    id: 'lightspeed-asha-bakshani',
    companyId: 'lightspeed',
    name: 'Asha Bakshani',
    role: 'Chief Financial Officer',
    linkedinUrl: 'https://www.linkedin.com/in/asha-bakshani',
    note: 'Finance and corporate strategy at a public company.',
  },

  {
    id: 'alayacare-adrian-schauer',
    companyId: 'alayacare',
    name: 'Adrian Schauer',
    role: 'Founder & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/adrian-schauer',
    note: 'EY Entrepreneur Of The Year 2025 — visible and reachable on LinkedIn.',
  },
  {
    id: 'alayacare-jean-francois-gailleur',
    companyId: 'alayacare',
    name: 'Jean-Francois Gailleur',
    role: 'Chief Technology Officer',
    linkedinUrl: 'https://www.linkedin.com/in/jean-francois-gailleur',
    note: 'Runs engineering for the home-care platform.',
  },
  {
    id: 'alayacare-brady-murphy',
    companyId: 'alayacare',
    name: 'Brady Murphy',
    role: 'Co-founder & Chief Revenue Officer',
    linkedinUrl: 'https://www.linkedin.com/in/brady-murphy',
    note: 'Owns go-to-market — the contact for commercial roles.',
  },

  {
    id: 'dialogue-cherif-habib',
    companyId: 'dialogue',
    name: 'Cherif Habib',
    role: 'Co-founder & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/cherif-habib',
    note: 'Took Dialogue from startup to public company to acquisition — strong Montreal health-tech network.',
  },
  {
    id: 'dialogue-alexis-smirnov',
    companyId: 'dialogue',
    name: 'Alexis Smirnov',
    role: 'Co-founder & CTO',
    linkedinUrl: 'https://www.linkedin.com/in/alexis-smirnov',
    note: 'Deeply involved in the Montreal AI/ML community; writes publicly about the tech stack.',
  },
  {
    id: 'dialogue-jean-nicolas-guillemette',
    companyId: 'dialogue',
    name: 'Jean-Nicolas Guillemette',
    role: 'Chief Operating Officer',
    linkedinUrl: 'https://www.linkedin.com/in/jean-nicolas-guillemette',
    note: 'Ex-Uber Canada; runs operations and scaling.',
  },

  {
    id: 'optable-vlad-stesin',
    companyId: 'optable',
    name: 'Vlad Stesin',
    role: 'Co-founder & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/vlad-stesin',
    note: 'Stepped into the CEO role in August 2025; ex-AppNexus product leader.',
  },
  {
    id: 'optable-yves-poire',
    companyId: 'optable',
    name: 'Yves Poiré',
    role: 'Co-founder & Executive Chairman',
    linkedinUrl: 'https://www.linkedin.com/in/yves-poire',
    note: 'Moved from CEO to chairman — still the strategic voice.',
  },
  {
    id: 'optable-bosko-milekic',
    companyId: 'optable',
    name: 'Bosko Milekic',
    role: 'Co-founder & Chief Product Officer',
    linkedinUrl: 'https://www.linkedin.com/in/bosko-milekic',
    note: 'Technical co-founder behind the data-clean-room product.',
  },

  // ── Energy ─────────────────────────────────────────────────────────────────
  {
    id: 'hydro-quebec-claudine-bouchard',
    companyId: 'hydro-quebec',
    name: 'Claudine Bouchard',
    role: 'President & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/claudine-bouchard',
    note: 'Took the top job in July 2025 after running operations and infrastructure — an engineer leading the utility.',
  },

  {
    id: 'innergex-jean-trudel',
    companyId: 'innergex',
    name: 'Jean Trudel',
    role: 'Chief Executive Officer',
    linkedinUrl: 'https://www.linkedin.com/in/jean-trudel',
    note: 'Promoted from CFO to CEO in March 2026 — finance-fluent, so lead with numbers.',
  },
  {
    id: 'innergex-pascale-tremblay',
    companyId: 'innergex',
    name: 'Pascale Tremblay',
    role: 'Chief Asset Officer',
    linkedinUrl: 'https://www.linkedin.com/in/pascale-tremblay',
    note: 'Owns the operating portfolio of hydro, wind and solar assets.',
  },

  {
    id: 'boralex-patrick-decostre',
    companyId: 'boralex',
    name: 'Patrick Decostre',
    role: 'President & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/patrick-decostre',
    note: 'Came up through the European business before taking the top role.',
  },
  {
    id: 'boralex-philippe-bonin',
    companyId: 'boralex',
    name: 'Philippe Bonin',
    role: 'EVP & Chief Financial Officer',
    linkedinUrl: 'https://www.linkedin.com/in/philippe-bonin',
    note: 'Finance lead for the renewable project pipeline.',
  },

  {
    id: 'evlo-sonia-st-arnaud',
    companyId: 'evlo',
    name: 'Sonia St-Arnaud',
    role: 'President & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/sonia-st-arnaud',
    note: 'Leads the Hydro-Québec battery-storage subsidiary — small team, so the CEO is genuinely reachable.',
  },

  {
    id: 'dcbel-marc-andre-forget',
    companyId: 'dcbel',
    name: 'Marc Andre Forget',
    role: 'Co-founder & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/marc-andre-forget',
    note: 'Founder of the home energy station company; hardware-plus-software story.',
  },

  {
    id: 'energir-eric-lachance',
    companyId: 'energir',
    name: 'Éric Lachance',
    role: 'President & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/eric-lachance',
    note: 'Leading the utility through its decarbonization shift.',
  },
  {
    id: 'energir-stephanie-trudeau',
    companyId: 'energir',
    name: 'Stéphanie Trudeau',
    role: 'Executive Vice-President, Québec',
    linkedinUrl: 'https://www.linkedin.com/in/stephanie-trudeau',
    note: 'Runs the Québec business — the operational decision-maker locally.',
  },

  // ── Marine ─────────────────────────────────────────────────────────────────
  {
    id: 'csl-louis-martel',
    companyId: 'csl-group',
    name: 'Louis Martel',
    role: 'President & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/louis-martel',
    note: 'Leads the global self-unloading fleet from the Montreal head office.',
  },

  {
    id: 'fednav-paul-pathy',
    companyId: 'fednav',
    name: 'Paul Pathy',
    role: 'President & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/paul-pathy',
    note: 'Third-generation leader of Canada’s largest ocean-going dry-bulk shipowner.',
  },
];

/** Everyone we know at one company, current people first. */
export function peopleFor(companyId: string): Person[] {
  return PEOPLE.filter((p) => p.companyId === companyId).sort(
    (a, b) => Number(a.former ?? false) - Number(b.former ?? false),
  );
}

/** Do we have anyone for this company? Cheap enough to call in a render. */
export function hasPeople(companyId: string): boolean {
  return PEOPLE.some((p) => p.companyId === companyId);
}

/** LinkedIn people-search fallback for when a constructed profile URL misses. */
export function linkedinSearchUrl(name: string, companyName?: string): string {
  const q = companyName ? `${name} ${companyName}` : name;
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(q)}`;
}
