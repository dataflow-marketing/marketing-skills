import { describe, expect, it } from "vitest";
import { addDays, daysBetween, mondayOf } from "./dates.ts";

describe("dates", () => {
  it("counts the days between two dates, negative when the second is earlier", () => {
    expect(daysBetween("2026-11-16", "2026-11-23")).toBe(7);
    expect(daysBetween("2026-11-23", "2026-11-16")).toBe(-7);
  });

  it("adds days across the end of a month and a year", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("finds the Monday of a date's week, a Sunday being the end of its week", () => {
    expect(mondayOf("2026-11-25")).toBe("2026-11-23");
    expect(mondayOf("2026-11-23")).toBe("2026-11-23");
    expect(mondayOf("2026-11-29")).toBe("2026-11-23");
  });
});
