import { and, eq, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { companies, jobPostings } from '@/lib/db/schema';
import { DEFAULT_CITY_ID, isCityId } from '@/lib/cities';
import { matchJob } from '@/lib/job-matching';
import { latestRun } from '@/lib/refresh';
import { syncResumeProfile } from '@/lib/resume-sync';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const cityParam = params.get('city');
  const cityId = isCityId(cityParam) ? cityParam : DEFAULT_CITY_ID;
  const requestedLimit = Number.parseInt(params.get('limit') ?? '60', 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(200, Math.max(1, requestedLimit)) : 60;
  const requestedMinScore = Number.parseInt(params.get('minScore') ?? '42', 10);
  const minScore = Number.isFinite(requestedMinScore)
    ? Math.min(100, Math.max(0, requestedMinScore))
    : 42;

  try {
    const [rows, run, resume] = await Promise.all([
      db
        .select({
          id: jobPostings.id,
          externalId: jobPostings.externalId,
          companyId: jobPostings.companyId,
          city: jobPostings.city,
          provider: jobPostings.provider,
          title: jobPostings.title,
          location: jobPostings.location,
          locality: jobPostings.locality,
          url: jobPostings.url,
          description: jobPostings.description,
          department: jobPostings.department,
          employmentType: jobPostings.employmentType,
          workplaceType: jobPostings.workplaceType,
          publishedAt: jobPostings.publishedAt,
          firstSeenAt: jobPostings.firstSeenAt,
          lastSeenAt: jobPostings.lastSeenAt,
          closedAt: jobPostings.closedAt,
          active: jobPostings.active,
          companyName: companies.name,
          companyIndustry: companies.industry,
        })
        .from(jobPostings)
        .innerJoin(companies, eq(jobPostings.companyId, companies.id))
        .where(and(
          eq(jobPostings.city, cityId),
          eq(jobPostings.active, true),
          inArray(jobPostings.locality, ['here', 'maybe']),
        )),
      latestRun(db, 'roles'),
      syncResumeProfile(db),
    ]);

    const ranked = rows
      .map((row) => matchJob(row, resume.profile))
      .sort((a, b) => b.score - a.score || b.lastSeenAt.localeCompare(a.lastSeenAt));
    const matches = ranked
      .filter((match) => match.score >= minScore)
      .slice(0, limit);

    return NextResponse.json(
      {
        matches,
        totalOpenings: rows.length,
        candidateMatches: ranked.filter((match) => match.score >= minScore).length,
        strongMatches: ranked.filter((match) => match.band === 'strong').length,
        refreshedAt: run?.finishedAt ?? null,
        resumeSync: {
          state: resume.state,
          connected: resume.connected,
          checkedAt: resume.checkedAt,
          syncedAt: resume.syncedAt,
          requiresReconnect: resume.requiresReconnect,
          usingLastKnownGood: resume.usingLastKnownGood,
        },
        profile: {
          name: resume.profile.name,
          headline: resume.profile.headline,
          sourceTitle: resume.profile.source.title,
          sourceUrl: resume.profile.source.url,
          sourceRevision: resume.profile.source.revisionId,
          syncedAt: resume.profile.source.syncedAt,
        },
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' } },
    );
  } catch (error) {
    console.error('[api/jobs] database query failed:', error);
    return NextResponse.json(
      { matches: [], error: 'job matches are temporarily unavailable' },
      { status: 503 },
    );
  }
}
