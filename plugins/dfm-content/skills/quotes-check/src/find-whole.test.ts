import { describe, expect, it } from "vitest";
import { findWhole } from "./find-whole.ts";

describe("findWhole", () => {
  it("finds a word only when it stands alone", () => {
    expect(findWhole("the same question", "sam")).toBe(-1);
    expect(findWhole("ask sam, the barista", "sam")).toBe(4);
  });
});
