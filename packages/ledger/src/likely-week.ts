// The week the goal is likely reached: where a straight line through the counted weeks gets to the goal.
// Already at the goal or the line already past it: this week.
// No week (undefined): fewer than 2 counted weeks, a line that is not rising or more than five years away.

import { addDays, daysBetween, mondayOf } from "./dates.ts";
import { straightLine } from "./straight-line.ts";

const FIVE_YEARS = 5 * 52; // in weeks

export type LikelyWeekInput = {
  weeks: string[];
  counts: number[];
  goal: number;
  now: number;
  from: string;
};

export function likelyWeek({ weeks, counts, goal, now, from }: LikelyWeekInput): string | undefined {
  if (now >= goal) {
    return from;
  }
  return whenTheLineGetsThere(weeks, counts, goal, from);
}

function whenTheLineGetsThere(weeks: string[], counts: number[], goal: number, from: string): string | undefined {
  if (counts.length < 2) {
    return undefined;
  }

  const xs = weeks.map((week) => daysBetween(weeks[0], week) / 7);
  const line = straightLine(xs, counts);
  if (line.slope <= 0) {
    return undefined;
  }

  const weeksAfterFirst = (goal - line.at(0)) / line.slope;
  const date = mondayOf(addDays(weeks[0], Math.ceil(weeksAfterFirst) * 7));
  if (date < from) {
    return from;
  }

  const weeksAway = daysBetween(from, date) / 7;
  if (weeksAway > FIVE_YEARS) {
    return undefined;
  }
  return date;
}
