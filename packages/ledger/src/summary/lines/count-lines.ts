// What was counted: each fact's weekly numbers and their average, totals on their day and this week so far.
// All happened, added up from the lines (calculated).

import type { Done } from "../../read/index.ts";
import { written } from "../../numbers.ts";
import { factsCounted, weekSoFar, wholeWeeks } from "../weeks.ts";

// the goal's fact first, then the others in the order first counted
export function weeklyLines(done: Done, goalFact: string | undefined): string[] {
  const weeks = wholeWeeks(done);
  return goalFirst(factsCounted(done, weeks), goalFact).map((fact) => {
    const numbers = weeks.map((week) => done.weeks[week].counts?.[fact]).filter((n): n is number => n !== undefined);
    const average = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    return `${fact} a week: ${numbers.map(written).join(", ")}; average ${written(average)} (calculated, happened)`;
  });
}

// the latest total of each fact
export function totalLines(done: Done): string[] {
  const latest = new Map<string, { n: number; date: string }>();
  for (const line of done.facts) {
    if (line.kind === "total") {
      latest.set(line.fact, { n: line.n, date: line.date });
    }
  }
  return [...latest].map(([fact, total]) => `${fact} total: ${written(total.n)} on ${total.date} (calculated, happened)`);
}

export function soFarLines(done: Done): string[] {
  const week = weekSoFar(done);
  if (!week) {
    return [];
  }
  const counts = Object.entries(done.weeks[week].counts ?? {});
  if (counts.length === 0) {
    return [];
  }
  const said = counts.map(([fact, n]) => `${fact} ${written(n)}`).join(", ");
  return [`this week so far, to ${done.weeks[week].countedTo}: ${said} (calculated, happened)`];
}

function goalFirst(facts: string[], goalFact: string | undefined): string[] {
  if (!goalFact || !facts.includes(goalFact)) {
    return facts;
  }
  return [goalFact, ...facts.filter((fact) => fact !== goalFact)];
}
