// What weeks-archive would move, worked out before anything is written (27 Nov 2026):
//   1. a ledger at or under the threshold (75% of its store's limit by default) moves nothing
//   2. otherwise the done lines of every week before the last 26 (by default) move, whole
//   3. they go to the end of the history's done part; a line already in the history is not added twice
// Pure: takes the two texts and today, gives back both new texts or why nothing moves.

import { addDays, mondayOf } from "@dataflow-marketing/ledger/dates";
import { putInPart } from "@dataflow-marketing/ledger/put-in-part";

export type ArchiveRules = { keepWeeks: number; limit: number; atPercent: number };

export const DEFAULT_RULES: ArchiveRules = { keepWeeks: 26, limit: 65_535, atPercent: 75 };

export type ArchivePlan =
  | { kind: "under the threshold"; bytes: number; threshold: number }
  | { kind: "nothing old enough"; bytes: number; threshold: number; keepFrom: string }
  | { kind: "move"; moving: string[]; keepFrom: string; bytesBefore: number; bytesAfter: number; ledger: string; history: string };

const EMPTY_HISTORY = "spec 1\n=== done ===\n";
const DATED = /^(\d{4}-\d{2}-\d{2}) /;

export function planArchive(ledgerText: string, historyText: string, today: string, rules: ArchiveRules = DEFAULT_RULES): ArchivePlan {
  const bytes = bytesOf(ledgerText);
  const threshold = Math.floor((rules.limit * rules.atPercent) / 100);
  if (bytes <= threshold) {
    return { kind: "under the threshold", bytes, threshold };
  }

  const keepFrom = addDays(mondayOf(today), -7 * (rules.keepWeeks - 1));
  const moving = doneLines(ledgerText).filter((line) => weekOf(line) !== undefined && (weekOf(line) as string) < keepFrom);
  if (moving.length === 0) {
    return { kind: "nothing old enough", bytes, threshold, keepFrom };
  }

  const ledger = putInPart(ledgerText, "done", { remove: moving, add: [] });
  const inHistory = new Set(doneLines(historyText));
  const history = putInPart(historyText.trim() === "" ? EMPTY_HISTORY : historyText, "done", {
    remove: [],
    add: moving.filter((line) => !inHistory.has(line)),
  });
  return { kind: "move", moving, keepFrom, bytesBefore: bytes, bytesAfter: bytesOf(ledger), ledger, history };
}

// the lines of a ledger's done part, each trimmed
export function doneLines(text: string): string[] {
  const lines = text.split("\n").map((line) => line.trim());
  const start = lines.indexOf("=== done ===");
  if (start < 0) {
    return [];
  }
  const after = lines.findIndex((line, index) => index > start && /^=== \w+ ===$/.test(line));
  return lines.slice(start + 1, after < 0 ? lines.length : after).filter((line) => line !== "");
}

// the Monday of the week a done line is written under: its date is that Monday
function weekOf(line: string): string | undefined {
  const date = DATED.exec(line)?.[1];
  return date === undefined ? undefined : mondayOf(date);
}

function bytesOf(text: string): number {
  return new TextEncoder().encode(text).length;
}
