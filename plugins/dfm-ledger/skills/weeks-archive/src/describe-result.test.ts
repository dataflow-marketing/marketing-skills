import { describe, expect, it } from "vitest";
import { describeResult } from "./describe-result.ts";

const RULES = { keepWeeks: 26, limit: 65535, atPercent: 75 };

describe("describeResult", () => {
  it("says the size and that nothing moves under the threshold", () => {
    const result = describeResult("preview", "ledger.txt", "history.txt", { kind: "under the threshold", bytes: 25255, threshold: 49151 }, RULES);
    expect(result.text).toBe("spec 1\nledger: ledger.txt (25,255 bytes, 39% of 65,535)\nnothing to move: the ledger is under 75% of the limit");
  });

  it("says what would move in a preview and what moved after a write", () => {
    const plan = { kind: "move" as const, moving: ["a", "b"], keepFrom: "2026-06-01", bytesBefore: 51200, bytesAfter: 30100, ledger: "", history: "" };
    expect(describeResult("preview", "l.txt", "h.txt", plan, RULES).text).toContain("would move 2 done lines from the weeks before 2026-06-01 to h.txt; the ledger would be 30,100 bytes");
    expect(describeResult("written", "l.txt", "h.txt", plan, RULES).text).toContain("moved 2 done lines");
  });
});
