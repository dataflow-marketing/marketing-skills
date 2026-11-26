import { describe, expect, it } from "vitest";
import { readFlags } from "./read-flags.ts";

const RULES = { valueFlags: ["--object", "--settings"], required: ["--object"], usage: "run.js --object <kind>" };

describe("readFlags", () => {
  it("reads each value flag with its value and skips --json and a mode", () => {
    expect(readFlags(["--object", "ledger", "--json", "--go", "--settings", "s.txt"], RULES)).toEqual({
      ok: true,
      values: { "--object": "ledger", "--settings": "s.txt" },
    });
  });

  it("names a flag it does not know", () => {
    expect(readFlags(["--object", "ledger", "--force"], RULES)).toEqual({
      ok: false,
      problem: "Not understood: --force. Use: run.js --object <kind>",
    });
  });

  it("names a value flag with no value", () => {
    expect(readFlags(["--object", "--go"], RULES).ok).toBe(false);
  });

  it("names every required flag that is missing", () => {
    expect(readFlags(["--settings", "s.txt"], RULES)).toEqual({
      ok: false,
      problem: "Missing --object. Use: run.js --object <kind>",
    });
  });
});
