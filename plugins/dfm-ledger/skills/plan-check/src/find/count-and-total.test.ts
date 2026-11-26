import { readLedger } from "@dataflow-marketing/ledger/read";
import { describe, expect, it } from "vitest";
import { countAndTotal } from "./count-and-total.ts";

describe("countAndTotal", () => {
  it("names a count and a total of one fact in the same week", () => {
    const ledger = readLedger(
      "spec 1\n=== done ===\n2026-11-16 fact count visits: 3\n2026-11-18 fact total visits: 40\n2026-11-23 fact count visits: 5\n",
    );
    expect(countAndTotal(ledger)).toEqual([{ kind: "count and total in one week", about: "visits, week of 2026-11-16", lines: [3, 4] }]);
  });
});
