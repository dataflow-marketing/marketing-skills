// The periods a step is counted in: weeks from a Monday, fortnights from a Monday or calendar months.
// Each is a start day and the day after it ends.

import { addDays, mondayOf } from "../../dates.ts";
import type { Every } from "./outside-steps.ts";

export type Period = { start: string; end: string };

export function periodsFrom(every: Every, from: string, through: string): Period[] {
  const periods: Period[] = [];
  let start = firstStart(every, from);
  while (start <= through) {
    const end = nextStart(every, start);
    periods.push({ start, end });
    start = end;
  }
  return periods;
}

function firstStart(every: Every, from: string): string {
  return every === "month" ? `${from.slice(0, 7)}-01` : mondayOf(from);
}

function nextStart(every: Every, start: string): string {
  if (every === "week") {
    return addDays(start, 7);
  }
  if (every === "2 weeks") {
    return addDays(start, 14);
  }
  const year = Number(start.slice(0, 4));
  const month = Number(start.slice(5, 7));
  return month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;
}
