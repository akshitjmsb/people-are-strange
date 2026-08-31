'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { CityId } from './city-config';
import type { JobMatch, MatchBand } from './job-matching';

const STORAGE_KEY = 'pas:job-pipeline:v1';

export type JobPipelineStage = 'target' | 'applied' | 'interview' | 'offer' | 'archived';

export interface JobPipelineRecord {
  jobId: string;
  companyId: string;
  companyName: string;
  city: CityId;
  title: string;
  location: string;
  url: string;
  score: number;
  band: MatchBand;
  stage: JobPipelineStage;
  addedAt: string;
  updatedAt: string;
}

function validStage(value: unknown): value is JobPipelineStage {
  return value === 'target'
    || value === 'applied'
    || value === 'interview'
    || value === 'offer'
    || value === 'archived';
}

function readPipeline(): Record<string, JobPipelineRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, JobPipelineRecord>;
    return Object.fromEntries(Object.entries(parsed).filter(([, record]) => (
      record
      && typeof record.jobId === 'string'
      && typeof record.companyId === 'string'
      && typeof record.title === 'string'
      && typeof record.url === 'string'
      && validStage(record.stage)
    )));
  } catch {
    return {};
  }
}

function writePipeline(records: Record<string, JobPipelineRecord>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function useJobPipeline() {
  const [recordsById, setRecordsById] = useState<Record<string, JobPipelineRecord>>({});

  useEffect(() => {
    setRecordsById(readPipeline());
    const syncAcrossTabs = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setRecordsById(readPipeline());
    };
    window.addEventListener('storage', syncAcrossTabs);
    return () => window.removeEventListener('storage', syncAcrossTabs);
  }, []);

  const update = useCallback((change: (current: Record<string, JobPipelineRecord>) => Record<string, JobPipelineRecord>) => {
    setRecordsById((current) => {
      const next = change(current);
      writePipeline(next);
      return next;
    });
  }, []);

  const pursue = useCallback((match: JobMatch, city: CityId) => {
    update((current) => {
      const now = new Date().toISOString();
      const existing = current[match.id];
      return {
        ...current,
        [match.id]: {
          jobId: match.id,
          companyId: match.companyId,
          companyName: match.companyName,
          city,
          title: match.title,
          location: match.location,
          url: match.url,
          score: match.score,
          band: match.band,
          stage: existing?.stage ?? 'target',
          addedAt: existing?.addedAt ?? now,
          updatedAt: now,
        },
      };
    });
  }, [update]);

  const setStage = useCallback((jobId: string, stage: JobPipelineStage) => {
    update((current) => {
      const existing = current[jobId];
      if (!existing || existing.stage === stage) return current;
      return {
        ...current,
        [jobId]: { ...existing, stage, updatedAt: new Date().toISOString() },
      };
    });
  }, [update]);

  const records = useMemo(
    () => Object.values(recordsById).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    [recordsById],
  );

  return { records, recordsById, pursue, setStage };
}
