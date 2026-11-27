// Writes the parts code owns again: the ticks in done and the summary. A person's lines are kept as written.
// The summary is the ledger's own, written by packages/ledger: market-read, summary-make and askai-make agree.

import { readDone, isTick } from "./done-lines.ts";
import { joinParts, splitParts } from "./ledger-parts.ts";
import { readPlan } from "./plan-steps.ts";
import { readLedger } from "@dataflow-marketing/ledger/read";
import { writeSummary } from "@dataflow-marketing/ledger/summary";
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

  // the ledger's own summary writer (packages/ledger), as of the day of the last read: the same lines every tool gives
  const withoutSummary = joinParts({ ...parts, done, summary: [] });
  const lastRead = readDone(done).reads.at(-1)?.day;
  const summary = lastRead ? writeSummary(readLedger(withoutSummary), lastRead) : ["not read yet (calculated)"];
  return joinParts({ ...parts, done, summary });
}
