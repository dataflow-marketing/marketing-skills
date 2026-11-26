import { describe, expect, it } from "vitest";
import { describeResult } from "./describe-result.ts";

describe("describeResult", () => {
  it("says a preview wrote nothing and shows the summary", () => {
    const text = describeResult("preview", "ledger.txt", ["goal: more visits (want)"]).text;
    expect(text).toBe("preview: nothing written\nledger: ledger.txt\n\n=== summary ===\ngoal: more visits (want)");
  });

  it("says when a summary is not current", () => {
    expect(describeResult("not current", "ledger.txt", []).text).toContain("run with --go");
  });
});
