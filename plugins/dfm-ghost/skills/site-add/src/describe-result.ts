// Says what site-add did or would do: text for a person and the same as data for --json.
// It names the key's variable, never a key: site-add never sees one.

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
  if (plan.kind === "replace") {
    lines.push("preview: nothing written");
    lines.push(...replaceLines(plan, settingsPath, "would "));
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

export function describeReplaced(
  plan: Extract<AddPlan, { kind: "replace" }>,
  settingsPath: string,
  problems: readonly string[],
): ScriptResult {
  const lines = [...replaceLines(plan, settingsPath, ""), ...readBackLines(problems)];
  return {
    text: lines.join("\n"),
    data: { settings: settingsPath, replaced: plan.replaces, lines: plan.lines, wrote: true, problems },
  };
}

// "would replace" in a preview, "replaced" after the write. With no new lines the public line is only taken out:
// the Ghost line was already there beside it.
function replaceLines(plan: Extract<AddPlan, { kind: "replace" }>, settingsPath: string, would: string): string[] {
  if (plan.lines.length === 0) {
    const verb = would ? "would take out of" : "took out of";
    return [`${verb} ${settingsPath}:`, plan.replaces, "(the Ghost line for this site is already there: one line for the site)"];
  }
  const verb = would ? "would replace in" : "replaced in";
  return [
    `${verb} ${settingsPath}:`,
    plan.replaces,
    "with:",
    ...plan.lines,
    "(the public site becomes a Ghost site: dfm can put drafts on it)",
  ];
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
