import { and, eq, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { companies, jobPostings } from '@/lib/db/schema';
import { matchJob } from '@/lib/job-matching';
import {
  buildOutreachDraft,
  type OutreachDraftRequest,
  type OutreachDraftResponse,
} from '@/lib/outreach';
import { syncResumeProfile } from '@/lib/resume-sync';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const ROLES = new Set(['founder', 'executive', 'hiring']);

function validBody(value: unknown): value is OutreachDraftRequest {
  if (!value || typeof value !== 'object') return false;
  const body = value as Record<string, unknown>;
  return typeof body.companyId === 'string'
    && body.companyId.length > 0
    && body.companyId.length <= 120
    && typeof body.personName === 'string'
    && body.personName.length > 0
    && body.personName.length <= 160
    && typeof body.personTitle === 'string'
    && body.personTitle.length > 0
    && body.personTitle.length <= 240
    && typeof body.personRole === 'string'
    && ROLES.has(body.personRole);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!validBody(body)) {
    return NextResponse.json({ error: 'Invalid outreach request' }, { status: 400 });
  }

  try {
    const [[company], jobs, resume] = await Promise.all([
      db.select({
        id: companies.id,
        name: companies.name,
        industry: companies.industry,
        oneLiner: companies.oneLiner,
      }).from(companies).where(eq(companies.id, body.companyId)).limit(1),
      db.select().from(jobPostings).where(and(
        eq(jobPostings.companyId, body.companyId),
        eq(jobPostings.active, true),
        inArray(jobPostings.locality, ['here', 'maybe']),
      )),
      syncResumeProfile(db),
    ]);

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }
    if (!resume.connected) {
      return NextResponse.json(
        { error: 'Connect Google Drive before drafting from your latest resume.' },
        { status: 409 },
      );
    }
    if (resume.state === 'stale') {
      return NextResponse.json(
        { error: 'PAS could not verify the latest resume revision. Check Resume sync and try again.' },
        { status: 503 },
      );
    }

    const best = jobs
      .map((job) => matchJob({
        ...job,
        companyName: company.name,
        companyIndustry: company.industry,
      }, resume.profile))
      .sort((left, right) => right.score - left.score)[0];
    const match = best && best.score >= 42 ? best : undefined;
    const response: OutreachDraftResponse = {
      draft: buildOutreachDraft({
        profile: resume.profile,
        company,
        person: body,
        match,
      }),
      context: {
        resumeTitle: resume.profile.source.title,
        resumeRevision: resume.profile.source.revisionId,
        resumeSyncedAt: resume.profile.source.syncedAt,
        ...(match ? {
          matchedRole: {
            title: match.title,
            score: match.score,
            url: match.url,
          },
        } : {}),
      },
    };

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' },
    });
  } catch (error) {
    console.error('[api/outreach] draft failed:', error);
    return NextResponse.json(
      { error: 'Could not create an outreach draft right now.' },
      { status: 503 },
    );
  }
}
