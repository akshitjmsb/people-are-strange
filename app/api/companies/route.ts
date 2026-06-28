import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { companies, type CompanyRow } from '@/lib/db/schema';
import type { AICompany } from '@/lib/types';

// Always read live from the database; the dataset can change without a redeploy.
export const dynamic = 'force-dynamic';

/** Map a DB row to the public AICompany shape (null → undefined for optionals). */
function toCompany(r: CompanyRow): AICompany {
  return {
    id: r.id,
    name: r.name,
    aka: r.aka ?? undefined,
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
    notable: r.notable ?? undefined,
    status: r.status ?? undefined,
    website: r.website ?? undefined,
    linkedin: r.linkedin ?? undefined,
    sources: r.sources ?? undefined,
  };
}

export async function GET() {
  const rows = await db.select().from(companies);
  return NextResponse.json({ companies: rows.map(toCompany) });
}
