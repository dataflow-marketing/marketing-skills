import { describe, expect, it } from "vitest";
import { readArgs } from "./read-args.ts";

describe("readArgs", () => {
  it("reads the ledger, the settings and a day", () => {
    expect(readArgs(["--ledger", "ledger.txt", "--settings", "settings.txt", "--today", "2026-12-02", "--go"])).toEqual({
      ok: true,
      args: { ledger: "ledger.txt", settings: "settings.txt", today: "2026-12-02" },
    });
  });

  it("needs the ledger and the settings; a day must be written as a date", () => {
    expect(readArgs(["--ledger", "ledger.txt"]).ok).toBe(false);
    expect(readArgs(["--ledger", "ledger.txt", "--settings", "s.txt", "--today", "Tuesday"]).ok).toBe(false);
  });
});
