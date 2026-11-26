import { describe, expect, it } from "vitest";
import { numberKey } from "./number-key.ts";

describe("numberKey", () => {
  it("matches the same number written two ways", () => {
    expect(numberKey("1,000")).toBe(numberKey("1000"));
    expect(numberKey("6.30")).toBe(numberKey("6.3"));
  });

  it("keeps what is not one number as written", () => {
    expect(numberKey("28.11.2026")).toBe("28.11.2026");
  });
});
