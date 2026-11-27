// Writes what weeks-archive found or did, for a person and as data for another script.
//
//   spec 1
//   ledger: ledger.txt (51,200 bytes, 78% of 65,535)
//   preview: nothing written
//   would move 120 done lines from the weeks before 2026-06-01 to history.txt; the ledger would be 30,100 bytes

import type { ScriptResult } from "@dataflow-marketing/core";
import type { ArchivePlan, ArchiveRules } from "./plan-archive.ts";

export type Outcome = "preview" | "written" | "read back";

export function describeResult(outcome: Outcome, ledger: string, history: string, plan: ArchivePlan, rules: ArchiveRules): ScriptResult {
  const bytes = plan.kind === "move" ? plan.bytesBefore : plan.bytes;
  const lines = ["spec 1", `ledger: ${ledger} (${grouped(bytes)} bytes, ${Math.round((bytes * 100) / rules.limit)}% of ${grouped(rules.limit)})`];

  if (plan.kind === "under the threshold") {
    lines.push(`nothing to move: the ledger is under ${rules.atPercent}% of the limit`);
  } else if (plan.kind === "nothing old enough") {
    lines.push(`nothing to move: no done lines before ${plan.keepFrom} (the last ${rules.keepWeeks} weeks are kept)`);
  } else {
    lines.push(outcome === "preview" ? "preview: nothing written" : outcome);
    const verb = outcome === "preview" ? "would move" : "moved";
    lines.push(`${verb} ${plan.moving.length} done lines from the weeks before ${plan.keepFrom} to ${history}; the ledger ${outcome === "preview" ? "would be" : "is"} ${grouped(plan.bytesAfter)} bytes`);
  }

  return {
    text: lines.join("\n"),
    data: { spec: 1, outcome, ledger, history, kind: plan.kind, bytes, limit: rules.limit, moving: plan.kind === "move" ? plan.moving : [] },
  };
}

function grouped(n: number): string {
  return n.toLocaleString("en-AU");
}
