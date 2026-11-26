// The goal (a want) and, for a weekly goal with a date, its straight line forecast (an expectation).

import { mondayOf } from "../../dates.ts";
import { straightLineForecast } from "../../forecast.ts";
import type { Done, Want } from "../../read/index.ts";
import { written } from "../../numbers.ts";
import { wholeWeeks } from "../weeks.ts";

const SURE_AFTER = 8; // weeks counted before the line is more than rough

export function goalLines(want: Want | undefined): string[] {
  if (!want) {
    return [];
  }
  return [`goal: ${goalText(want)} (want)`];
}

export function forecastLines(want: Want | undefined, done: Done, today: string): string[] {
  if (!want?.per || want.per.every !== "week" || !want.by) {
    return [];
  }
  const goal = want.per.n;
  const counted = wholeWeeks(done).filter((week) => done.weeks[week].counts?.[want.fact] !== undefined);
  if (counted.length < 2) {
    return [`forecast: not yet: ${counted.length} counted ${counted.length === 1 ? "week" : "weeks"} of ${want.fact}, 2 are needed (modelled, expect)`];
  }

  const counts = counted.map((week) => done.weeks[week].counts![want.fact]);
  const forecast = straightLineForecast({ goal, by: want.by, weeks: counted, counts, from: mondayOf(today) });
  const sure = counted.length < SURE_AFTER ? `rough, ${counted.length} counted weeks` : `from ${counted.length} counted weeks`;
  const likely = forecast.likely ? `likely the week of ${forecast.likely}` : "not likely on a straight line";
  const lines = [`forecast: ${goal} a week by ${want.by}: ${likely}; ${sure} (modelled, expect)`];
  if (forecast.rise > 0) {
    lines.push(`forecast: now ${written(forecast.now)} a week; to reach ${goal} by ${want.by} it has to rise about ${written(forecast.rise)} a week (modelled, expect)`);
  } else {
    lines.push(`forecast: now ${written(forecast.now)} a week: at the goal already (modelled, expect)`);
  }
  return lines;
}

function goalText(want: Want): string {
  if (want.per) {
    return `${want.fact} ${want.per.n} a ${want.per.every}${want.by ? ` by ${want.by}` : ""}`;
  }
  if (want.n !== undefined) {
    return `${want.fact} ${want.n}${want.by ? ` by ${want.by}` : ""}`;
  }
  return `more ${want.fact}`;
}
