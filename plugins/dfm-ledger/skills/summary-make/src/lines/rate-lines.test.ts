import { readLedger } from "@dataflow-marketing/ledger/read";
import { describe, expect, it } from "vitest";
import { rateLines } from "./rate-lines.ts";

describe("rateLines", () => {
  it("names only the links with a believed or proven rate, as the ledger writes them", () => {
    const read = readLedger(
      [
        "spec 1",
        "=== graph ===",
        "open the cafe -> visits: ? (unknown)",
        "stamp card at the counter -> stamp cards started: 15 of 2,550 visits (believed)",
        "new post -> visits: 20 to 40 of 100 views (assumed)",
      ].join("\n"),
    );
    expect(rateLines(read.graph)).toEqual([
      "links with a known rate: stamp card at the counter -> stamp cards started: 15 of 2,550 visits (calculated, believed)",
    ]);
  });
});
