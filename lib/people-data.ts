import type { Person } from './types';

// ── The People Layer ─────────────────────────────────────────────────────────
// A map of companies tells you where to look. This tells you who to message.
// Key people at the companies that are actually hiring — founders, lab leads,
// CTOs and the executives who own headcount — so a pin on the map turns into a
// LinkedIn conversation.
//
// Two honesty notes, because this data ages fast:
//   • `linkedinUrl` is a web-search-verified profile URL, last checked
//     July 2026. Slugs are real — not guessed from name patterns.
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
    linkedinUrl: 'https://www.linkedin.com/in/valerie-pisano-7378721/',
    note: 'Runs the institute day to day; sets hiring priorities across the 1,400-researcher community.',
  },
  {
    id: 'mila-yoshua-bengio',
    companyId: 'mila',
    name: 'Yoshua Bengio',
    role: 'Founder & Scientific Advisor',
    linkedinUrl: 'https://www.linkedin.com/in/yoshuabengio',
    note: 'Turing Award laureate and the gravitational centre of the Montreal AI scene.',
  },
  {
    id: 'mila-stephane-letourneau',
    companyId: 'mila',
    name: 'Stéphane Létourneau',
    role: 'Executive Vice-President',
    linkedinUrl: 'https://www.linkedin.com/in/stephane-letourneau-077b504',
    note: 'Owns partnerships and operations — the route in for industry collaboration.',
  },
  {
    id: 'mila-benjamin-prudhomme',
    companyId: 'mila',
    name: "Benjamin Prud'homme",
    role: 'VP, Policy, Society & Global Affairs',
    linkedinUrl: 'https://www.linkedin.com/in/benjamin-prud-homme-83300b22',
    note: 'Leads AI policy and governance work — the contact for anything non-technical.',
  },

  {
    id: 'msr-geoff-gordon',
    companyId: 'microsoft-research-montreal',
    name: 'Geoff Gordon',
    role: 'Lab Director',
    linkedinUrl: 'https://www.linkedin.com/in/geoffreyegordon',
    note: 'Heads the Montreal lab; ex-CMU machine learning faculty.',
  },
  {
    id: 'msr-adam-trischler',
    companyId: 'microsoft-research-montreal',
    name: 'Adam Trischler',
    role: 'Research Manager',
    linkedinUrl: 'https://www.linkedin.com/in/adamtrischler',
    note: 'Manages the NLP/machine-reading research group — hires interns and researchers directly.',
  },
  {
    id: 'msr-fernando-diaz',
    companyId: 'microsoft-research-montreal',
    name: 'Fernando Diaz',
    role: 'FATE Research Lead (now at CMU / Google Research)',
    linkedinUrl: 'https://www.linkedin.com/in/fernando-diaz-b6b9023',
    note: 'Founded the FATE group at MSR Montreal. Now associate professor at CMU and research scientist at Google — still deeply connected to the Montreal scene.',
    former: true,
  },

  {
    id: 'fair-joelle-pineau',
    companyId: 'meta-fair-montreal',
    name: 'Joelle Pineau',
    role: 'VP AI Research (departed May 2025)',
    linkedinUrl: 'https://www.linkedin.com/in/joelle-pineau-371574141',
    note: 'Built and led FAIR Montreal for years. Left Meta in May 2025 and joined Cohere — still the best-connected person in Montreal robotics/RL.',
    former: true,
  },
  {
    id: 'fair-michael-rabbat',
    companyId: 'meta-fair-montreal',
    name: 'Michael Rabbat',
    role: 'Research Director (now VP World Models at AMI)',
    linkedinUrl: 'https://www.linkedin.com/in/michael-rabbat-66a00b7',
    note: 'Founding member of FAIR Montreal. Left Meta in 2025 to join Yann LeCun\'s AMI Labs as VP of World Models — still Montreal-based.',
    former: true,
  },

  {
    id: 'deepmind-doina-precup',
    companyId: 'google-deepmind-montreal',
    name: 'Doina Precup',
    role: 'Lab Lead, Montreal',
    linkedinUrl: 'https://www.linkedin.com/in/doina-precup-1ba61314',
    note: 'Also a McGill professor and Mila core member — reinforcement learning is her field.',
  },
  {
    id: 'deepmind-shibl-mourad',
    companyId: 'google-deepmind-montreal',
    name: 'Shibl Mourad',
    role: 'Head of Engineering & Product Management',
    linkedinUrl: 'https://www.linkedin.com/in/shiblmourad',
    note: 'Owns the engineering side of the Montreal office — the non-research hiring path.',
  },

  {
    id: 'servicenow-yoshua-bengio',
    companyId: 'servicenow-research',
    name: 'Yoshua Bengio',
    role: 'Advisor',
    linkedinUrl: 'https://www.linkedin.com/in/yoshuabengio',
    note: 'Advises the lab, which came to ServiceNow through the Element AI acquisition. No separate Montreal leadership is publicly named — go through the ServiceNow careers site.',
  },

  {
    id: 'cohere-aidan-gomez',
    companyId: 'cohere-montreal',
    name: 'Aidan Gomez',
    role: 'Co-founder & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/aidangomez',
    note: 'Co-author of "Attention Is All You Need"; posts openly about hiring.',
  },
  {
    id: 'cohere-nick-frosst',
    companyId: 'cohere-montreal',
    name: 'Nick Frosst',
    role: 'Co-founder',
    linkedinUrl: 'https://www.linkedin.com/in/nick-frosst-19b80463',
    note: 'First employee at Google Brain Toronto under Geoff Hinton.',
  },
  {
    id: 'cohere-ivan-zhang',
    companyId: 'cohere-montreal',
    name: 'Ivan Zhang',
    role: 'Co-founder',
    linkedinUrl: 'https://www.linkedin.com/in/1vnzh',
    note: 'Drives applied research and the model-training side.',
  },
  {
    id: 'cohere-phil-blunsom',
    companyId: 'cohere-montreal',
    name: 'Phil Blunsom',
    role: 'Chief Technology Officer',
    linkedinUrl: 'https://www.linkedin.com/in/phil-blunsom-95446a1b4',
    note: 'Ex-DeepMind and Oxford professor; owns the research org.',
  },

  {
    id: 'coveo-laurent-simoneau',
    companyId: 'coveo',
    name: 'Laurent Simoneau',
    role: 'Founder & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/lsimoneau',
    note: 'Founder who returned to the CEO seat in April 2025 — expect a builder-first pitch to land best.',
  },
  {
    id: 'coveo-richard-tessier',
    companyId: 'coveo',
    name: 'Richard Tessier',
    role: 'SVP & Field CTO',
    linkedinUrl: 'https://www.linkedin.com/in/richardtessier',
    note: 'Customer-facing technical leadership — good entry point for solutions/AI engineering roles.',
  },

  {
    id: 'hopper-frederic-lalonde',
    companyId: 'hopper',
    name: 'Frederic Lalonde',
    role: 'Founder & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/fredlalonde',
    note: 'Serial founder (sold Newtrade to Expedia); very vocal about Montreal as a tech city.',
  },
  {
    id: 'hopper-dakota-smith',
    companyId: 'hopper',
    name: 'Dakota Smith',
    role: 'President & Co-founder',
    linkedinUrl: 'https://www.linkedin.com/in/dakota-smith-hopper',
    note: 'Runs the commercial side including the HTS B2B business.',
  },
  {
    id: 'hopper-joost-ouwerkerk',
    companyId: 'hopper',
    name: 'Joost Ouwerkerk',
    role: 'Co-founder & former CTO (now at Deep Sky)',
    linkedinUrl: 'https://www.linkedin.com/in/joostouwerkerk',
    note: 'Co-founded Hopper and served as CTO until 2020. Now Co-founder & CTO of Deep Sky (carbon removal). Still deeply connected to Montreal tech.',
    former: true,
  },
  {
    id: 'hopper-ken-pickering',
    companyId: 'hopper',
    name: 'Ken Pickering',
    role: 'Chief Technology Officer',
    linkedinUrl: 'https://www.linkedin.com/in/kenpickering',
    note: 'Promoted from VP Engineering to CTO — the person behind senior technical hires.',
  },

  {
    id: 'botpress-sylvain-perron',
    companyId: 'botpress',
    name: 'Sylvain Perron',
    role: 'Co-founder & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/slvnperron',
    note: 'Open-source-first founder; the community is a legitimate way to get noticed before messaging.',
  },
  {
    id: 'botpress-justin-watson',
    companyId: 'botpress',
    name: 'Justin Watson',
    role: 'Co-founder',
    linkedinUrl: 'https://www.linkedin.com/in/justin-watson-6b232316',
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
    linkedinUrl: 'https://www.linkedin.com/in/daxdasilva',
    note: 'Founder back in the CEO seat; also founded the Never Apart cultural non-profit in Montreal.',
  },
  {
    id: 'lightspeed-bhawna-singh',
    companyId: 'lightspeed',
    name: 'Bhawna Singh',
    role: 'Chief Technology Officer',
    linkedinUrl: 'https://www.linkedin.com/in/bhawnasingh',
    note: 'Ex-Okta engineering leader; rebuilding the technical org — active hiring surface.',
  },
  {
    id: 'lightspeed-john-shapiro',
    companyId: 'lightspeed',
    name: 'John Shapiro',
    role: 'Chief Product Officer',
    linkedinUrl: 'https://www.linkedin.com/in/johnshapiro',
    note: 'Owns product; the route in for PM and product-adjacent roles.',
  },
  {
    id: 'lightspeed-asha-bakshani',
    companyId: 'lightspeed',
    name: 'Asha Bakshani',
    role: 'Chief Financial Officer',
    linkedinUrl: 'https://www.linkedin.com/in/asha-hotchandani-bakshani-1b416814',
    note: 'Finance and corporate strategy at a public company.',
  },

  {
    id: 'alayacare-adrian-schauer',
    companyId: 'alayacare',
    name: 'Adrian Schauer',
    role: 'Founder & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/adrianschauer',
    note: 'EY Entrepreneur Of The Year 2025 — visible and reachable on LinkedIn.',
  },
  {
    id: 'alayacare-jean-francois-gailleur',
    companyId: 'alayacare',
    name: 'Jean-Francois Gailleur',
    role: 'SVP Engineering',
    linkedinUrl: 'https://www.linkedin.com/in/gailleur',
    note: 'Runs engineering for the home-care platform.',
  },
  {
    id: 'alayacare-brady-murphy',
    companyId: 'alayacare',
    name: 'Brady Murphy',
    role: 'Co-founder & Chief Revenue Officer (now CRO at Coconut Software)',
    linkedinUrl: 'https://www.linkedin.com/in/bradymurphy',
    note: 'Co-founded AlayaCare but has moved on — now CRO at Coconut Software.',
    former: true,
  },

  {
    id: 'dialogue-cherif-habib',
    companyId: 'dialogue',
    name: 'Cherif Habib',
    role: 'Co-founder & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/cherif',
    note: 'Took Dialogue from startup to public company to acquisition — strong Montreal health-tech network.',
  },
  {
    id: 'dialogue-alexis-smirnov',
    companyId: 'dialogue',
    name: 'Alexis Smirnov',
    role: 'Co-founder & CTO',
    linkedinUrl: 'https://www.linkedin.com/in/alexissmirnov',
    note: 'Deeply involved in the Montreal AI/ML community; writes publicly about the tech stack.',
  },
  {
    id: 'dialogue-jean-nicolas-guillemette',
    companyId: 'dialogue',
    name: 'Jean-Nicolas Guillemette',
    role: 'Chief Operating Officer',
    linkedinUrl: 'https://www.linkedin.com/in/jean-nicolas-guillemette-5417501',
    note: 'Ex-Uber Canada; runs operations and scaling.',
  },

  {
    id: 'optable-vlad-stesin',
    companyId: 'optable',
    name: 'Vlad Stesin',
    role: 'Co-founder & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/vladstesin',
    note: 'Stepped into the CEO role in August 2025; ex-AppNexus product leader.',
  },
  {
    id: 'optable-yves-poire',
    companyId: 'optable',
    name: 'Yves Poiré',
    role: 'Co-founder & Executive Chairman',
    linkedinUrl: 'https://www.linkedin.com/in/yves-poir%C3%A9-7424233',
    note: 'Moved from CEO to chairman — still the strategic voice.',
  },
  {
    id: 'optable-bosko-milekic',
    companyId: 'optable',
    name: 'Bosko Milekic',
    role: 'Co-founder & Chief Product Officer',
    linkedinUrl: 'https://www.linkedin.com/in/bosko',
    note: 'Technical co-founder behind the data-clean-room product.',
  },

  // ── Energy ─────────────────────────────────────────────────────────────────
  {
    id: 'hydro-quebec-claudine-bouchard',
    companyId: 'hydro-quebec',
    name: 'Claudine Bouchard',
    role: 'President & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/claudine-bouchard-asc-a02abb11',
    note: 'Took the top job in July 2025 after running operations and infrastructure — an engineer leading the utility.',
  },

  {
    id: 'innergex-jean-trudel',
    companyId: 'innergex',
    name: 'Jean Trudel',
    role: 'Chief Executive Officer',
    linkedinUrl: 'https://www.linkedin.com/in/jean-trudel-5186059',
    note: 'Promoted from CFO to CEO in March 2026 — finance-fluent, so lead with numbers.',
  },
  {
    id: 'innergex-pascale-tremblay',
    companyId: 'innergex',
    name: 'Pascale Tremblay',
    role: 'Chief Asset Officer',
    linkedinUrl: 'https://www.linkedin.com/in/pascale-tremblay-94571119',
    note: 'Owns the operating portfolio of hydro, wind and solar assets.',
  },

  {
    id: 'boralex-patrick-decostre',
    companyId: 'boralex',
    name: 'Patrick Decostre',
    role: 'President & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/patrick-decostre-06bb2b9',
    note: 'Came up through the European business before taking the top role.',
  },
  {
    id: 'boralex-philippe-bonin',
    companyId: 'boralex',
    name: 'Philippe Bonin',
    role: 'EVP & Chief Financial Officer',
    linkedinUrl: 'https://www.linkedin.com/in/philippe-bonin-46922026',
    note: 'Finance lead for the renewable project pipeline.',
  },

  {
    id: 'evlo-sonia-st-arnaud',
    companyId: 'evlo',
    name: 'Sonia St-Arnaud',
    role: 'President & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/sonia-st-arnaud-fcpa-728b36127',
    note: 'Leads the Hydro-Québec battery-storage subsidiary — small team, so the CEO is genuinely reachable.',
  },

  {
    id: 'dcbel-marc-andre-forget',
    companyId: 'dcbel',
    name: 'Marc Andre Forget',
    role: 'Co-founder & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/mafing',
    note: 'Founder of the home energy station company; hardware-plus-software story.',
  },

  {
    id: 'energir-eric-lachance',
    companyId: 'energir',
    name: 'Éric Lachance',
    role: 'President & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/eric-lachance-a83980',
    note: 'Leading the utility through its decarbonization shift.',
  },
  {
    id: 'energir-stephanie-trudeau',
    companyId: 'energir',
    name: 'Stéphanie Trudeau',
    role: 'Executive Vice-President, Québec',
    linkedinUrl: 'https://www.linkedin.com/in/st%C3%A9phanie-trudeau-asc-c-dir-03704a18',
    note: 'Runs the Québec business — the operational decision-maker locally.',
  },

  // ── Marine ─────────────────────────────────────────────────────────────────
  {
    id: 'csl-louis-martel',
    companyId: 'csl-group',
    name: 'Louis Martel',
    role: 'President & CEO',
    linkedinUrl: 'https://www.linkedin.com/in/louis-martel-532473107',
    note: 'Leads the global self-unloading fleet from the Montreal head office.',
  },

  {
    id: 'fednav-paul-pathy',
    companyId: 'fednav',
    name: 'Paul Pathy',
    role: 'President & CEO',
    linkedinUrl: 'https://www.linkedin.com/search/results/people/?keywords=Paul%20Pathy%20Fednav',
    note: 'Third-generation leader of Canada\'s largest ocean-going dry-bulk shipowner. No public LinkedIn profile — this link searches for him.',
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

/** LinkedIn people-search fallback for when a profile URL misses. */
export function linkedinSearchUrl(name: string, companyName?: string): string {
  const q = companyName ? `${name} ${companyName}` : name;
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(q)}`;
}
