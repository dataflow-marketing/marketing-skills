import { describe, expect, it } from "vitest";
import { dateParts, findDates, isDate } from "./dates.ts";

describe("findDates", () => {
  it("finds dates written year first", () => {
    expect(findDates("from 2026-10-01 to 2027-01-04")).toEqual([
      { start: 5, end: 15 },
      { start: 19, end: 29 },
    ]);
  });

  it("finds no date inside a longer run of figures", () => {
    expect(findDates("12026-11-280")).toEqual([]);
  });
});

describe("isDate", () => {
  it("tells a date from a number", () => {
    expect(isDate("2026-11-28")).toBe(true);
    expect(isDate("2026")).toBe(false);
  });
});

describe("dateParts", () => {
  it("gives the year, month and day as number keys", () => {
    expect(dateParts("2027-01-04")).toEqual(["2027", "1", "4"]);
  });
});
