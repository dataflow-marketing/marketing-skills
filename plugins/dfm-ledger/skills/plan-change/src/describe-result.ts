// Says what plan-change did or would do, line by line: text for a person and the same as data for --json.

import type { ScriptResult } from "@dataflow-marketing/core";
import type { ChangeItem } from "./change-plan.ts";

export type Outcome = "preview" | "written" | "read back";

export function describeResult(outcome: Outcome, ledgerPath: string, items: ChangeItem[], missing: string[] = []): ScriptResult {
  const heading = { preview: "preview: nothing written", written: `written to ${ledgerPath}`, "read back": `read back ${ledgerPath}` };
  const lines = [heading[outcome], ""];
  for (const item of items) {
    lines.push(...itemLines(item));
  }
  if (missing.length > 0) {
    lines.push("", `read back: ${missing.length} not there:`, ...missing);
  }
  if (outcome === "written") {
    lines.push("", "next: dfm-ledger:plan-check, then dfm-ledger:summary-make");
  }
  return { text: lines.join("\n"), data: { outcome, ledger: ledgerPath, items, missing } };
}

function itemLines(item: ChangeItem): string[] {
  if (item.kind === "replace") {
    return [`replace in ${item.part}:`, ...item.old.map((line) => `  ${line}`), `with:`, `  ${item.line}`];
  }
  if (item.kind === "already there") {
    return [`already in ${item.part}: ${item.line}`];
  }
  return [`add to ${item.part}: ${item.line}`];
}
