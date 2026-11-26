// Finds the Change: lines in what came back from an AI chat (spec/ask-ai.md): every line that starts `Change:`,
// also inside a list (`- Change:`) or in backticks. Look-alike punctuation pasted in is made plain first.
// Everything else in the response (the why, a finished post) is not a change and is left alone.

import { tidyPasted } from "@dataflow-marketing/ledger/read";

const CHANGE_LINE = /^\s*(?:[-*>]\s*)?`?Change:\s*(.+?)`?\s*$/;

export function findChanges(response: string): string[] {
  const changes: string[] = [];
  for (const line of tidyPasted(response).split("\n")) {
    const match = CHANGE_LINE.exec(line);
    if (match) {
      changes.push(match[1].trim());
    }
  }
  return changes;
}
