import { describe, expect, it } from "vitest";
import { straightLine } from "./straight-line.ts";

describe("straightLine", () => {
  it("goes through points on a line exactly", () => {
    const line = straightLine([0, 1, 2], [6, 9, 12]);
    expect(line.slope).toBe(3);
    expect(line.at(3)).toBe(15);
  });

  it("is flat when every x is the same", () => {
    const line = straightLine([1, 1], [4, 8]);
    expect(line.slope).toBe(0);
    expect(line.at(5)).toBe(6);
  });
});
