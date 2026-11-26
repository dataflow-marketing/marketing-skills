// What object-read prints: where the object is, its version and its text; data for --json.

import type { ScriptResult } from "@dataflow-marketing/core";

export type ReadShown = { object: string; business: string; where: string; version: string; text: string; savedTo?: string };

export function describeRead(read: ReadShown): ScriptResult {
  const lines = [`${read.object} of ${read.business}`, `where: ${read.where}`, `version: ${read.version}`];
  if (read.savedTo) {
    lines.push(`saved to: ${read.savedTo}`);
  } else if (read.text === "") {
    lines.push("(empty)");
  } else {
    lines.push("", read.text.trimEnd());
  }
  return { text: lines.join("\n"), data: read };
}
