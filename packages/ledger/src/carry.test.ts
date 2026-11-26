// Carry forward on the coffee shop (spec/ledger.md, Timing):
// a "+" step not ticked in its week carries forward until it is ticked or a "-" line takes it off.

import { describe, expect, it } from "vitest";
import { stepsInWeek } from "./index.ts";
import type { Done, Entry } from "./index.ts";

const NO_DONE: Done = { weeks: {} };

const coffeeShop: Entry[] = [
  { date: "2026-11-16", op: "=", methods: [{ name: "open the cafe" }] },
  { date: "2026-11-23", op: "=", methods: [{ name: "open the cafe" }] },
  { date: "2026-11-23", op: "+", methods: [{ name: "flyer drop" }] },
  { date: "2026-11-30", op: "=", methods: [{ name: "open the cafe" }] },
];

describe("stepsInWeek carry forward", () => {
  it("carries a + step not ticked, marked with its week", () => {
    const week = stepsInWeek(coffeeShop, NO_DONE, "2026-11-30", "2026-12-06");
    expect(week.steps).toEqual(["open the cafe", "flyer drop"]);
    expect(week.carried).toEqual({ "flyer drop": "2026-11-23" });
  });

  it("does not carry a + step ticked in its week", () => {
    const done: Done = { weeks: { "2026-11-23": { answers: { "flyer drop": "done" } } } };
    const week = stepsInWeek(coffeeShop, done, "2026-11-30", "2026-12-06");
    expect(week.steps).toEqual(["open the cafe"]);
    expect(week.carried).toEqual({});
  });

  it("stops carrying after the week it is ticked in", () => {
    const done: Done = { weeks: { "2026-11-30": { answers: { "flyer drop": "done" } } } };
    const thatWeek = stepsInWeek(coffeeShop, done, "2026-11-30", "2026-12-06");
    const nextWeek = stepsInWeek(coffeeShop, done, "2026-12-07", "2026-12-13");
    expect(thatWeek.steps).toContain("flyer drop");
    expect(nextWeek.steps).not.toContain("flyer drop");
  });

  it("still carries a step marked not done", () => {
    const done: Done = { weeks: { "2026-11-23": { answers: { "flyer drop": "not done" } } } };
    const week = stepsInWeek(coffeeShop, done, "2026-11-30", "2026-12-06");
    expect(week.carried).toEqual({ "flyer drop": "2026-11-23" });
  });

  it("does not carry a step written out by date", () => {
    const week = stepsInWeek(coffeeShop, NO_DONE, "2026-12-07", "2026-12-13");
    expect(week.steps).toEqual(["flyer drop"]);
  });
});

describe("stepsInWeek taken off", () => {
  const withTakeOff: Entry[] = [
    ...coffeeShop,
    { date: "2026-11-30", op: "-", methods: [{ name: "flyer drop" }] },
  ];

  it("removes the step from the week of the - line", () => {
    const week = stepsInWeek(withTakeOff, NO_DONE, "2026-11-30", "2026-12-06");
    expect(week.steps).toEqual(["open the cafe"]);
    expect(week.carried).toEqual({});
  });

  it("stops the carry in later weeks", () => {
    const week = stepsInWeek(withTakeOff, NO_DONE, "2026-12-07", "2026-12-13");
    expect(week.steps).toEqual([]);
  });
});

describe("stepsInWeek series", () => {
  const series: Entry[] = [
    { date: "2026-11-23", op: "+", methods: [{ name: "guest barista" }] },
    { date: "2026-11-30", op: "+", methods: [{ name: "guest barista" }] },
  ];

  it("keeps the earliest week a step is carried from", () => {
    const week = stepsInWeek(series, NO_DONE, "2026-12-07", "2026-12-13");
    expect(week.carried).toEqual({ "guest barista": "2026-11-23" });
  });

  it("carries a later date on its own once an earlier one is ticked", () => {
    const done: Done = { weeks: { "2026-11-23": { answers: { "guest barista": "done" } } } };
    const week = stepsInWeek(series, done, "2026-12-07", "2026-12-13");
    expect(week.carried).toEqual({ "guest barista": "2026-11-30" });
  });
});
