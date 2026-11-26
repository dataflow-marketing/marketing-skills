// Which weeks of the done part a summary reads: the whole weeks counted (oldest first) and this week, the one
// counted only so far (it has a counted to line).

import type { Done } from "@dataflow-marketing/ledger/read";

export function wholeWeeks(done: Done): string[] {
  return Object.keys(done.weeks)
    .sort()
    .filter((week) => !done.weeks[week].countedTo && Object.keys(done.weeks[week].counts ?? {}).length > 0);
}

export function weekSoFar(done: Done): string | undefined {
  return Object.keys(done.weeks)
    .sort()
    .find((week) => done.weeks[week].countedTo);
}

// the facts counted in some weeks, in the order first counted
export function factsCounted(done: Done, weeks: string[]): string[] {
  const facts: string[] = [];
  for (const week of weeks) {
    for (const fact of Object.keys(done.weeks[week].counts ?? {})) {
      if (!facts.includes(fact)) {
        facts.push(fact);
      }
    }
  }
  return facts;
}
