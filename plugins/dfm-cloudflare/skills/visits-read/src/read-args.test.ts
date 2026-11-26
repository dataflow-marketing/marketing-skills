import { describe, expect, it } from "vitest";
import { readArgs } from "./read-args.ts";

describe("readArgs", () => {
  it("reads the ledger and the settings", () => {
    expect(readArgs(["--ledger", "ledger.txt", "--settings", "settings.txt"])).toEqual({
      ok: true,
      args: { ledger: "ledger.txt", settings: "settings.txt" },
    });
  });

  it("reads a week and lets --json through", () => {
    expect(readArgs(["--ledger", "l.txt", "--settings", "s.txt", "--week", "2026-11-23", "--json"])).toEqual({
      ok: true,
      args: { ledger: "l.txt", settings: "s.txt", week: "2026-11-23" },
    });
  });

  it("refuses a missing settings file", () => {
    const result = readArgs(["--ledger", "l.txt"]);
    expect(result.ok).toBe(false);
  });

  it("refuses a week that is not a date", () => {
    const result = readArgs(["--ledger", "l.txt", "--settings", "s.txt", "--week", "Monday"]);
    expect(result).toEqual({ ok: false, problem: "A week is its Monday, such as 2026-11-30: Monday" });
  });

  it("refuses --go: it only reads", () => {
    const result = readArgs(["--ledger", "l.txt", "--settings", "s.txt", "--go"]);
    expect(result.ok).toBe(false);
  });
});
