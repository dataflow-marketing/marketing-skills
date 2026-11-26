// A business's first ledger: the starter plan, starting this week, with the followers they have today when they say.
//
//   start <Monday>       the plan begins this week
//   started <Monday>     the business began this week
//   <today> fact total followers: <n>     only when they told how many they have; otherwise no line: unknown is not zero

import { mondayOf } from "@dataflow-marketing/ledger/dates";
import { written } from "@dataflow-marketing/ledger/numbers";
import { STARTER } from "./starter.ts";

export function makeLedger(today: string, followers?: number): string {
  const week = mondayOf(today);
  const lines = STARTER.split("\n").flatMap((line) => {
    if (line.startsWith("start ")) {
      return [`start ${week}`];
    }
    if (line.startsWith("started ")) {
      return [`started ${week}`];
    }
    if (/^\d{4}-\d{2}-\d{2} fact total followers: /.test(line)) {
      return followers === undefined ? [] : [`${today} fact total followers: ${written(followers)}`];
    }
    return [line];
  });
  return lines.join("\n");
}
