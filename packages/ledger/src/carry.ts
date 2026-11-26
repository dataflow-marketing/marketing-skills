// The steps in one week, with carry forward (spec/ledger.md, Timing).
//
//   planned     every step dated in the week
//   carried     a step added to an earlier week with "+" and not ticked since shows again,
//               with the week it was planned for, until it is ticked or a "-" line takes it off
//   taken off   a "-" line in the week removes that step from the week
//
// Only "+" lines carry: a weekly step written out by date has its own line next week.
// Each date in a series is its own line: each one carries on its own.

import { carriedInto } from "./carried-into.ts";
import type { Done, Entry } from "./ledger-types.ts";

export type WeekSteps = {
  steps: string[];
  // a carried step and the Monday of the week it was planned for
  carried: Record<string, string>;
};

export function stepsInWeek(entries: Entry[], done: Done, start: string, end: string): WeekSteps {
  const inWeek = entries.filter((entry) => entry.date >= start && entry.date <= end);
  const planned = namesOf(inWeek.filter((entry) => entry.op !== "-"));
  const takenOff = new Set(namesOf(inWeek.filter((entry) => entry.op === "-")));

  const carried = carriedInto(entries, done, start, end);
  for (const name of planned) {
    delete carried[name];
  }

  const shown = new Set([...planned, ...Object.keys(carried)]);
  const steps = [...shown].filter((name) => !takenOff.has(name));
  for (const name of takenOff) {
    delete carried[name];
  }
  return { steps, carried };
}

function namesOf(entries: Entry[]): string[] {
  return entries.flatMap((entry) => entry.methods.map((method) => method.name));
}
