import { describe, expect, it } from "vitest";
import { findNumbers } from "./find-numbers.ts";

describe("findNumbers", () => {
  it("finds figures and number words with their keys", () => {
    const found = findNumbers("We open at 6.30 with four kinds of cake.");
    expect(found.map((number) => [number.written, number.key])).toEqual([
      ["6.30", "6.3"],
      ["four", "4"],
    ]);
  });

  it("reads a date as one number, matched whole", () => {
    const found = findNumbers("Posted on 2026-11-28, the 3rd this month.");
    expect(found.map((number) => [number.written, number.key])).toEqual([
      ["2026-11-28", "2026-11-28"],
      ["3", "3"],
    ]);
  });
});
