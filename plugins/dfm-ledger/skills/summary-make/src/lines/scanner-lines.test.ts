import { readLedger } from "@dataflow-marketing/ledger/read";
import { describe, expect, it } from "vitest";
import { scannerLines } from "./scanner-lines.ts";

describe("scannerLines", () => {
  it("names a week with more clicks than opens", () => {
    const read = readLedger("spec 1\n=== done ===\n2026-11-16 fact count email clicks: 30\n2026-11-16 fact count email opens: 15\n");
    expect(scannerLines(read.done!)).toEqual([
      "email clicks 30 is more than email opens 15 in the week of 2026-11-16: likely link scanners, not people (inferred, happened)",
    ]);
  });
});
