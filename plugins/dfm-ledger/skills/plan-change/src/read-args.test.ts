import { describe, expect, it } from "vitest";
import { readArgs } from "./read-args.ts";

describe("readArgs", () => {
  it("reads the ledger, settings and the changes file", () => {
    expect(readArgs(["--ledger", "ledger.txt", "--settings", "s.txt", "--changes", "response.txt", "--go"])).toEqual({
      ok: true,
      args: { ledger: "ledger.txt", settings: "s.txt", changes: "response.txt" },
    });
  });

  it("needs all three", () => {
    expect(readArgs(["--ledger", "ledger.txt", "--settings", "s.txt"]).ok).toBe(false);
  });
});
