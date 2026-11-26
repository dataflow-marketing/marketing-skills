import { readLedger } from "@dataflow-marketing/ledger/read";
import { describe, expect, it } from "vitest";
import { stepLines } from "./step-lines.ts";

describe("stepLines", () => {
  it("names this week's steps done and not done yet", () => {
    const read = readLedger(
      "spec 1\n=== plan ===\nstart 2026-11-16\nevery week new post\n2026-12-03 market stall\n=== done ===\n2026-11-30 new post: done\n",
    );
    expect(stepLines(read.plan, read.done!, "2026-12-02")).toEqual([
      "this week's steps, 2026-11-30 to 2026-12-06: done: new post; not done yet: market stall (calculated, happened)",
    ]);
  });
});
