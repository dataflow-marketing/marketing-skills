import { describe, expect, it } from "vitest";
import { readArgs } from "./read-args.ts";

describe("readArgs", () => {
  it("reads the three files and takes the usual rules", () => {
    expect(readArgs(["--ledger", "l.txt", "--history", "h.txt", "--settings", "s.txt", "--go"])).toEqual({
      ok: true,
      args: { ledger: "l.txt", history: "h.txt", settings: "s.txt", rules: { keepWeeks: 26, limit: 65535, atPercent: 75 } },
    });
  });

  it("reads other rules and a day", () => {
    const result = readArgs(["--ledger", "l", "--history", "h", "--settings", "s", "--keep", "13", "--limit", "1000", "--at", "50", "--today", "2026-11-27"]);
    expect(result.ok && result.args.rules).toEqual({ keepWeeks: 13, limit: 1000, atPercent: 50 });
    expect(result.ok && result.args.today).toBe("2026-11-27");
  });

  it("refuses a missing history and a rule that is not a whole number", () => {
    expect(readArgs(["--ledger", "l", "--settings", "s"]).ok).toBe(false);
    expect(readArgs(["--ledger", "l", "--history", "h", "--settings", "s", "--keep", "half"])).toEqual({ ok: false, problem: "--keep takes a whole number: half" });
  });
});
