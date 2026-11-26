import { readLedger } from "@dataflow-marketing/ledger/read";
import { describe, expect, it } from "vitest";
import { forecastLines, goalLines } from "./goal-lines.ts";

function ledger(done: string) {
  return readLedger(`spec 1\n=== plan ===\nwant stamp cards started 10 a week by 2026-12-31\n=== done ===\n${done}`);
}

describe("goalLines", () => {
  it("says the goal as a want", () => {
    expect(goalLines(ledger("").plan?.want)).toEqual(["goal: stamp cards started 10 a week by 2026-12-31 (want)"]);
    expect(goalLines(undefined)).toEqual([]);
  });
});

describe("forecastLines", () => {
  it("forecasts on a straight line, rough until 8 weeks are counted", () => {
    const read = ledger("2026-11-16 fact count stamp cards started: 6\n2026-11-23 fact count stamp cards started: 9\n");
    expect(forecastLines(read.plan?.want, read.done!, "2026-12-02")).toEqual([
      "forecast: 10 a week by 2026-12-31: likely the week of 2026-11-30; rough, 2 counted weeks (modelled, expect)",
      "forecast: now 7.5 a week; to reach 10 by 2026-12-31 it has to rise about 0.6 a week (modelled, expect)",
    ]);
  });

  it("says not yet with fewer than 2 counted weeks", () => {
    const read = ledger("2026-11-16 fact count stamp cards started: 6\n");
    expect(forecastLines(read.plan?.want, read.done!, "2026-12-02")).toEqual([
      "forecast: not yet: 1 counted week of stamp cards started, 2 are needed (modelled, expect)",
    ]);
  });
});
