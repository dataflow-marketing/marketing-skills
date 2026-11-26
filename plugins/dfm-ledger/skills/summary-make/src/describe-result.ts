// Says what summary-make did or would do: text for a person and the same as data for --json.

import type { ScriptResult } from "@dataflow-marketing/core";

export type Outcome = "preview" | "written" | "current" | "not current";

const HEADINGS: Record<Outcome, string> = {
  preview: "preview: nothing written",
  written: "written",
  current: "read back: the summary is current",
  "not current": "read back: the summary is not what the lines above it say now: run with --go",
};

export function describeResult(outcome: Outcome, ledgerPath: string, summary: string[]): ScriptResult {
  const text = [HEADINGS[outcome], `ledger: ${ledgerPath}`, "", "=== summary ===", ...summary].join("\n");
  return { text, data: { outcome, ledger: ledgerPath, summary } };
}
