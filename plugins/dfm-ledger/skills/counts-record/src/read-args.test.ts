import { describe, expect, it } from "vitest";
import { readArgs } from "./read-args.ts";

describe("readArgs", () => {
  it("reads every count, total and tick given", () => {
    const read = readArgs([
      "--ledger", "ledger.txt", "--settings", "settings.txt", "--week", "2026-11-30",
      "--count", "visits=560", "--count", "cups served=640", "--done", "new post", "--go",
    ]);
    expect(read).toEqual({
      ok: true,
      args: {
        ledger: "ledger.txt",
        settings: "settings.txt",
        week: "2026-11-30",
        counts: ["visits=560", "cups served=640"],
        totals: [],
        done: ["new post"],
        notDone: [],
      },
    });
  });

  it("needs the ledger and the settings; a week must be a date", () => {
    expect(readArgs(["--ledger", "ledger.txt"]).ok).toBe(false);
    expect(readArgs(["--ledger", "l.txt", "--settings", "s.txt", "--week", "this week"]).ok).toBe(false);
  });
});
