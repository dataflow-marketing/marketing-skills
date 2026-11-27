// Every line in a market ledger's done part is keyed by a Monday, as in the ledger (spec/market.md, Done).

const DAY_MS = 24 * 60 * 60 * 1000;

export function mondayOf(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  return addDays(day, -daysSinceMonday);
}

export function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  return new Date(date.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}
