// What the change lines would do to the ledger, worked out before anything is written.
//
//   1. place each line in its part (done, graph or plan); a line no part reads stops the change
//   2. a line already in the ledger is left: nothing to add
//   3. a line that takes another's place (a how, a goal, a fact's source, a link's rate) replaces it;
//      a step's script lines replace its earlier script lines as a set; a step's repeat replaces its earlier repeat
//   4. every other line is added at the end of its part
//
// Pure: takes the ledger's text and the change lines, gives back the change for each part and what it would do.

import type { PartChange } from "@dataflow-marketing/ledger/put-in-part";
import type { PartName } from "@dataflow-marketing/ledger/read";
import { placeLine } from "./place-line.ts";
import { repeatStep, replaces, scriptStep } from "./replaces.ts";

export type ChangeItem =
  | { kind: "add"; part: PartName; line: string }
  | { kind: "replace"; part: PartName; line: string; old: string[] }
  | { kind: "already there"; part: PartName; line: string };

export type PartChanges = Partial<Record<PartName, PartChange>>;

export type ChangePlan =
  | { ok: true; parts: PartChanges; items: ChangeItem[] }
  | { ok: false; problems: string[] };

export function changePlan(ledgerText: string, changes: string[]): ChangePlan {
  if (changes.length === 0) {
    return { ok: false, problems: ["There are no Change: lines in it."] };
  }
  const placed = changes.map(placeLine);
  const problems = placed.flatMap((each) => (each.ok ? [] : [each.problem]));
  if (problems.length > 0) {
    return { ok: false, problems };
  }

  const existing = ledgerText.split("\n").map((line) => line.trim());
  const parts: PartChanges = {};
  const items: ChangeItem[] = [];
  const scriptsSeen = new Set<string>();

  for (const each of placed) {
    if (!each.ok) {
      continue;
    }
    if (existing.includes(each.line)) {
      items.push({ kind: "already there", part: each.part, line: each.line });
      continue;
    }
    const change = (parts[each.part] ??= { remove: [], add: [] });
    const beginnings = [...replaces(each.line), ...newScript(each.line, scriptsSeen), ...earlierRepeats(each.line, existing)];
    const old = existing.filter((line) => beginnings.some((beginning) => line.startsWith(beginning)));
    change.remove.push(...beginnings);
    change.add.push(each.line);
    items.push(old.length > 0 ? { kind: "replace", part: each.part, line: each.line, old } : { kind: "add", part: each.part, line: each.line });
  }
  return { ok: true, parts, items };
}

// a repeat line takes the place of the same step's repeat lines that are there, matched whole
function earlierRepeats(line: string, existing: readonly string[]): string[] {
  const step = repeatStep(line);
  if (step === undefined) {
    return [];
  }
  return existing.filter((each) => repeatStep(each) === step);
}

// the first script line for a step replaces that step's earlier script lines; the rest join it
function newScript(line: string, seen: Set<string>): string[] {
  const step = scriptStep(line);
  if (step === undefined || seen.has(step)) {
    return [];
  }
  seen.add(step);
  return [`script ${step}:`];
}
