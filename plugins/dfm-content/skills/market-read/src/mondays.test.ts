import { describe, expect, it } from "vitest";
import { addDays, mondayOf } from "./mondays.ts";

describe("mondayOf", () => {
  it("gives the Monday of the week a day is in", () => {
    expect(mondayOf("2026-11-27")).toBe("2026-11-23");
    expect(mondayOf("2026-11-23")).toBe("2026-11-23");
    expect(mondayOf("2026-10-01")).toBe("2026-09-28");
    expect(mondayOf("2027-01-03")).toBe("2026-12-28");
  });
});

describe("addDays", () => {
  it("moves across a month and a year", () => {
    expect(addDays("2026-12-28", 7)).toBe("2027-01-04");
  });
});
