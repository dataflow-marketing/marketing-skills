import { describe, expect, it } from "vitest";
import { sizeLimit } from "./size-limit.ts";

describe("sizeLimit", () => {
  it("reads a whole number of bytes", () => {
    expect(sizeLimit("1000000")).toBe(1000000);
  });

  it("fails loudly on a missing or broken value", () => {
    expect(() => sizeLimit(undefined)).toThrow(/MAX_BODY_BYTES/);
    expect(() => sizeLimit("lots")).toThrow(/MAX_BODY_BYTES/);
    expect(() => sizeLimit("0")).toThrow(/MAX_BODY_BYTES/);
  });
});
