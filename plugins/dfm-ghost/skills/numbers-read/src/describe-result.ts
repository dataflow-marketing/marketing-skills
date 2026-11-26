// Writes what numbers-read read, for a person and as data for another script. It writes nothing anywhere: the
// numbers go to dfm-ledger:counts-record, which previews them and writes them on a yes.
//
//   spec 1
//   read: ledger.txt
//   week of 2026-11-23: so far (to now in Australia/Melbourne)
//
//   new subscribers=2 (ghost coffee-shop new members)
//   opens=40 (ghost coffee-shop email opens)
//   not read: nudge opens (numbers-read reads new members, emails, emails sent, email opens and email clicks)
//
//   nothing written: to record them, dfm-ledger:counts-record --count "new subscribers=2" --count "opens=40"

import type { ScriptResult } from "@dataflow-marketing/core";
import type { WeekRange } from "@dataflow-marketing/ledger/week-range";
import { MEASURES } from "./facts-to-read.ts";
import type { FactToRead } from "./facts-to-read.ts";

export type Counted = FactToRead & { n: number };

export function describeResult(ledger: string, range: WeekRange, timeZone: string, counted: readonly Counted[], notRead: readonly string[]): ScriptResult {
  const countArgs = counted.map((each) => `${each.fact}=${each.n}`);
  const lines = ["spec 1", `read: ${ledger}`, `week of ${range.week}: ${howMuchOfTheWeek(range, timeZone)}`, ""];

  if (counted.length === 0 && notRead.length === 0) {
    lines.push("no fact in the graph comes from Ghost: nothing to read");
  }
  for (const each of counted) {
    lines.push(`${each.fact}=${each.n} (ghost ${each.site} ${each.measure})`);
  }
  if (notRead.length > 0) {
    lines.push(`not read: ${notRead.join(", ")} (numbers-read reads ${MEASURES.join(", ")})`);
  }
  if (counted.length > 0) {
    lines.push("", `nothing written: to record them, dfm-ledger:counts-record ${countArgs.map((each) => `--count "${each}"`).join(" ")}`);
  }

  return {
    text: lines.join("\n"),
    data: { spec: 1, read: ledger, ...range, timeZone, counted, notRead, countArgs },
  };
}

function howMuchOfTheWeek(range: WeekRange, timeZone: string): string {
  if (range.soFar) {
    return `so far (to now in ${timeZone})`;
  }
  return `the whole week (${timeZone})`;
}
