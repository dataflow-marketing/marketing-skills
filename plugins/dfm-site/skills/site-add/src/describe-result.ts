// Says what site-add did or would do: text for a person and the same as data for --json.
// A public site has no key: nothing secret is ever shown.

import type { ScriptResult } from "@dataflow-marketing/core";
import type { AddPlan } from "./plan-add.ts";

export function describePlan(plan: AddPlan, settingsPath: string): ScriptResult {
  const lines: string[] = [];

  if (plan.kind === "add") {
    lines.push("preview: nothing written");
    lines.push(`would add to ${settingsPath}:`);
    lines.push(...plan.lines);
    if (plan.newFile) {
      lines.push("(the file is new: it would start with spec 1 and its time zone)");
    }
  }
  if (plan.kind === "already there") {
    lines.push(`already in ${settingsPath}: nothing to add`);
    lines.push(plan.line);
  }
  if (plan.kind === "refused") {
    lines.push(`refused: ${plan.problem}`);
  }

  return { text: lines.join("\n"), data: { settings: settingsPath, plan, wrote: false } };
}

export function describeAdded(added: readonly string[], settingsPath: string, problems: readonly string[]): ScriptResult {
  const lines: string[] = [];
  lines.push(`added to ${settingsPath}:`);
  lines.push(...added);
  lines.push(...readBackLines(problems));
  return { text: lines.join("\n"), data: { settings: settingsPath, lines: added, wrote: true, problems } };
}

export function describeReadBack(line: string, settingsPath: string, problems: readonly string[]): ScriptResult {
  const lines: string[] = [];
  lines.push(`checked ${settingsPath} for:`);
  lines.push(line);
  lines.push(...readBackLines(problems));
  return { text: lines.join("\n"), data: { settings: settingsPath, line, problems } };
}

function readBackLines(problems: readonly string[]): string[] {
  if (problems.length === 0) {
    return ["read back: the site is there"];
  }
  return [`read back: ${problems.length} problems`, ...problems];
}
