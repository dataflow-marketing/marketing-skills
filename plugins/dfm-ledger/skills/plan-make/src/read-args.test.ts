import { describe, expect, it } from "vitest";
import { readArgs } from "./read-args.ts";

describe("readArgs", () => {
  it("reads the ledger, the settings and the followers told", () => {
    expect(readArgs(["--ledger", "ledger.txt", "--settings", "settings.txt", "--followers", "1,200", "--go"])).toEqual({
      ok: true,
      args: { ledger: "ledger.txt", settings: "settings.txt", followers: 1200 },
    });
  });

  it("needs the ledger and settings; followers must be a whole number", () => {
    expect(readArgs(["--ledger", "ledger.txt"]).ok).toBe(false);
    expect(readArgs(["--ledger", "l.txt", "--settings", "s.txt", "--followers", "lots"]).ok).toBe(false);
  });
});
