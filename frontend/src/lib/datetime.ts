/** Build an ISO timestamp for a calendar date (local) at midday to avoid UTC day-shift issues. */
export function scheduledAtFromDateInput(dateYmd: string): string {
  const [y, m, d] = dateYmd.split('-').map(Number);
  if (!y || !m || !d) return new Date(dateYmd).toISOString();
  return new Date(y, m - 1, d, 12, 0, 0, 0).toISOString();
}
