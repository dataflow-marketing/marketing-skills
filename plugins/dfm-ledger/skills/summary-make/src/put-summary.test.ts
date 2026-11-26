import { describe, expect, it } from "vitest";
import { putSummary, summaryIn } from "./put-summary.ts";

describe("putSummary", () => {
  it("adds a summary part at the end", () => {
    expect(putSummary("spec 1\n=== done ===\nstarted 2026-11-16\n", ["goal: more visits (want)"])).toBe(
      "spec 1\n=== done ===\nstarted 2026-11-16\n\n=== summary ===\ngoal: more visits (want)\n",
    );
  });

  it("replaces an old summary and keeps every line above it", () => {
    const ledger = "spec 1\n=== done ===\nstarted 2026-11-16\n\n=== summary ===\nold line\n";
    expect(summaryIn(putSummary(ledger, ["new line"]))).toEqual(["new line"]);
    expect(putSummary(ledger, ["new line"]).startsWith("spec 1\n=== done ===\nstarted 2026-11-16\n\n=== summary ===")).toBe(true);
  });
});
