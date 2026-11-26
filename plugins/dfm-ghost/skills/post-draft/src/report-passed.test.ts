import { describe, expect, it } from "vitest";
import { readReport } from "./read-report.ts";
import { reportPassed } from "./report-passed.ts";
import { FAILED_REPORT, PASSED_REPORT } from "../../../fixtures/coffee-shop.ts";

const FOR = { wordsPath: "drafts/iced-coffee.txt", from: "recordings/2026-11-28-sam.txt", reportIsNewer: true };

describe("reportPassed", () => {
  it("lets a passing report for this words file and its source through", () => {
    expect(reportPassed(readReport(PASSED_REPORT), FOR)).toEqual([]);
  });

  it("keeps back a report with problems", () => {
    expect(reportPassed(readReport(FAILED_REPORT), FOR)[0]).toMatch(/goes nowhere/);
  });

  it("keeps back a report for another file or another source", () => {
    expect(reportPassed(readReport(PASSED_REPORT), { ...FOR, wordsPath: "drafts/other.txt" }).length).toBe(1);
    expect(reportPassed(readReport(PASSED_REPORT), { ...FOR, from: "recordings/other.txt" }).length).toBe(1);
  });

  it("keeps back a report older than the words file", () => {
    expect(reportPassed(readReport(PASSED_REPORT), { ...FOR, reportIsNewer: false })[0]).toMatch(/changed after the check/);
  });

  it("keeps back something that is not a check report", () => {
    expect(reportPassed(readReport("shopping list\n"), FOR)).toEqual([
      "The report is not a check report: it does not start with spec 1.",
    ]);
  });
});
