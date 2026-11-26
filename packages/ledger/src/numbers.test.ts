import { describe, expect, it } from "vitest";
import { written } from "./numbers.ts";

describe("written", () => {
  it("writes thousands and at most one place", () => {
    expect(written(1240)).toBe("1,240");
    expect(written(7.5)).toBe("7.5");
    expect(written(0.625)).toBe("0.6");
    expect(written(1452)).toBe("1,452");
  });
});
