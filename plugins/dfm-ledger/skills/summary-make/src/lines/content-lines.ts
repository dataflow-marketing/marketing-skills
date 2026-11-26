// Who this week's content was for, from the said lines of the week counted so far (or the latest week said).

import type { Done } from "@dataflow-marketing/ledger/read";
import { weekSoFar } from "../weeks.ts";

export function contentLines(done: Done): string[] {
  const week = weekSoFar(done) ?? Object.keys(done.weeks).sort().reverse().find((each) => done.weeks[each].said?.length);
  const said = week ? (done.weeks[week].said ?? []) : [];
  const groups: string[] = [];
  for (const line of said) {
    for (const group of line.for) {
      if (!groups.includes(group)) {
        groups.push(group);
      }
    }
  }
  if (groups.length === 0) {
    return [];
  }
  return [`this week's content was for: ${groups.join(", ")} (calculated)`];
}
