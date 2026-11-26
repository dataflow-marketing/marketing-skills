import { describe, expect, it } from "vitest";
import { describeResult } from "./describe-result.ts";

const RANGE = { week: "2026-11-23", from: "2026-11-22T13:00:00.000Z", to: "2026-11-26T22:15:00.000Z", soFar: true };
const OPENS = { fact: "opens", site: "coffee-shop", measure: "email opens" as const, n: 40 };

describe("describeResult", () => {
  it("shows each number with its source and the counts-record line to record them", () => {
    const result = describeResult("ledger.txt", RANGE, "Australia/Melbourne", [OPENS], []);
    expect(result.text).toBe(
      [
        "spec 1",
        "read: ledger.txt",
        "week of 2026-11-23: so far (to now in Australia/Melbourne)",
        "",
        "opens=40 (ghost coffee-shop email opens)",
        "",
        'nothing written: to record them, dfm-ledger:counts-record --count "opens=40"',
      ].join("\n"),
    );
    expect(result.data).toMatchObject({ countArgs: ["opens=40"], notRead: [] });
  });

  it("names the facts it does not read", () => {
    const result = describeResult("ledger.txt", RANGE, "UTC", [], ["nudge opens"]);
    expect(result.text).toContain("not read: nudge opens (numbers-read reads new members, emails, emails sent, email opens, email clicks)");
  });

  it("says when no fact comes from Ghost", () => {
    expect(describeResult("ledger.txt", RANGE, "UTC", [], []).text).toContain("no fact in the graph comes from Ghost: nothing to read");
  });
});
