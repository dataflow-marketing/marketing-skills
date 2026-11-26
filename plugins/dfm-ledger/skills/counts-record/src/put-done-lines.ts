// The ledger's text with a change made to its done part: each line starting with one of the given beginnings is
// taken out, then the new lines go at the end of the done part (before the summary). Every other line is kept.
// A ledger with no done part gets one.

import type { DoneChange } from "./record-plan.ts";

const DONE_HEADING = "=== done ===";
const ANY_HEADING = /^=== (graph|plan|done|summary) ===$/;

export function putDoneLines(ledgerText: string, change: DoneChange): string {
  const lines = ledgerText.replace(/\s+$/, "").split("\n");
  let start = lines.findIndex((line) => line.trim() === DONE_HEADING);
  if (start < 0) {
    const summary = lines.findIndex((line) => line.trim() === "=== summary ===");
    start = summary < 0 ? lines.length : summary;
    lines.splice(start, 0, DONE_HEADING);
  }
  const after = lines.findIndex((line, index) => index > start && ANY_HEADING.test(line.trim()));
  const end = after < 0 ? lines.length : after;

  const kept = lines.slice(start + 1, end).filter((line) => !change.remove.some((beginning) => line.startsWith(beginning)));
  while (kept.length > 0 && kept[kept.length - 1].trim() === "") {
    kept.pop();
  }
  const done = [...kept, ...change.add, ...(after < 0 ? [] : [""])];
  return `${[...lines.slice(0, start + 1), ...done, ...lines.slice(end)].join("\n")}\n`;
}
