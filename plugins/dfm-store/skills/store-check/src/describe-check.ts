// What store-check prints: one line for each binding, the backups folder, then what to do next.

import type { ScriptResult } from "@dataflow-marketing/core";

export type BindingChecked =
  | { object: string; business: string; ok: true; where: string; version: string; lines: number }
  | { object: string; business: string; ok: false; problem: string };

export function describeCheck(checked: BindingChecked[], backups: string): ScriptResult {
  const lines: string[] = [];
  if (checked.length === 0) {
    lines.push("No bindings: every object is a file in the working folder.");
  }
  for (const each of checked) {
    lines.push(lineFor(each));
  }
  lines.push(`backups: ${backups}`);
  const problems = checked.filter((each) => !each.ok).length;
  lines.push(problems === 0 ? "Every binding can be read." : `${problems} of ${checked.length} bindings cannot be read.`);
  return { text: lines.join("\n"), data: { bindings: checked, backups, problems } };
}

function lineFor(each: BindingChecked): string {
  const name = `${each.object} ${each.business}`;
  if (!each.ok) {
    return `problem ${name}: ${each.problem}`;
  }
  const holds = each.lines === 0 ? "empty" : `${each.lines} lines, version ${each.version.slice(0, 12)}`;
  return `ok ${name}: ${each.where} (${holds})`;
}
