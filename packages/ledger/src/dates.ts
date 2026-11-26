// Dates written YYYY-MM-DD, worked out in UTC.
// Each function takes dates as text and gives back a number of days or a date as text.

const DAY_MS = 86_400_000;

// the days from date a to date b (negative when b is earlier)
export function daysBetween(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return ms / DAY_MS;
}

// the date n days after d
export function addDays(d: string, n: number): string {
  const ms = Date.parse(`${d}T00:00:00Z`) + n * DAY_MS;
  return new Date(ms).toISOString().slice(0, 10);
}

// the Monday of the week d falls in (weeks run Monday to Sunday)
export function mondayOf(d: string): string {
  const day = new Date(`${d}T00:00:00Z`).getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  return addDays(d, -daysSinceMonday);
}
