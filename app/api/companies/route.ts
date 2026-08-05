import { and, eq, or, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getCity, isCityId, DEFAULT_CITY_ID } from '@/lib/cities';
import { companies, type CompanyRow } from '@/lib/db/schema';
import type { AICompany, Industry } from '@/lib/types';

// Always read live from the database; the dataset can change without a redeploy.
// force-dynamic alone proved insufficient: the parameterless GET (the map's hot
// path) was still served from a cached copy after a deploy — showing stale
// counts while the DB was already updated. revalidate=0 + fetchCache opt-out,
// plus an explicit no-store on the response, guarantee every request runs fresh.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/** Map a DB row to the public AICompany shape (null → undefined for optionals). */
function toCompany(r: CompanyRow): AICompany {
  return {
    id: r.id,
    name: r.name,
    aka: r.aka ?? undefined,
    industry: r.industry,
    secondaryIndustries: r.secondaryIndustries ?? undefined,
    lat: r.lat,
    lng: r.lng,
    address: r.address ?? undefined,
    neighborhood: r.neighborhood ?? undefined,
    type: r.type,
    oneLiner: r.oneLiner,
    problem: r.problem ?? undefined,
    solution: r.solution ?? undefined,
    aiDomains: r.aiDomains,
    industries: r.industries ?? undefined,
    tags: r.tags ?? undefined,
    founded: r.founded ?? undefined,
    headcount: r.headcount ?? undefined,
    funding: r.funding ?? undefined,
    hiring: r.hiring ?? undefined,
    careersUrl: r.careersUrl ?? undefined,
    notable: r.notable ?? undefined,
    status: r.status ?? undefined,
    website: r.website ?? undefined,
    linkedin: r.linkedin ?? undefined,
    sources: r.sources ?? undefined,
    verifiedAt: r.verifiedAt ?? undefined,
    // Live board counts. Left undefined when we have no data at all, which the
    // UI must distinguish from a genuine zero ("no open roles here").
    openRolesMontreal: r.openRolesMontreal ?? undefined,
    openRolesTotal: r.openRolesTotal ?? undefined,
    rolesFetchedAt: r.rolesFetchedAt ?? undefined,
  };
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;

  // Which city's map is asking. One deployment serves every city, so this
  // filter is load-bearing: without it every map would receive every city's
  // companies. Unknown ids fall back to the default rather than 400ing, so a
  // hand-typed URL still renders a real map.
  const cityParam = params.get('city');
  const cityId = isCityId(cityParam) ? cityParam : DEFAULT_CITY_ID;
  const city = getCity(cityId);

  // Optional `?industry=` filter, validated against *this city's* industries —
  // the list is per-city, so a hardcoded one silently ignored Victoria's.
  const industryParam = params.get('industry');
  const industry: Industry | null =
    industryParam && (city.industries as string[]).includes(industryParam)
      ? (industryParam as Industry)
      : null;

  // Fail soft: a DB outage returns a clean 503 JSON body, and the client
  // falls back to the bundled dataset — the map never goes blank.
  try {
    // A company matches ?industry= via its primary industry OR by carrying it
    // in secondaryIndustries — e.g. an AI-native drug-discovery startup shows
    // up under both ?industry=ai and ?industry=lifesci.
    const rows = industry
      ? await db
          .select()
          .from(companies)
          .where(
            and(
              eq(companies.city, cityId),
              or(
                eq(companies.industry, industry),
                sql`${industry} = ANY(${companies.secondaryIndustries})`,
              ),
            ),
          )
      : await db.select().from(companies).where(eq(companies.city, cityId));

    return NextResponse.json(
      { companies: rows.map(toCompany) },
      { headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' } },
    );
  } catch (err) {
    console.error('[api/companies] database query failed:', err);
    return NextResponse.json(
      { companies: [], error: 'database unavailable' },
      { status: 503 },
    );
  }
}
