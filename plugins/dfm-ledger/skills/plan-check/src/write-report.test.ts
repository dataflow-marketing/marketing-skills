import { describe, expect, it } from "vitest";
import { writeReport } from "./write-report.ts";

describe("writeReport", () => {
  it("says passed when nothing is found", () => {
    const report = writeReport({ ledger: "ledger.txt" }, { problems: [], setAside: [], ledgerChecked: true });
    expect(report.text).toBe("spec 1\nchecked: ledger.txt\nresult: passed");
  });

  it("names each problem with its lines and each line set aside", () => {
    const report = writeReport(
      { ledger: "ledger.txt" },
      {
        problems: [{ kind: "step with no link", about: "market stall", lines: [10, 14] }],
        setAside: [{ word: "channel", line: 7 }],
        ledgerChecked: true,
      },
    );
    expect(report.text).toContain("result: 1 problem");
    expect(report.text).toContain("step with no link: market stall (lines 10 and 14)");
    expect(report.text).toContain("not read yet: channel (line 7)");
  });
});
