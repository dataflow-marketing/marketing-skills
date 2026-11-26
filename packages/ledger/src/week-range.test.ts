import { describe, expect, it } from "vitest";
import { midnightIn, weekRange } from "./week-range.ts";

const MELBOURNE = "Australia/Melbourne";

describe("midnightIn", () => {
  it("gives Monday 00:00 in Melbourne's summer as Sunday 13:00 UTC", () => {
    expect(midnightIn("2026-11-23", MELBOURNE).toISOString()).toBe("2026-11-22T13:00:00.000Z");
  });

  it("gives Monday 00:00 in Melbourne's winter as Sunday 14:00 UTC", () => {
    expect(midnightIn("2026-06-01", MELBOURNE).toISOString()).toBe("2026-05-31T14:00:00.000Z");
  });

  it("gives Monday 00:00 in New York as 05:00 UTC in winter", () => {
    expect(midnightIn("2026-11-23", "America/New_York").toISOString()).toBe("2026-11-23T05:00:00.000Z");
  });

  it("gives UTC unchanged", () => {
    expect(midnightIn("2026-11-23", "UTC").toISOString()).toBe("2026-11-23T00:00:00.000Z");
  });
});

describe("weekRange", () => {
  it("asks this week from Monday 00:00 to now", () => {
    const now = new Date("2026-11-26T22:15:00Z");
    expect(weekRange("2026-11-23", MELBOURNE, now)).toEqual({
      ok: true,
      range: { week: "2026-11-23", from: "2026-11-22T13:00:00.000Z", to: "2026-11-26T22:15:00.000Z", soFar: true },
    });
  });

  it("asks a week gone by whole, to the next Monday 00:00", () => {
    const now = new Date("2026-12-10T00:00:00Z");
    expect(weekRange("2026-11-23", MELBOURNE, now)).toEqual({
      ok: true,
      range: { week: "2026-11-23", from: "2026-11-22T13:00:00.000Z", to: "2026-11-29T13:00:00.000Z", soFar: false },
    });
  });

  it("refuses a date that is not a Monday", () => {
    expect(weekRange("2026-11-24", MELBOURNE, new Date("2026-11-26T00:00:00Z"))).toEqual({
      ok: false,
      problem: "A week is named by its Monday: 2026-11-24 is not one",
    });
  });

  it("refuses a week that has not begun", () => {
    expect(weekRange("2026-11-30", MELBOURNE, new Date("2026-11-26T00:00:00Z"))).toEqual({
      ok: false,
      problem: "The week of 2026-11-30 has not begun",
    });
  });
});
