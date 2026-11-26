import { readLedger } from "@dataflow-marketing/ledger/read";
import { describe, expect, it } from "vitest";
import { recordPlan } from "./record-plan.ts";

const LEDGER = readLedger(
  [
    "spec 1",
    "=== graph ===",
    "fact visits: told",
    "fact loyalty list: told",
    "open the cafe -> visits: ? (unknown)",
    "=== plan ===",
    "start 2026-11-16",
    "every week open the cafe",
  ].join("\n"),
);
const NOTHING = { counts: [], totals: [], done: [], notDone: [] };
const THIS_WEEK = { week: "2026-11-30", today: "2026-12-02", stamp: "2026-12-02T10:00+11:00", timeZone: "Australia/Melbourne" };

describe("recordPlan", () => {
  it("records this week's counts as so far; a tick with when it was made", () => {
    const plan = recordPlan(LEDGER, { ...NOTHING, counts: [{ name: "visits", n: 1240 }], done: ["open the cafe"] }, THIS_WEEK);
    expect(plan.ok && plan.change.add).toEqual([
      "2026-11-30 fact count visits: 1,240",
      "2026-11-30 open the cafe: done at 2026-12-02T10:00+11:00 Australia/Melbourne",
      "2026-11-30 counted to 2026-12-02",
    ]);
  });

  it("makes a week gone by whole: no counted to line", () => {
    const plan = recordPlan(LEDGER, { ...NOTHING, counts: [{ name: "visits", n: 600 }] }, { ...THIS_WEEK, week: "2026-11-23" });
    expect(plan.ok && plan.change.add).toEqual(["2026-11-23 fact count visits: 600"]);
    expect(plan.ok && plan.change.remove).toContain("2026-11-23 counted to ");
  });

  it("records a total on the day it was told", () => {
    const plan = recordPlan(LEDGER, { ...NOTHING, totals: [{ name: "loyalty list", n: 312 }] }, THIS_WEEK);
    expect(plan.ok && plan.change.add).toEqual(["2026-12-02 fact total loyalty list: 312"]);
  });

  it("refuses a fact not declared, a step not in the week, a week not begun and a day that is not a Monday", () => {
    const told = { ...NOTHING, counts: [{ name: "enquiries", n: 3 }], done: ["market stall"] };
    expect(recordPlan(LEDGER, told, THIS_WEEK)).toEqual({
      ok: false,
      problems: [
        'The graph does not declare the fact enquiries: add a line such as "fact enquiries: told" first.',
        "market stall is not a step in the week of 2026-11-30.",
      ],
    });
    expect(recordPlan(LEDGER, NOTHING, { ...THIS_WEEK, week: "2026-12-07" }).ok).toBe(false);
    expect(recordPlan(LEDGER, NOTHING, { ...THIS_WEEK, week: "2026-12-01" }).ok).toBe(false);
  });
});
