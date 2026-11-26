import { readLedger } from "@dataflow-marketing/ledger/read";
import { describe, expect, it } from "vitest";
import { makeLedger } from "./make-ledger.ts";

describe("makeLedger", () => {
  it("starts the starter plan this week with the followers told today", () => {
    const ledger = makeLedger("2026-12-02", 1200);
    expect(ledger).toContain("start 2026-11-30\n");
    expect(ledger).toContain("started 2026-11-30\n");
    expect(ledger).toContain("2026-12-02 fact total followers: 1,200");
    expect(readLedger(ledger).unreadable).toEqual([]);
  });

  it("writes no followers line when none was told: unknown is not zero", () => {
    expect(makeLedger("2026-12-09")).not.toContain("fact total followers");
    expect(makeLedger("2026-12-09")).toContain("start 2026-12-07\n");
  });
});
