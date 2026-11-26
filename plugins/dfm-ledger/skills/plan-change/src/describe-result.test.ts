import { describe, expect, it } from "vitest";
import { describeResult } from "./describe-result.ts";

describe("describeResult", () => {
  it("shows each line added, replaced or already there", () => {
    const text = describeResult("preview", "ledger.txt", [
      { kind: "add", part: "plan", line: "every week new post" },
      { kind: "replace", part: "plan", line: "how new post: New.", old: ["how new post: Old."] },
      { kind: "already there", part: "graph", line: "fact visits: told" },
    ]).text;
    expect(text).toBe(
      [
        "preview: nothing written",
        "",
        "add to plan: every week new post",
        "replace in plan:",
        "  how new post: Old.",
        "with:",
        "  how new post: New.",
        "already in graph: fact visits: told",
      ].join("\n"),
    );
  });

  it("names the next steps after a write", () => {
    expect(describeResult("written", "ledger.txt", []).text).toContain("next: dfm-ledger:plan-check, then dfm-ledger:summary-make");
  });
});
