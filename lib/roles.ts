// ── Presenting live open-role counts ─────────────────────────────────────────
// One place to decide what the numbers from lib/ats.ts are allowed to claim,
// so every surface says the same thing. The distinction that matters:
//
//   no data   — we don't fetch this company's board. Say nothing about roles.
//   zero      — we fetched, and there is genuinely nothing open here today.
//   n > 0     — n postings whose location actually names Montreal or Québec.
//
// Conflating the first two is the failure this whole feature exists to fix.
import type { AICompany } from './types';

export interface RoleSummary {
  /** True when this company has a board we actually poll. */
  live: boolean;
  montreal: number;
  total: number;
  /** Compact badge text for dense surfaces (list rows). */
  badge: string;
  /** Fuller phrasing for the detail sheet. */
  detail: string;
  /** e.g. "checked 3h ago" — the trust signal for a live number. */
  freshness?: string;
}

function ago(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `checked ${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `checked ${hrs}h ago`;
  return `checked ${Math.round(hrs / 24)}d ago`;
}

export function roleSummary(c: AICompany): RoleSummary {
  const montreal = c.openRolesMontreal;
  const total = c.openRolesTotal;

  // `undefined` means no board is polled — never render a count.
  if (montreal === undefined || total === undefined) {
    return { live: false, montreal: 0, total: 0, badge: 'Jobs', detail: 'Careers page' };
  }

  const freshness = c.rolesFetchedAt ? ago(c.rolesFetchedAt) : undefined;
  const elsewhere = Math.max(0, total - montreal);

  if (montreal === 0) {
    return {
      live: true,
      montreal,
      total,
      badge: 'None here',
      detail: elsewhere
        ? `Nothing open in Montréal right now · ${elsewhere} elsewhere`
        : 'Nothing open right now',
      freshness,
    };
  }

  return {
    live: true,
    montreal,
    total,
    badge: `${montreal} open`,
    detail:
      `${montreal} open role${montreal === 1 ? '' : 's'} in Montréal` +
      (elsewhere ? ` · ${elsewhere} elsewhere` : ''),
    freshness,
  };
}

/** Total live Montreal roles across a set — for the dashboard headline. */
export function totalMontrealRoles(companies: AICompany[]): { roles: number; boards: number } {
  const live = companies.filter((c) => c.openRolesMontreal !== undefined);
  return {
    roles: live.reduce((n, c) => n + (c.openRolesMontreal ?? 0), 0),
    boards: live.length,
  };
}
