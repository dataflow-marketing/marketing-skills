// Splits a ledger into its four parts (spec/ledger.md, The shape):
//
//   spec 1
//   === graph ===
//   === plan ===
//   === done ===
//   === summary ===
//
// Each line keeps its number in the ledger. The spec line and blank lines before the first part are read here;
// any other line before the first part belongs to no part and is kept to be named as a problem.

import type { LineProblem, NumberedLine, PartName } from "./ledger-shape.ts";

export type LedgerParts = {
  spec?: number;
  parts: Partial<Record<PartName, NumberedLine[]>>;
  // a line before the first part that is not the spec line; a part written twice
  outside: LineProblem[];
};

const HEADING = /^=== (graph|plan|done|summary) ===$/;
const SPEC_LINE = /^spec (\d+)$/;

export function splitParts(text: string): LedgerParts {
  const split: LedgerParts = { parts: {}, outside: [] };
  let current: PartName | undefined;

  text.split(/\r?\n/).forEach((lineText, index) => {
    const line = index + 1;
    const heading = HEADING.exec(lineText.trim());

    if (heading) {
      current = startPart(split, heading[1] as PartName, line, lineText);
      return;
    }
    if (current) {
      split.parts[current]?.push({ line, text: lineText });
      return;
    }
    readBeforeTheParts(split, line, lineText);
  });

  return split;
}

// a part written a second time is a problem: its lines are kept with the first
function startPart(split: LedgerParts, name: PartName, line: number, text: string): PartName {
  if (split.parts[name]) {
    split.outside.push({ part: name, line, text });
    return name;
  }
  split.parts[name] = [];
  return name;
}

function readBeforeTheParts(split: LedgerParts, line: number, text: string): void {
  const trimmed = text.trim();
  if (trimmed === "") {
    return;
  }
  const spec = SPEC_LINE.exec(trimmed);
  if (spec && split.spec === undefined) {
    split.spec = Number(spec[1]);
    return;
  }
  split.outside.push({ part: "before the parts", line, text });
}
