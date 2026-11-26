// A fact count or fact total whose fact the graph does not declare with a fact line.
// One problem per fact, on every line it is counted on.
// A ledger with no graph part (a business just starting) declares nothing yet: it is not checked.

import type { Ledger } from "@dataflow-marketing/ledger/read";
import type { Problem } from "../problem.ts";
import { factName } from "./fact-name.ts";

export function undeclaredFacts(ledger: Ledger): Problem[] {
  if (!ledger.graph || !ledger.done) {
    return [];
  }

  const declared = new Set(ledger.graph.facts.map((fact) => fact.fact));
  const undeclared = new Map<string, number[]>();
  for (const counted of ledger.done.facts) {
    const fact = factName(counted.fact);
    if (declared.has(fact)) {
      continue;
    }
    undeclared.set(fact, [...(undeclared.get(fact) ?? []), counted.line]);
  }

  const problems: Problem[] = [];
  for (const [fact, lines] of undeclared) {
    problems.push({ kind: "fact not declared", about: fact, lines });
  }
  return problems;
}
