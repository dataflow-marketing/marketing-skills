// Writes what said-read found, for a person and as data for another script. It writes nothing anywhere: the lines go
// to dfm-ledger:plan-change as Change lines, which previews them and adds them to done on a yes.
//
//   spec 1
//   read: ledger.txt
//   week of 2026-11-23: so far (to now in Australia/Melbourne)
//
//   Change: 2026-11-23 said by email on 2026-11-24: "Title" https://... [everyone] summary: "..."
//
//   nothing written: to add them, save the Change lines in a file and run dfm-ledger:plan-change with it

import type { ScriptResult } from "@dataflow-marketing/core";
import type { WeekRange } from "@dataflow-marketing/ledger/week-range";

export function describeResult(ledger: string, range: WeekRange, timeZone: string, lines: readonly string[], siteCount: number): ScriptResult {
  const out = ["spec 1", `read: ${ledger}`, `week of ${range.week}: ${howMuchOfTheWeek(range, timeZone)}`, ""];

  if (siteCount === 0) {
    out.push("no fact in the graph comes from Ghost: no site to read");
  } else if (lines.length === 0) {
    out.push("nothing was sent or published this week");
  }
  for (const line of lines) {
    out.push(`Change: ${line}`);
  }
  if (lines.length > 0) {
    out.push("", "nothing written: to add them, save the Change lines in a file and run dfm-ledger:plan-change with it");
  }

  return {
    text: out.join("\n"),
    data: { spec: 1, read: ledger, ...range, timeZone, said: lines, changeLines: lines.map((line) => `Change: ${line}`) },
  };
}

function howMuchOfTheWeek(range: WeekRange, timeZone: string): string {
  if (range.soFar) {
    return `so far (to now in ${timeZone})`;
  }
  return `the whole week (${timeZone})`;
}
