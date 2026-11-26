import { describe, expect, it } from "vitest";
import { likelyWeek } from "./likely-week.ts";

const COFFEE = { weeks: ["2026-11-16", "2026-11-23"], counts: [6, 9], from: "2026-11-30" };

describe("likelyWeek", () => {
  it("is the week a rising line reaches the goal", () => {
    expect(likelyWeek({ ...COFFEE, goal: 15, now: 7.5 })).toBe("2026-12-07");
  });

  it("is this week when the goal is already met or the line is already past it", () => {
    expect(likelyWeek({ ...COFFEE, goal: 5, now: 7.5 })).toBe("2026-11-30");
    expect(likelyWeek({ ...COFFEE, goal: 10, now: 7.5 })).toBe("2026-11-30");
  });

  it("is no week with fewer than two counted weeks, a line not rising or more than five years away", () => {
    expect(likelyWeek({ weeks: ["2026-11-16"], counts: [6], goal: 10, now: 6, from: "2026-11-23" })).toBeUndefined();
    expect(likelyWeek({ ...COFFEE, counts: [9, 6], goal: 10, now: 7.5 })).toBeUndefined();
    expect(likelyWeek({ ...COFFEE, counts: [6, 6.01], goal: 100, now: 6 })).toBeUndefined();
  });
});
