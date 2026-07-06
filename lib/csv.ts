// ── CSV export ───────────────────────────────────────────────────────────
// Turn the currently-filtered company list into a downloadable CSV, entirely
// client-side (Blob + object URL). Works the same against the live DB or the
// bundled offline dataset — it just serializes whatever list it's handed.

import { INDUSTRY_META, typeDef } from './categories';
import type { AICompany, Industry } from './types';

const industryOf = (c: AICompany): Industry => c.industry ?? 'ai';

const COLUMNS: { header: string; value: (c: AICompany) => string | number | undefined }[] = [
  { header: 'Name', value: (c) => c.name },
  { header: 'Industry', value: (c) => INDUSTRY_META[industryOf(c)].label },
  { header: 'Type', value: (c) => typeDef(c.type).label },
  { header: 'Neighborhood', value: (c) => c.neighborhood },
  { header: 'Founded', value: (c) => c.founded },
  { header: 'Headcount', value: (c) => c.headcount },
  { header: 'Funding Raised', value: (c) => c.funding?.totalRaised },
  { header: 'Hiring', value: (c) => (c.hiring ? 'Yes' : 'No') },
  { header: 'Website', value: (c) => c.website },
  { header: 'One-liner', value: (c) => c.oneLiner },
];

/** Escape a single CSV cell: wrap in quotes when it contains a comma, quote or
 *  newline, doubling any embedded quotes. */
function cell(value: string | number | undefined): string {
  if (value === undefined || value === null) return '';
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Build a CSV document (with header row) from a list of companies. */
export function companiesToCsv(companies: AICompany[]): string {
  const header = COLUMNS.map((c) => c.header).join(',');
  const rows = companies.map((co) => COLUMNS.map((col) => cell(col.value(co))).join(','));
  return [header, ...rows].join('\r\n');
}

/** Trigger a browser download of `content` as `filename`. */
export function downloadCsv(filename: string, content: string): void {
  // Prepend a BOM so Excel reads the accents (Côte-des-Neiges, Montréal) as UTF-8.
  const blob = new Blob(['﻿', content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // give the download a tick to start before releasing the object URL
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
