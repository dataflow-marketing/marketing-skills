// Which part of the ledger a change line belongs in: done (what happened), graph (how it works) or plan (what will
// be done), tried in that order with the ledger's own reader. A line no part reads is not a ledger line.

import type { PartName } from "@dataflow-marketing/ledger/read";
import { readLedger } from "@dataflow-marketing/ledger/read";

export type Placed = { ok: true; part: PartName; line: string } | { ok: false; problem: string };

const PARTS: PartName[] = ["done", "graph", "plan"];

export function placeLine(line: string): Placed {
  for (const part of PARTS) {
    const read = readLedger(`spec 1\n=== ${part} ===\n${line}\n`);
    if (read.unreadable.length === 0) {
      return { ok: true, part, line };
    }
  }
  return { ok: false, problem: `Not a ledger line: ${line}` };
}
