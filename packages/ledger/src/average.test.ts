import { describe, expect, it } from "vitest";
import { averageOf } from "./average.ts";

describe("averageOf", () => {
  it("is the mean of the numbers", () => {
    expect(averageOf([6, 9])).toBe(7.5);
  });

  it("is 0 for no numbers", () => {
    expect(averageOf([])).toBe(0);
  });
});
