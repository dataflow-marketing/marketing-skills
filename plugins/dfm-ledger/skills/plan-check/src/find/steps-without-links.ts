// A step in the plan that no link in the graph starts from: doing it leads to nothing counted.
// The steps are every `every week` step and every dated step that is planned or added (a "-" line takes one off).
// One problem per step, on every line it is planned on.

import type { Ledger, Part } from "@dataflow-marketing/ledger/read";
import type { Problem } from "../problem.ts";

type PlannedStep = { name: string; line: number };

export function stepsWithoutLinks(ledger: Ledger): Problem[] {
  if (!ledger.plan) {
    return [];
  }

  const starts = linkStarts(ledger);
  const missing = new Map<string, number[]>();
  for (const step of plannedSteps(ledger)) {
    if (starts.has(step.name)) {
      continue;
    }
    missing.set(step.name, [...(missing.get(step.name) ?? []), step.line]);
  }

  const problems: Problem[] = [];
  for (const [name, lines] of missing) {
    problems.push({ kind: "step with no link", about: name, lines });
  }
  return problems;
}

function linkStarts(ledger: Ledger): Set<string> {
  const starts = new Set<string>();
  for (const link of ledger.graph?.links ?? []) {
    for (const part of link.from) {
      starts.add(part.name);
    }
  }
  return starts;
}

// in the order written: the every week steps, then the dated ones
function plannedSteps(ledger: Ledger): PlannedStep[] {
  const steps: PlannedStep[] = [];
  for (const repeat of ledger.plan?.repeats ?? []) {
    steps.push(...stepsOn(repeat.methods, repeat.line));
  }
  for (const entry of ledger.plan?.entries ?? []) {
    if (entry.op !== "-") {
      steps.push(...stepsOn(entry.methods, entry.line));
    }
  }
  return steps;
}

function stepsOn(methods: Part[], line: number): PlannedStep[] {
  return methods.map((method) => ({ name: method.name, line }));
}
