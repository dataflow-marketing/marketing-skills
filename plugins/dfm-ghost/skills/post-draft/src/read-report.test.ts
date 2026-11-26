import { describe, expect, it } from "vitest";
import { readReport } from "./read-report.ts";
import { FAILED_REPORT, PASSED_REPORT } from "../../../fixtures/coffee-shop.ts";

describe("readReport", () => {
  it("reads the spec line, what was checked, against what and the result", () => {
    expect(readReport(PASSED_REPORT)).toEqual({
      spec: "spec 1",
      checked: "drafts/iced-coffee.txt",
      against: ["recordings/2026-11-28-sam.txt"],
      result: "passed",
    });
  });

  it("reads a result with problems", () => {
    expect(readReport(FAILED_REPORT).result).toBe("1 problem");
  });

  it("keeps every source it was checked against", () => {
    const report = readReport("spec 1\nchecked: profile.txt\nagainst: site.txt\nagainst: counts.txt\nresult: passed\n");
    expect(report.against).toEqual(["site.txt", "counts.txt"]);
  });

  it("stops at the first blank line: the lines after are for a person", () => {
    const report = readReport("spec 1\nchecked: a.txt\n\nresult: passed\n");
    expect(report.result).toBeUndefined();
  });
});
