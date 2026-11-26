// The straight line forecast for a weekly goal (spec/forecast.md).
// Plain arithmetic on the counted weeks, web standard JavaScript only:
// it runs the same in Node, in a Worker and in a browser.
//
//   now      the weekly number today: the average of the counted weeks
//   likely   the week a straight line through the counted weeks reaches the goal
//            (none: fewer than 2 weeks, a line that is not rising or more than five years away)
//   rough    true until 8 weeks are counted: a line through a few weeks moves a lot with one good or bad week
//   rise     how much the weekly number has to go up each week, from now, to reach the goal by its date

import { averageOf } from "./average.ts";
import { daysBetween } from "./dates.ts";
import { likelyWeek } from "./likely-week.ts";

export type StraightLineForecast = {
  now: number;
  likely?: string;
  rough: boolean;
  rise: number;
};

export type ForecastInput = {
  goal: number; // a week
  by: string; // the goal's date
  weeks: string[]; // each counted week's Monday, oldest first
  counts: number[]; // the count for each of those weeks
  from: string; // this week's Monday
};

const SURE_AFTER = 8; // weeks counted before the line is more than rough

export function straightLineForecast({ goal, by, weeks, counts, from }: ForecastInput): StraightLineForecast {
  const now = averageOf(counts);
  const rise = Math.max(0, (goal - now) / weeksLeft(from, by));
  return {
    now,
    likely: likelyWeek({ weeks, counts, goal, now, from }),
    rough: counts.length < SURE_AFTER,
    rise,
  };
}

// whole weeks from this week to the goal's date, at least 1
export function weeksLeft(from: string, by: string): number {
  const weeks = Math.round(daysBetween(from, by) / 7);
  return Math.max(1, weeks);
}
