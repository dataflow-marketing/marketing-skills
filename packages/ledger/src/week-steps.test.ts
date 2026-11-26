import { describe, expect, it } from "vitest";
import { readLedger } from "./read/index.ts";
import { weekSteps } from "./week-steps.ts";

const LEDGER = readLedger(
  [
    "spec 1",
    "=== plan ===",
    "start 2026-11-16",
    "every week open the cafe",
    "every week new post from 2026-11-30",
    "2026-12-03 market stall",
    "2026-11-17 + flyer drop",
    "=== done ===",
    "2026-11-30 open the cafe: done",
  ].join("\n"),
);
const NOTHING_TICKED = { weeks: {} };

describe("weekSteps", () => {
  it("gives a week's every week steps, its dated steps and steps carried from earlier weeks", () => {
    const steps = weekSteps(LEDGER.plan!, LEDGER.done!, "2026-11-30");
    expect(steps.steps).toEqual(["market stall", "open the cafe", "new post", "flyer drop"]);
    expect(steps.carried).toEqual({ "flyer drop": "2026-11-16" });
  });

  it("leaves out an every week step that has not begun", () => {
    const steps = weekSteps(LEDGER.plan!, NOTHING_TICKED, "2026-11-23");
    expect(steps.steps).toEqual(["open the cafe", "flyer drop"]);
  });
});
