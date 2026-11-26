// Decides what an add may do: an object is added only where the place is empty (the version none).
// Anything there already is object-change's job, never replaced here. Built on the store's decideWrite, which
// already stops when the version is not the one seen (here: none).

import { NO_VERSION, decideWrite } from "@dataflow-marketing/store";
import type { Place } from "@dataflow-marketing/store";

export type AddDecision =
  | { kind: "add" }
  | { kind: "already there"; version: string; lines: number }
  | { kind: "nothing to add" }
  | { kind: "too large"; bytes: number; limit: number };

export type AddCheck = {
  current: { text: string; version: string };
  proposed: string;
  connector: Place["connector"];
};

export function decideAdd(check: AddCheck): AddDecision {
  const decision = decideWrite({ seenVersion: NO_VERSION, ...check });
  if (decision.kind === "moved") {
    return { kind: "already there", version: check.current.version, lines: lineCount(check.current.text) };
  }
  if (decision.kind === "nothing to change") {
    return { kind: "nothing to add" };
  }
  if (decision.kind === "too large") {
    return decision;
  }
  return { kind: "add" };
}

function lineCount(text: string): number {
  const trimmed = text.trimEnd();
  return trimmed === "" ? 0 : trimmed.split("\n").length;
}
