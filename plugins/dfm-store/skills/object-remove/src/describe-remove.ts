// What object-remove prints at each step: the preview, a moved object, nothing to remove, the result, a read
// back that finds the object still there.

import type { ScriptResult } from "@dataflow-marketing/core";
import { lineChanges } from "@dataflow-marketing/store";

export type Shown = { object: string; business: string; where: string };

export function describePreview(shown: Shown, before: string, version: string): ScriptResult {
  const changes = lineChanges(before, "");
  const lines = [
    `${shown.object} of ${shown.business}`,
    `where: ${shown.where}`,
    `version: ${version}`,
    `would take out all ${changes.out} lines, leaving it empty:`,
    "",
    ...changes.lines,
    "",
    "A copy goes into the backups folder first.",
    "Nothing is removed yet. To remove it, run the same command with:",
    `--go --version ${version}`,
  ];
  return { text: lines.join("\n"), data: { ...shown, version, changes: changes.lines, out: changes.out } };
}

// The object changed after the preview: show it as it is now, remove nothing
export function describeMoved(shown: Shown, now: string, version: string): ScriptResult {
  const lines = [
    `${shown.object} of ${shown.business} changed since it was read. Nothing was removed.`,
    `where: ${shown.where}`,
    `version now: ${version}`,
    "As it is now:",
    "",
    ...now.trimEnd().split(/\r?\n/),
    "",
    "Preview again to remove it as it is now.",
  ];
  return { text: lines.join("\n"), data: { ...shown, moved: true, version, now } };
}

export function describeNothing(shown: Shown): ScriptResult {
  const text = `${shown.object} of ${shown.business}: nothing to remove, it is empty.\nwhere: ${shown.where}\nversion: none`;
  return { text, data: { ...shown, version: "none", nothing: true } };
}

export function describeRemoved(shown: Shown, backup: string): ScriptResult {
  const lines = [
    `${shown.object} of ${shown.business} removed and read back: it is empty.`,
    `where: ${shown.where}`,
    "version: none",
    `backup: ${backup}`,
  ];
  return { text: lines.join("\n"), data: { ...shown, version: "none", backup } };
}

// Read back found something still there
export function describeStillThere(shown: Shown, version: string, lines: number): ScriptResult {
  const text = `${shown.object} of ${shown.business} is still there (${lines} lines).\nwhere: ${shown.where}\nversion: ${version}`;
  return { text, data: { ...shown, version, stillThere: true, lines } };
}
