import { createHash } from 'node:crypto';

import type { CityConfig } from './city-config';

// ── Live open-role counts, via applicant-tracking system board APIs ──────────
// Careers pages are unscrapable in the general case, but most companies sit on
// an ATS that exposes a public, unauthenticated JSON board. This module turns
// an { provider, token } reference into a normalized list of postings.
//
// The point isn't the total — "Cohere has 137 open roles" is noise. It's the
// Montreal slice: "31 of Rodeo FX's 48 roles are here" is the thing no other
// resource tells you. Where a provider only gives a freeform location string
// we grade confidence rather than guessing (see `localityMatch`).

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
  /** Provider-stable identifier. Combined with company id in the DB. */
  externalId: string;
  title: string;
  location: string;
  /** 'here'  — location names Montreal or Québec: countable as a local role.
   *  'maybe' — country-level only ("Canada"): real, but not provably local.
   *  'away'  — names somewhere else. */
  locality: 'here' | 'maybe' | 'away';
  url: string;
  description?: string;
  department?: string;
  employmentType?: string;
  workplaceType?: string;
  publishedAt?: string;
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

/** Grade a freeform location string against the active city's locality
 *  patterns. Deliberately conservative: a bare "Canada" counts as ambiguous,
 *  never as local — over-claiming local roles is exactly the kind of lie
 *  this app is trying to stop telling. */
export function localityMatch(city: CityConfig, location: string): Posting['locality'] {
  const { localityPattern, localityAmbiguousPattern } = city;
  const s = location.toLowerCase();
  if (localityPattern.test(s)) return 'here';
  if (localityAmbiguousPattern.test(s.trim()) || !s.trim()) return 'maybe';
  return 'away';
}

function decodeHtml(value: string): string {
  const named: Record<string, string> = {
    amp: '&', apos: "'", gt: '>', lt: '<', nbsp: ' ', quot: '"',
  };
  return value
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|div|h[1-6])\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, decimal: string) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&([a-z]+);/gi, (entity, name: string) => named[name.toLowerCase()] ?? entity)
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

function fallbackId(...parts: string[]): string {
  return createHash('sha256').update(parts.join('\u0000')).digest('hex').slice(0, 24);
}

function grade(
  city: CityConfig,
  externalId: string | number | undefined,
  title: string,
  location: string,
  url: string,
  extra: Partial<Omit<Posting, 'externalId' | 'title' | 'location' | 'locality' | 'url'>> = {},
): Posting {
  const locality = localityMatch(city, location);
  const titleNamesAnotherCountry = /\b(usa|u\.s\.|united states|uk|united kingdom|ireland|spain|brazil|mexico)\b/i.test(title)
    && !city.localityPattern.test(title.toLowerCase());
  return {
    externalId: String(externalId ?? fallbackId(url, title, location)),
    title,
    location,
    // Some remote boards put the country in the title rather than the location
    // field (for example "Remote - USA"). Do not present those as potentially
    // local merely because the ATS location column says only "Remote".
    locality: locality === 'maybe' && titleNamesAnotherCountry ? 'away' : locality,
    url,
    ...extra,
  };
}

// ── Provider adapters ────────────────────────────────────────────────────────

const FETCHERS: Record<AtsProvider, (city: CityConfig, token: string) => Promise<Posting[]>> = {
  async ashby(city, token) {
    const j = (await getJson(`https://api.ashbyhq.com/posting-api/job-board/${token}`)) as {
      jobs?: {
        id?: string;
        title: string;
        location: string;
        jobUrl?: string;
        descriptionPlain?: string;
        department?: string;
        team?: string;
        employmentType?: string;
        workplaceType?: string;
        publishedAt?: string;
        isListed?: boolean;
      }[];
    };
    return (j.jobs ?? [])
      .filter((p) => p.isListed !== false)
      .map((p) => grade(
        city,
        p.id,
        p.title,
        p.location ?? '',
        p.jobUrl ?? `https://jobs.ashbyhq.com/${token}`,
        {
          description: p.descriptionPlain?.trim() || undefined,
          department: p.team ?? p.department,
          employmentType: p.employmentType,
          workplaceType: p.workplaceType,
          publishedAt: p.publishedAt,
        },
      ));
  },

  async greenhouse(city, token) {
    const j = (await getJson(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`)) as {
      jobs?: {
        id: number;
        title: string;
        location?: { name?: string };
        absolute_url?: string;
        content?: string;
        departments?: { name?: string }[];
        first_published?: string;
        updated_at?: string;
      }[];
    };
    return (j.jobs ?? []).map((p) => grade(
      city,
      p.id,
      p.title,
      p.location?.name ?? '',
      p.absolute_url ?? `https://boards.greenhouse.io/${token}`,
      {
        description: p.content ? decodeHtml(p.content) : undefined,
        department: p.departments?.map((d) => d.name).filter(Boolean).join(', ') || undefined,
        publishedAt: p.first_published ?? p.updated_at,
      },
    ));
  },

  async lever(city, token) {
    const j = (await getJson(`https://api.lever.co/v0/postings/${token}?mode=json`)) as {
      id?: string;
      text: string;
      categories?: { location?: string; commitment?: string; team?: string; department?: string };
      hostedUrl?: string;
      descriptionPlain?: string;
      additionalPlain?: string;
      workplaceType?: string;
      createdAt?: number;
    }[];
    return (j ?? []).map((p) => grade(
      city,
      p.id,
      p.text,
      p.categories?.location ?? '',
      p.hostedUrl ?? `https://jobs.lever.co/${token}`,
      {
        description: [p.descriptionPlain, p.additionalPlain].filter(Boolean).join('\n').trim() || undefined,
        department: p.categories?.team ?? p.categories?.department,
        employmentType: p.categories?.commitment,
        workplaceType: p.workplaceType,
        publishedAt: p.createdAt ? new Date(p.createdAt).toISOString() : undefined,
      },
    ));
  },

  async smartrecruiters(city, token) {
    // Paginated; 100 is the max page size.
    const out: Posting[] = [];
    for (let offset = 0; ; offset += 100) {
      const j = (await getJson(
        `https://api.smartrecruiters.com/v1/companies/${token}/postings?limit=100&offset=${offset}`,
      )) as {
        totalFound?: number;
        content?: {
          id: string;
          name: string;
          location?: { city?: string; region?: string; country?: string; fullLocation?: string; remote?: boolean; hybrid?: boolean };
          ref?: string;
          department?: { label?: string };
          typeOfEmployment?: { label?: string };
          releasedDate?: string;
        }[];
      };
      const page = j.content ?? [];
      for (const p of page) {
        const loc = p.location?.fullLocation ?? [p.location?.city, p.location?.region, p.location?.country].filter(Boolean).join(', ');
        const detail = localityMatch(city, loc) === 'away'
          ? null
          : await getJson(`https://api.smartrecruiters.com/v1/companies/${token}/postings/${p.id}`).catch(() => null) as {
              postingUrl?: string;
              applyUrl?: string;
              jobAd?: { sections?: Record<string, { text?: string }> };
            } | null;
        const sections = detail?.jobAd?.sections;
        const description = sections
          ? Object.values(sections).map((section) => section.text ? decodeHtml(section.text) : '').filter(Boolean).join('\n')
          : undefined;
        out.push(grade(city, p.id, p.name, loc, detail?.postingUrl ?? detail?.applyUrl ?? p.ref ?? `https://jobs.smartrecruiters.com/${token}`, {
          description,
          department: p.department?.label,
          employmentType: p.typeOfEmployment?.label,
          workplaceType: p.location?.remote ? 'Remote' : p.location?.hybrid ? 'Hybrid' : undefined,
          publishedAt: p.releasedDate,
        }));
      }
      if (page.length < 100 || out.length >= (j.totalFound ?? 0)) break;
    }
    return out;
  },

  async workable(city, token) {
    const j = (await getJson(`https://apply.workable.com/api/v1/widget/accounts/${token}?details=true`)) as {
      jobs?: {
        shortcode?: string;
        title: string;
        city?: string;
        state?: string;
        country?: string;
        url?: string;
        shortlink?: string;
        description?: string;
        department?: string;
        employment_type?: string;
        telecommuting?: boolean;
        published_on?: string;
      }[];
    };
    return (j.jobs ?? []).map((p) =>
      grade(
        city,
        p.shortcode,
        p.title,
        [p.city, p.state, p.country].filter(Boolean).join(', '),
        p.shortlink ?? p.url ?? `https://apply.workable.com/${token}`,
        {
          description: p.description ? decodeHtml(p.description) : undefined,
          department: p.department,
          employmentType: p.employment_type,
          workplaceType: p.telecommuting ? 'Remote' : undefined,
          publishedAt: p.published_on,
        },
      ),
    );
  },

  async bamboohr(city, token) {
    const j = (await getJson(`https://${token}.bamboohr.com/careers/list`)) as {
      result?: {
        jobOpeningName: string;
        location?: { city?: string; state?: string; country?: string };
        id: string | number;
        departmentLabel?: string;
        employmentStatusLabel?: string;
        isRemote?: boolean;
      }[];
    };
    const out: Posting[] = [];
    for (const p of j.result ?? []) {
      const loc = [p.location?.city, p.location?.state, p.location?.country].filter(Boolean).join(', ');
      const detail = localityMatch(city, loc) === 'away'
        ? null
        : await getJson(`https://${token}.bamboohr.com/careers/${p.id}/detail`).catch(() => null) as {
            result?: { jobOpening?: { description?: string; jobOpeningShareUrl?: string } };
          } | null;
      const opening = detail?.result?.jobOpening;
      out.push(grade(city, p.id, p.jobOpeningName, loc, opening?.jobOpeningShareUrl ?? `https://${token}.bamboohr.com/careers/${p.id}`, {
        description: opening?.description ? decodeHtml(opening.description) : undefined,
        department: p.departmentLabel,
        employmentType: p.employmentStatusLabel,
        workplaceType: p.isRemote ? 'Remote' : undefined,
      }));
    }
    return out;
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
    )) as { jobs?: { title: string; link?: string; category?: string; type?: string }[] };
    return (j.jobs ?? []).map((p) => ({
      externalId: fallbackId(p.link ?? '', p.title),
      title: p.title,
      location: 'Montréal, QC',
      locality: 'here' as const,
      url: p.link ?? 'https://montreal.ubisoft.com/en/your-career/jobs/',
      department: p.category,
      employmentType: p.type,
    }));
  },
};

/** Fetch and tally a company's board. Throws if the provider errors — callers
 *  decide whether a stale count or no count is the better fallback. */
export async function fetchRoleCounts(
  city: CityConfig,
  ref: AtsRef,
): Promise<RoleCounts & { postings: Posting[] }> {
  const postings = await FETCHERS[ref.provider](city, ref.token);
  return {
    montreal: postings.filter((p) => p.locality === 'here').length,
    ambiguous: postings.filter((p) => p.locality === 'maybe').length,
    total: postings.length,
    postings,
  };
}
