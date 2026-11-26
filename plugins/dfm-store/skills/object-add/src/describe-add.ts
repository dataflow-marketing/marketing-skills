// What object-add prints at each step: the preview, the result, a read back that differs; and the refusals.

import type { ScriptResult } from "@dataflow-marketing/core";
import { NO_VERSION, lineChanges } from "@dataflow-marketing/store";

export type Shown = { object: string; business: string; where: string };

export function describePreview(shown: Shown, proposed: string): ScriptResult {
  const changes = lineChanges("", proposed);
  const lines = [
    `${shown.object} of ${shown.business}`,
    `where: ${shown.where}`,
    "version: none (empty)",
    `would put in ${changes.in} lines:`,
    "",
    ...changes.lines,
    "",
    "Nothing is written yet. To add it, run the same command with:",
    `--go --version ${NO_VERSION}`,
  ];
  return { text: lines.join("\n"), data: { ...shown, version: "none", changes: changes.lines, in: changes.in } };
}

export function describeAdded(shown: Shown, version: string): ScriptResult {
  const lines = [`${shown.object} of ${shown.business} added and read back.`, `where: ${shown.where}`, `version: ${version}`];
  return { text: lines.join("\n"), data: { ...shown, version } };
}

// Read back found the object is not what the file holds
export function describeDiffers(shown: Shown, now: string, expected: string, version: string): ScriptResult {
  const changes = lineChanges(now, expected);
  const lines = [`${shown.object} of ${shown.business} is not what the file holds.`, `where: ${shown.where}`, `version: ${version}`, "", ...changes.lines];
  return { text: lines.join("\n"), data: { ...shown, version, differs: true, changes: changes.lines } };
}

export function describeReadBackSame(shown: Shown, version: string): ScriptResult {
  const text = `${shown.object} of ${shown.business} is what the file holds.\nwhere: ${shown.where}\nversion: ${version}`;
  return { text, data: { ...shown, version, same: true } };
}

export function describeAlreadyThere(shown: Shown, version: string, lines: number): string {
  return [
    `The ${shown.object} of ${shown.business} is already there (${lines} lines, version ${version}). Nothing was written.`,
    `where: ${shown.where}`,
    "object-add only fills an empty place. To change what is there use dfm-store:object-change.",
  ].join("\n");
}

export function describeNothingToAdd(shown: Shown, from: string): string {
  return `${from} is empty: there is no ${shown.object} to add. Nothing was written.`;
}

export function describeTooLarge(shown: Shown, bytes: number, limit: number): string {
  return `The ${shown.object} is ${bytes} bytes; ${shown.where} holds ${limit} at most. Nothing was written.`;
}
