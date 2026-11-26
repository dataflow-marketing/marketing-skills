// The straight line forecast on the coffee shop (spec/forecast.md):
// 6 and 9 stamp cards started, a goal of 10 a week by 31 December 2026.

import { describe, expect, it } from "vitest";
import { straightLineForecast, weeksLeft } from "./index.ts";

describe("straightLineForecast on the coffee shop", () => {
  const coffeeShop = straightLineForecast({
    goal: 10,
    by: "2026-12-31",
    weeks: ["2026-11-16", "2026-11-23"],
    counts: [6, 9],
    from: "2026-11-30",
  });

  it("is likely the week of 2026-11-30", () => {
    expect(coffeeShop.likely).toBe("2026-11-30");
  });

  it("is rough with 2 counted weeks", () => {
    expect(coffeeShop.rough).toBe(true);
  });

  it("has to rise 0.625 a week (2.5 over 4 weeks)", () => {
    expect(coffeeShop.rise).toBe(0.625);
  });

  it("is 7.5 a week now", () => {
    expect(coffeeShop.now).toBe(7.5);
  });
});

describe("straightLineForecast when the line cannot give a date", () => {
  it("gives no date with 1 counted week", () => {
    const one = straightLineForecast({ goal: 10, by: "2026-12-31", weeks: ["2026-11-16"], counts: [6], from: "2026-11-23" });
    expect(one.likely).toBeUndefined();
  });

  it("is 0 now with no counted weeks", () => {
    const none = straightLineForecast({ goal: 10, by: "2026-12-31", weeks: [], counts: [], from: "2026-11-23" });
    expect(none.now).toBe(0);
    expect(none.likely).toBeUndefined();
  });

  it("gives no date for a line that is not rising", () => {
    const falling = straightLineForecast({ goal: 10, by: "2026-12-31", weeks: ["2026-11-16", "2026-11-23"], counts: [9, 6], from: "2026-11-30" });
    expect(falling.likely).toBeUndefined();
  });

  it("gives no date more than five years away", () => {
    const slow = straightLineForecast({ goal: 1000, by: "2026-12-31", weeks: ["2026-11-16", "2026-11-23"], counts: [6, 7], from: "2026-11-30" });
    expect(slow.likely).toBeUndefined();
  });
});

describe("straightLineForecast already at the goal", () => {
  it("is this week with no rise", () => {
    const there = straightLineForecast({ goal: 5, by: "2026-12-31", weeks: ["2026-11-16", "2026-11-23"], counts: [6, 9], from: "2026-11-30" });
    expect(there.likely).toBe("2026-11-30");
    expect(there.rise).toBe(0);
  });
});

describe("straightLineForecast rough", () => {
  const mondays = ["2026-09-28", "2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26", "2026-11-02", "2026-11-09", "2026-11-16"];
  const counts = [1, 1, 2, 2, 3, 3, 4, 4];

  it("is rough with 7 counted weeks", () => {
    const seven = straightLineForecast({ goal: 10, by: "2026-12-31", weeks: mondays.slice(0, 7), counts: counts.slice(0, 7), from: "2026-11-23" });
    expect(seven.rough).toBe(true);
  });

  it("is not rough with 8 counted weeks", () => {
    const eight = straightLineForecast({ goal: 10, by: "2026-12-31", weeks: mondays, counts, from: "2026-11-23" });
    expect(eight.rough).toBe(false);
  });
});

describe("weeksLeft", () => {
  it("counts the whole weeks to the goal's date", () => {
    expect(weeksLeft("2026-11-30", "2026-12-31")).toBe(4);
  });

  it("is at least 1", () => {
    expect(weeksLeft("2026-12-28", "2026-12-29")).toBe(1);
  });
});
