// ── Live open-role counts, via applicant-tracking system board APIs ──────────
// Careers pages are unscrapable in the general case, but most companies sit on
// an ATS that exposes a public, unauthenticated JSON board. This module turns
// an { provider, token } reference into a normalized list of postings.
//
// The point isn't the total — "Cohere has 137 open roles" is noise. It's the
// Montreal slice: "31 of Rodeo FX's 48 roles are here" is the thing no other
// resource tells you. Where a provider only gives a freeform location string
// we grade confidence rather than guessing (see `montrealness`).

/** Which board API a company's postings live behind. */
export type AtsProvider =
  | 'ashby'
  | 'greenhouse'
  | 'lever'
  | 'smartrecruiters'
  | 'workable'
  | 'bamboohr'
  | 'ubisoft-mtl';

export interface AtsRef {
  provider: AtsProvider;
  token: string;
}

export interface Posting {
  title: string;
  location: string;
  /** 'here'  — location names Montreal or Québec: countable as a local role.
   *  'maybe' — country-level only ("Canada"): real, but not provably local.
   *  'away'  — names somewhere else. */
  locality: 'here' | 'maybe' | 'away';
  url?: string;
}

export interface RoleCounts {
  /** Postings whose location names Montreal or Québec. */
  montreal: number;
  /** Every posting on the board, wherever it is. */
  total: number;
  /** Country-level-only postings that might be local but don't say so. */
  ambiguous: number;
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const TIMEOUT_MS = 25_000;

async function getJson(url: string, init?: RequestInit): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { 'user-agent': UA, accept: 'application/json', ...(init?.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Grade a freeform location string. Deliberately conservative: a bare
 *  "Canada" counts as ambiguous, never as Montreal — over-claiming local roles
 *  is exactly the kind of lie this app is trying to stop telling. */
export function montrealness(location: string): Posting['locality'] {
  const s = location.toLowerCase();
  if (/montr[eé]al|qu[eé]bec|\bqc\b|laval|longueuil|brossard|saint-laurent/.test(s)) return 'here';
  // Remote-anywhere and country-wide postings are genuinely open to someone in
  // Montreal, but we can't claim they're *here*.
  if (/^canada$|remote|anywhere|worldwide|monde entier|hybrid/.test(s.trim())) return 'maybe';
  if (!s.trim()) return 'maybe';
  return 'away';
}

function grade(title: string, location: string, url?: string): Posting {
  return { title, location, locality: montrealness(location), url };
}

// ── Provider adapters ────────────────────────────────────────────────────────

const FETCHERS: Record<AtsProvider, (token: string) => Promise<Posting[]>> = {
  async ashby(token) {
    const j = (await getJson(`https://api.ashbyhq.com/posting-api/job-board/${token}`)) as {
      jobs?: { title: string; location: string; jobUrl?: string }[];
    };
    return (j.jobs ?? []).map((p) => grade(p.title, p.location ?? '', p.jobUrl));
  },

  async greenhouse(token) {
    const j = (await getJson(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs`)) as {
      jobs?: { title: string; location?: { name?: string }; absolute_url?: string }[];
    };
    return (j.jobs ?? []).map((p) => grade(p.title, p.location?.name ?? '', p.absolute_url));
  },

  async lever(token) {
    const j = (await getJson(`https://api.lever.co/v0/postings/${token}?mode=json`)) as {
      text: string;
      categories?: { location?: string };
      hostedUrl?: string;
    }[];
    return (j ?? []).map((p) => grade(p.text, p.categories?.location ?? '', p.hostedUrl));
  },

  async smartrecruiters(token) {
    // Paginated; 100 is the max page size.
    const out: Posting[] = [];
    for (let offset = 0; ; offset += 100) {
      const j = (await getJson(
        `https://api.smartrecruiters.com/v1/companies/${token}/postings?limit=100&offset=${offset}`,
      )) as {
        totalFound?: number;
        content?: { name: string; location?: { city?: string; region?: string; country?: string; fullLocation?: string }; ref?: string }[];
      };
      const page = j.content ?? [];
      for (const p of page) {
        const loc = p.location?.fullLocation ?? [p.location?.city, p.location?.region, p.location?.country].filter(Boolean).join(', ');
        out.push(grade(p.name, loc, p.ref));
      }
      if (page.length < 100 || out.length >= (j.totalFound ?? 0)) break;
    }
    return out;
  },

  async workable(token) {
    const j = (await getJson(`https://apply.workable.com/api/v1/widget/accounts/${token}?details=true`)) as {
      jobs?: { title: string; city?: string; state?: string; country?: string; url?: string }[];
    };
    return (j.jobs ?? []).map((p) =>
      grade(p.title, [p.city, p.state, p.country].filter(Boolean).join(', '), p.url),
    );
  },

  async bamboohr(token) {
    const j = (await getJson(`https://${token}.bamboohr.com/careers/list`)) as {
      result?: { jobOpeningName: string; location?: { city?: string; state?: string; country?: string }; id: string | number }[];
    };
    return (j.result ?? []).map((p) =>
      grade(
        p.jobOpeningName,
        [p.location?.city, p.location?.state, p.location?.country].filter(Boolean).join(', '),
        `https://${token}.bamboohr.com/careers/${p.id}`,
      ),
    );
  },

  // Ubisoft Montréal runs a bespoke WordPress endpoint gated by a rotating
  // nonce, so the page has to be fetched first to mint one. Worth the extra
  // hop: it's the largest studio in the city and every posting on it is local
  // by construction, so the count needs no location filtering at all.
  async 'ubisoft-mtl'() {
    const page = await fetch('https://montreal.ubisoft.com/en/your-career/jobs/', {
      headers: { 'user-agent': UA },
    }).then((r) => r.text());
    // Rendered into the markup as a bare attribute: nonce="d5e60e1716".
    const nonce = page.match(/nonce=["']([a-f0-9]{8,})["']/i)?.[1];
    if (!nonce) throw new Error('could not mint a Ubisoft jobs nonce');
    const j = (await getJson(
      `https://montreal.ubisoft.com/wp-admin/admin-ajax.php?action=ubisoft_search_jobs&query=&offset=0&limit=200&nonce=${nonce}`,
    )) as { jobs?: { title: string; link?: string }[] };
    return (j.jobs ?? []).map((p) => ({
      title: p.title,
      location: 'Montréal, QC',
      locality: 'here' as const,
      url: p.link,
    }));
  },
};

/** Fetch and tally a company's board. Throws if the provider errors — callers
 *  decide whether a stale count or no count is the better fallback. */
export async function fetchRoleCounts(ref: AtsRef): Promise<RoleCounts & { postings: Posting[] }> {
  const postings = await FETCHERS[ref.provider](ref.token);
  return {
    montreal: postings.filter((p) => p.locality === 'here').length,
    ambiguous: postings.filter((p) => p.locality === 'maybe').length,
    total: postings.length,
    postings,
  };
}
