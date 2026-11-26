// Writes what visits-read read, for a person and as data for another script. It writes nothing anywhere: the
// numbers go to dfm-ledger:counts-record, which previews them and writes them on a yes.
//
//   spec 1
//   read: ledger.txt
//   week of 2026-11-23: so far (to now in Australia/Melbourne)
//
//   site visits=16 (cloudflare coffee-shop.example visits)
//   pages viewed=16 (cloudflare coffee-shop.example views)
//
//   nothing written: to record them, dfm-ledger:counts-record --count "site visits=16" --count "pages viewed=16"

import type { ScriptResult } from "@dataflow-marketing/core";
import type { FactToRead } from "./facts-to-read.ts";
import type { WeekRange } from "@dataflow-marketing/ledger/week-range";

export type Counted = FactToRead & { n: number; estimated: boolean };

export function describeResult(ledger: string, range: WeekRange, timeZone: string, counted: readonly Counted[]): ScriptResult {
  const countArgs = counted.map((each) => `${each.fact}=${each.n}`);
  const lines = ["spec 1", `read: ${ledger}`, `week of ${range.week}: ${howMuchOfTheWeek(range, timeZone)}`, ""];

  if (counted.length === 0) {
    lines.push("no fact in the graph comes from Cloudflare: nothing to read");
  }
  for (const each of counted) {
    lines.push(`${each.fact}=${each.n} (cloudflare ${each.host} ${each.measure})${each.estimated ? " estimated: Cloudflare sampled it" : ""}`);
  }
  if (counted.length > 0) {
    lines.push("", `nothing written: to record them, dfm-ledger:counts-record ${countArgs.map((each) => `--count "${each}"`).join(" ")}`);
  }

  return {
    text: lines.join("\n"),
    data: { spec: 1, read: ledger, ...range, timeZone, counted, countArgs },
  };
}

function howMuchOfTheWeek(range: WeekRange, timeZone: string): string {
  if (range.soFar) {
    return `so far (to now in ${timeZone})`;
  }
  return `the whole week (${timeZone})`;
}
