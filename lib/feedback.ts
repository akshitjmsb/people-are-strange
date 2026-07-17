// ── Community feedback ───────────────────────────────────────────────────
// The people using this map know the Montreal scene — let them feed data back.
// Both flows open a prefilled GitHub issue on the public repo: zero backend,
// and every submission lands somewhere trackable.

import type { AICompany } from './types';

const REPO_URL = 'https://github.com/akshitjmsb/people-are-strange-mtl';

function issueUrl(title: string, body: string): string {
  return `${REPO_URL}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

/** "We're missing a company" — prefilled with the fields the dataset needs. */
export function suggestCompanyUrl(): string {
  const body = [
    '**Company name:**',
    '',
    '**Website:**',
    '',
    '**Industry (ai / aerospace / energy / marine):**',
    '',
    '**What they do (one sentence):**',
    '',
    '**Address or neighbourhood:**',
    '',
    '**Anything else (hiring? funding? notable people?):**',
    '',
  ].join('\n');
  return issueUrl('Suggest a company: ', body);
}

/** "Something here is wrong / stale" — prefilled with the company's identity. */
export function reportCompanyUrl(c: AICompany): string {
  const body = [
    `Company: **${c.name}** (\`${c.id}\`)`,
    '',
    '**What is wrong or out of date?**',
    '',
    '**What should it say instead? (a source link helps a lot)**',
    '',
  ].join('\n');
  return issueUrl(`Data fix: ${c.name}`, body);
}
