// Cycles: a cycle is a period of time, weekly by default.
// Cycle 1 starts on the plan's start date; every date falls in one cycle, which has a number and the dates it covers.
// Weeks run Monday to Sunday; months, quarters and years start on the 1st.

export type Frequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
export const frequencies: Frequency[] = ["daily", "weekly", "monthly", "quarterly", "yearly"];
const unit: Record<Frequency, string> = { daily: "day", weekly: "week", monthly: "month", quarterly: "quarter", yearly: "year" };
export const cycleWord = (f: Frequency) => unit[f];

const day = 86400000;

// a real date written YYYY-MM-DD: 2027-02-05 yes, 2027-92-05 or 2027-02-30 no
export function isDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}
export function checkDate(s: string, what: string): string {
  if (!isDate(s)) throw new Error(`${what}: "${s}" is not a real date; write it as 2027-02-05`);
  return s;
}
const toDate = (s: string) => new Date(`${s}T00:00:00Z`);
const toText = (d: Date) => d.toISOString().slice(0, 10);

// the first day of the cycle a date falls in
export function cycleStart(date: string, f: Frequency): string {
  const d = toDate(date);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  switch (f) {
    case "daily":
      return date;
    case "weekly":
      return toText(new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * day));
    case "monthly":
      return toText(new Date(Date.UTC(y, m, 1)));
    case "quarterly":
      return toText(new Date(Date.UTC(y, m - (m % 3), 1)));
    case "yearly":
      return toText(new Date(Date.UTC(y, 0, 1)));
  }
}

// the first day of the next cycle
export function nextCycle(start: string, f: Frequency): string {
  const d = toDate(start);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  switch (f) {
    case "daily":
      return toText(new Date(d.getTime() + day));
    case "weekly":
      return toText(new Date(d.getTime() + 7 * day));
    case "monthly":
      return toText(new Date(Date.UTC(y, m + 1, 1)));
    case "quarterly":
      return toText(new Date(Date.UTC(y, m + 3, 1)));
    case "yearly":
      return toText(new Date(Date.UTC(y + 1, 0, 1)));
  }
}

// the last day of a cycle
export const cycleEnd = (start: string, f: Frequency) => toText(new Date(toDate(nextCycle(start, f)).getTime() - day));

// the start of every cycle from one date to another, both included
export function cyclesBetween(from: string, to: string, f: Frequency): string[] {
  const out: string[] = [];
  for (let s = cycleStart(from, f); s <= to; s = nextCycle(s, f)) out.push(s);
  return out;
}

// a date's cycle number, counting the cycle the start date falls in as 1 (0 or less is before the start)
export function cycleNumber(date: string, start: string, f: Frequency): number {
  const a = cycleStart(start, f);
  const b = cycleStart(date, f);
  if (b >= a) return cyclesBetween(a, b, f).length;
  return 2 - cyclesBetween(b, a, f).length;
}

// the start of cycle n
export function cycleAt(n: number, start: string, f: Frequency): string {
  let s = cycleStart(start, f);
  for (let i = 1; i < n; i++) s = nextCycle(s, f);
  return s;
}

// a delay written in weeks, as cycles of this frequency: 2 weeks is 14 days, 1 month, 1 quarter (never less than 1)
export function delayInCycles(weeks: number, f: Frequency): number {
  if (weeks <= 0) return 0;
  const days = { daily: 1, weekly: 7, monthly: 30, quarterly: 91, yearly: 365 }[f];
  return Math.max(1, Math.ceil((weeks * 7) / days));
}
