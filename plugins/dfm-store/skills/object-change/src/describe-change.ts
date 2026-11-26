// What object-change prints at each step: the preview, a moved object, nothing to change, too large, the result.

import type { ScriptResult } from "@dataflow-marketing/core";
import { lineChanges } from "@dataflow-marketing/store";

export type Shown = { object: string; business: string; where: string };

export function describePreview(shown: Shown, before: string, after: string, version: string): ScriptResult {
  const changes = lineChanges(before, after);
  const lines = [
    `${shown.object} of ${shown.business}`,
    `where: ${shown.where}`,
    `version: ${version}`,
    `would take out ${changes.out} lines and put in ${changes.in}:`,
    "",
    ...changes.lines,
    "",
    "Nothing is written yet. To write it, run the same command with:",
    `--go --version ${version}`,
  ];
  return { text: lines.join("\n"), data: { ...shown, version, changes: changes.lines, out: changes.out, in: changes.in } };
}

// The object changed after it was read: show it as it is now beside the change, write nothing
export function describeMoved(shown: Shown, now: string, after: string, version: string): ScriptResult {
  const changes = lineChanges(now, after);
  const lines = [
    `${shown.object} of ${shown.business} changed since it was read. Nothing was written.`,
    `where: ${shown.where}`,
    `version now: ${version}`,
    "From the object as it is now, the change would take out and put in:",
    "",
    ...changes.lines,
    "",
    "Work the change into the object as it is now, then preview again.",
  ];
  return { text: lines.join("\n"), data: { ...shown, moved: true, version, changes: changes.lines } };
}

// Read back found the object is not what the file holds
export function describeDiffers(shown: Shown, now: string, expected: string, version: string): ScriptResult {
  const changes = lineChanges(now, expected);
  const lines = [`${shown.object} of ${shown.business} is not what the file holds.`, `where: ${shown.where}`, `version: ${version}`, "", ...changes.lines];
  return { text: lines.join("\n"), data: { ...shown, version, differs: true, changes: changes.lines } };
}

export function describeNothing(shown: Shown, version: string): ScriptResult {
  const text = `${shown.object} of ${shown.business}: nothing to change.\nwhere: ${shown.where}\nversion: ${version}`;
  return { text, data: { ...shown, version, nothing: true } };
}

export function describeTooLarge(shown: Shown, bytes: number, limit: number): string {
  return `The ${shown.object} is ${bytes} bytes; ${shown.where} holds ${limit} at most. Nothing was written.`;
}

export function describeWritten(shown: Shown, version: string, backup: string | undefined): ScriptResult {
  const lines = [
    `${shown.object} of ${shown.business} changed and read back.`,
    `where: ${shown.where}`,
    `version: ${version}`,
    `backup: ${backup ?? "none (it was empty)"}`,
  ];
  return { text: lines.join("\n"), data: { ...shown, version, backup: backup ?? null } };
}
