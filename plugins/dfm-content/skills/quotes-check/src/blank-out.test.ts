import { describe, expect, it } from "vitest";
import { blankOut } from "./blank-out.ts";

describe("blankOut", () => {
  it("replaces a stretch with spaces and keeps the length", () => {
    expect(blankOut("Sam made it", [{ start: 0, end: 3 }])).toBe("    made it");
  });
});
