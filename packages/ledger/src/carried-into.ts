// The "+" steps from earlier weeks that carry into this week.
// A step carries when it has not been ticked from its own week up to this one
// and no "-" line has taken it off since it was added.
// Each step is kept with the Monday of the week it was planned for (the earliest, when added more than once).

import { mondayOf } from "./dates.ts";
import type { Done, Entry } from "./ledger-types.ts";

export function carriedInto(entries: Entry[], done: Done, start: string, end: string): Record<string, string> {
  const carried: Record<string, string> = {};
  const addedEarlier = entries.filter((entry) => entry.op === "+" && entry.date < start);

  for (const entry of addedEarlier) {
    const from = mondayOf(entry.date);
    for (const { name } of entry.methods) {
      const ticked = tickedBetween(done, name, from, start);
      const off = takenOffSince(entries, name, entry.date, end);
      if (ticked || off) {
        continue;
      }
      if (!carried[name] || from < carried[name]) {
        carried[name] = from;
      }
    }
  }
  return carried;
}

// ticked done in any week from its own week up to (not including) this one
function tickedBetween(done: Done, name: string, from: string, start: string): boolean {
  return Object.keys(done.weeks).some((week) => {
    const inRange = week >= from && week < start;
    return inRange && done.weeks[week].answers[name] === "done";
  });
}

// a "-" line for the step after it was added, up to the end of this week
function takenOffSince(entries: Entry[], name: string, added: string, end: string): boolean {
  return entries.some((entry) => {
    const inRange = entry.op === "-" && entry.date > added && entry.date <= end;
    return inRange && entry.methods.some((method) => method.name === name);
  });
}
