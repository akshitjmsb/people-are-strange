// ── Funding maths ────────────────────────────────────────────────────────
// The dataset stores money as human strings ("$45M", "$1.2B", "$300K"). These
// helpers turn those into numbers we can sum and rank, and back into compact
// labels for the dashboard and list views.

/**
 * Parse a funding string into a raw dollar amount. Handles the shapes that
 * actually appear in the data — "$45M", "$1.2B", "$300K", "US$50M", "~$8M",
 * "$45M+" — plus spelled-out units. Returns 0 when there's no parseable value.
 */
export function parseFundingAmount(raw?: string | null): number {
  if (!raw) return 0;
  const s = raw.replace(/,/g, '');
  const m = s.match(/(\d+(?:\.\d+)?)\s*(k|m|b|thousand|million|billion)?/i);
  if (!m) return 0;
  let n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return 0;
  switch ((m[2] || '').toLowerCase()) {
    case 'k':
    case 'thousand':
      n *= 1e3;
      break;
    case 'm':
    case 'million':
      n *= 1e6;
      break;
    case 'b':
    case 'billion':
      n *= 1e9;
      break;
  }
  return n;
}

/** One-decimal unless the value is a whole number (so "$1.2B" but "$45M"). */
function trim(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** Format a raw dollar amount as a compact label ("$1.2B", "$45M", "$300K"). */
export function formatMoney(n: number): string {
  if (!n || n < 0) return '$0';
  if (n >= 1e9) return `$${trim(n / 1e9)}B`;
  if (n >= 1e6) return `$${trim(n / 1e6)}M`;
  if (n >= 1e3) return `$${trim(n / 1e3)}K`;
  return `$${Math.round(n)}`;
}
