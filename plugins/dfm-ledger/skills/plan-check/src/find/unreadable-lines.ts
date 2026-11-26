// Every line the reader could not read: in a part or outside every part.

import type { Ledger } from "@dataflow-marketing/ledger/read";
import type { Problem } from "../problem.ts";

export function unreadableLines(ledger: Ledger): Problem[] {
  const problems: Problem[] = [];
  for (const unread of ledger.unreadable) {
    problems.push({ kind: "unreadable line", about: unread.text, lines: [unread.line] });
  }
  return problems;
}
