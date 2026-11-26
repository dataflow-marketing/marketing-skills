// A change to one part of a ledger's text: each line starting with one of the given beginnings is taken out, then
// the new lines go at the end of that part (before the next part). Every other line is kept exactly as it was.
// A ledger without the part gets it, in its place in the order graph, plan, done, summary.

import type { PartName } from "../read/ledger-shape.ts";

export type PartChange = { remove: string[]; add: string[] };

const ORDER: PartName[] = ["graph", "plan", "done", "summary"];
const ANY_HEADING = /^=== (graph|plan|done|summary) ===$/;

export function putInPart(ledgerText: string, part: PartName, change: PartChange): string {
  const lines = ledgerText.replace(/\s+$/, "").split("\n");
  const start = headingAt(lines, part);
  const after = lines.findIndex((line, index) => index > start && ANY_HEADING.test(line.trim()));
  const end = after < 0 ? lines.length : after;

  const kept = lines.slice(start + 1, end).filter((line) => !change.remove.some((beginning) => line.startsWith(beginning)));
  while (kept.length > 0 && kept[kept.length - 1].trim() === "") {
    kept.pop();
  }
  const body = [...kept, ...change.add, ...(after < 0 ? [] : [""])];
  return `${[...lines.slice(0, start + 1), ...body, ...lines.slice(end)].join("\n")}\n`;
}

// where the part's heading is, putting one in its place when the ledger has none
function headingAt(lines: string[], part: PartName): number {
  const heading = `=== ${part} ===`;
  const at = lines.findIndex((line) => line.trim() === heading);
  if (at >= 0) {
    return at;
  }
  const later = ORDER.slice(ORDER.indexOf(part) + 1).map((name) => `=== ${name} ===`);
  const before = lines.findIndex((line) => later.includes(line.trim()));
  const place = before < 0 ? lines.length : before;
  lines.splice(place, 0, heading);
  return place;
}
