// Unknown is not zero: the facts the graph declares that were never counted.

import type { Done, Graph } from "../../read/index.ts";

export function notCountedLines(graph: Graph | undefined, done: Done): string[] {
  const counted = new Set(done.facts.map((line) => line.fact.replace(/\s*\[.+\]$/, "")));
  const never = (graph?.facts ?? []).map((fact) => fact.fact).filter((fact) => !counted.has(fact));
  if (never.length === 0) {
    return [];
  }
  return [`not counted: ${never.join(", ")} (unknown is not zero)`];
}
