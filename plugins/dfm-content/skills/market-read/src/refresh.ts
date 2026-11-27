// Writes the parts code owns again: the ticks in done and the summary. A person's lines are kept as written.

import { readDone, isTick } from "./done-lines.ts";
import { joinParts, splitParts } from "./ledger-parts.ts";
import { readPlan } from "./plan-steps.ts";
import { summaryLines } from "./summary.ts";
import { ticksFor } from "./ticks.ts";

const SAID = / said on site on /;

export function refresh(ledgerText: string): string {
  const parts = splitParts(ledgerText);
  const plan = readPlan(parts.plan);
  const kept = parts.done.filter((line) => !isTick(line));
  const seen = readDone(kept);

  const done: string[] = [];
  for (const line of kept) {
    done.push(line);
    if (SAID.test(line)) {
      const said = seen.said.find((each) => line.startsWith(`${each.monday} said on site on ${each.day}: "${each.title}" ${each.url} `));
      if (said) {
        done.push(...ticksFor(said, plan.steps));
      }
    }
  }

  return joinParts({ ...parts, done, summary: summaryLines(parts.graph, plan, readDone(done)) });
}
