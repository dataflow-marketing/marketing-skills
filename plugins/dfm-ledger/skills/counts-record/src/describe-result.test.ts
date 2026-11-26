import { describe, expect, it } from "vitest";
import { describeResult } from "./describe-result.ts";

describe("describeResult", () => {
  it("shows the lines a preview would add and writes nothing", () => {
    const text = describeResult("preview", "ledger.txt", ["2026-11-30 fact count visits: 560"]).text;
    expect(text).toBe("preview: nothing written\nledger: ledger.txt\n\n2026-11-30 fact count visits: 560");
  });

  it("says the summary is out of date after a write", () => {
    expect(describeResult("written", "ledger.txt", []).text).toContain("run dfm-ledger:summary-make next");
  });

  it("names the lines a read back did not find", () => {
    const text = describeResult("read back", "ledger.txt", [], ["2026-11-30 fact count visits: 560"]).text;
    expect(text).toContain("read back: 1 line is not there");
  });
});
