// Says what counts-record did or would do: text for a person and the same as data for --json.

import type { ScriptResult } from "@dataflow-marketing/core";

export type Outcome = "preview" | "written" | "read back";

const HEADINGS: Record<Outcome, string> = {
  preview: "preview: nothing written",
  written: "written",
  "read back": "read back: every line is there",
};

export function describeResult(outcome: Outcome, ledgerPath: string, added: string[], missing: string[] = []): ScriptResult {
  const lines = [HEADINGS[outcome], `ledger: ${ledgerPath}`, "", ...added];
  if (missing.length > 0) {
    lines[0] = `read back: ${missing.length} ${missing.length === 1 ? "line is" : "lines are"} not there`;
    lines.push("", "not there:", ...missing);
  }
  if (outcome !== "preview") {
    lines.push("", "the summary is now out of date: run dfm-ledger:summary-make next");
  }
  return { text: lines.join("\n"), data: { outcome, ledger: ledgerPath, added, missing } };
}
