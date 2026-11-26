import { describe, expect, it } from "vitest";
import { COFFEE_SHOP_LEDGER } from "../../fixtures/coffee-shop.ts";
import { bodyBytes, isOverLimit } from "./is-over-limit.ts";

describe("bodyBytes and isOverLimit", () => {
  it("counts UTF-8 bytes, not characters", () => {
    expect(bodyBytes("caf\u00e9")).toBe(5);
  });

  it("measures the coffee shop ledger against a limit", () => {
    const bytes = bodyBytes(COFFEE_SHOP_LEDGER);
    expect(isOverLimit(COFFEE_SHOP_LEDGER, bytes)).toBe(false);
    expect(isOverLimit(COFFEE_SHOP_LEDGER, bytes - 1)).toBe(true);
  });
});
