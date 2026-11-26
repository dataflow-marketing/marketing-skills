// What store-add prints: the plan before a write, the lines after it, a read back.

import type { ScriptResult } from "@dataflow-marketing/core";
import type { AddPlan } from "./plan-add.ts";

export function describePlan(plan: AddPlan, settingsPath: string): ScriptResult {
  if (plan.kind === "refused") {
    return { text: `Refused: ${plan.problem}`, data: plan };
  }
  if (plan.kind === "already there") {
    return { text: `Already in ${settingsPath}:\n${plan.lines.join("\n")}`, data: plan };
  }
  const text = `Would add to ${settingsPath}:\n${plan.lines.join("\n")}\n\nNothing is written yet. To write it, run the same command with --go.`;
  return { text, data: plan };
}

export function describeAdded(lines: string[], settingsPath: string, problems: string[]): ScriptResult {
  const head = problems.length === 0 ? `Added to ${settingsPath} and read back:` : `Added to ${settingsPath}. The read back found:`;
  const text = [head, ...(problems.length === 0 ? lines : problems), "", "Next: dfm-store:store-check proves each binding can be read."].join("\n");
  return { text, data: { lines, settings: settingsPath, problems } };
}

export function describeReadBack(lines: string[], settingsPath: string, problems: string[]): ScriptResult {
  const text = problems.length === 0 ? `${settingsPath} has:\n${lines.join("\n")}` : problems.join("\n");
  return { text, data: { lines, settings: settingsPath, problems } };
}
