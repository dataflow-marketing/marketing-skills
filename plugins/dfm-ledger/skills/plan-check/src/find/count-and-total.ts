// A count and a total of the same fact in the same week (spec/ledger.md, Done).
// A week is keyed by its Monday. One problem per fact and week, on every line of that fact in that week.

import { mondayOf } from "@dataflow-marketing/ledger/dates";
import type { FactLine, Ledger } from "@dataflow-marketing/ledger/read";
import type { Problem } from "../problem.ts";

type FactWeek = { fact: string; week: string; kinds: Set<FactLine["kind"]>; lines: number[] };

export function countAndTotal(ledger: Ledger): Problem[] {
  const byFactAndWeek = new Map<string, FactWeek>();
  for (const counted of ledger.done?.facts ?? []) {
    const week = mondayOf(counted.date);
    const key = `${counted.fact} in ${week}`;
    const found = byFactAndWeek.get(key) ?? { fact: counted.fact, week, kinds: new Set(), lines: [] };
    found.kinds.add(counted.kind);
    found.lines.push(counted.line);
    byFactAndWeek.set(key, found);
  }

  const problems: Problem[] = [];
  for (const found of byFactAndWeek.values()) {
    if (found.kinds.size > 1) {
      problems.push({ kind: "count and total in one week", about: `${found.fact}, week of ${found.week}`, lines: found.lines });
    }
  }
  return problems;
}
