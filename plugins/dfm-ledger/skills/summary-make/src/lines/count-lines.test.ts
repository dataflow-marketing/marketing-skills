import { readLedger } from "@dataflow-marketing/ledger/read";
import { describe, expect, it } from "vitest";
import { soFarLines, totalLines, weeklyLines } from "./count-lines.ts";

const DONE = readLedger(
  [
    "spec 1",
    "=== done ===",
    "2026-11-16 fact count visits: 1,240",
    "2026-11-16 fact count stamp cards started: 6",
    "2026-11-23 fact count visits: 1,310",
    "2026-11-23 fact count stamp cards started: 9",
    "2026-11-23 fact total loyalty list: 312",
    "2026-11-30 fact count visits: 560",
    "2026-11-30 counted to 2026-12-02",
  ].join("\n"),
).done!;

describe("count lines", () => {
  it("gives each fact's weekly numbers and average, the goal's fact first", () => {
    expect(weeklyLines(DONE, "stamp cards started")).toEqual([
      "stamp cards started a week: 6, 9; average 7.5 (calculated, happened)",
      "visits a week: 1,240, 1,310; average 1,275 (calculated, happened)",
    ]);
  });

  it("gives the latest total and this week so far", () => {
    expect(totalLines(DONE)).toEqual(["loyalty list total: 312 on 2026-11-23 (calculated, happened)"]);
    expect(soFarLines(DONE)).toEqual(["this week so far, to 2026-12-02: visits 560 (calculated, happened)"]);
  });
});
