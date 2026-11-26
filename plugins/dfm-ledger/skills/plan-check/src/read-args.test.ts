import { describe, expect, it } from "vitest";
import { readArgs } from "./read-args.ts";

describe("readArgs", () => {
  it("reads the ledger and the settings", () => {
    expect(readArgs(["--ledger", "ledger.txt", "--settings", "settings.txt", "--json"])).toEqual({
      ok: true,
      files: { ledger: "ledger.txt", settings: "settings.txt" },
    });
  });

  it("needs a ledger and refuses what it does not understand", () => {
    expect(readArgs([]).ok).toBe(false);
    expect(readArgs(["--ledger", "ledger.txt", "--go"]).ok).toBe(false);
  });
});
