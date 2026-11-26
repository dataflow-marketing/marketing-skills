import { readLedger } from "@dataflow-marketing/ledger/read";
import { describe, expect, it } from "vitest";
import { factsCounted, weekSoFar, wholeWeeks } from "./weeks.ts";

const DONE = readLedger(
  [
    "spec 1",
    "=== done ===",
    "2026-11-16 fact count visits: 1,240",
    "2026-11-23 fact count visits: 1,310",
    "2026-11-23 fact count stamp cards started: 9",
    "2026-11-30 fact count visits: 560",
    "2026-11-30 counted to 2026-12-02",
  ].join("\n"),
).done!;

describe("weeks", () => {
  it("finds the whole weeks counted and the week counted so far", () => {
    expect(wholeWeeks(DONE)).toEqual(["2026-11-16", "2026-11-23"]);
    expect(weekSoFar(DONE)).toBe("2026-11-30");
  });

  it("lists the facts counted in the order first counted", () => {
    expect(factsCounted(DONE, wholeWeeks(DONE))).toEqual(["visits", "stamp cards started"]);
  });
});
