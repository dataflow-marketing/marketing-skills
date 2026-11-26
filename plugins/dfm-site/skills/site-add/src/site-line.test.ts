import { describe, expect, it } from "vitest";
import { siteLine } from "./site-line.ts";
import { COFFEE_SHOP_SITE, COFFEE_SHOP_SITE_LINE } from "../../../fixtures/coffee-shop.ts";

describe("siteLine", () => {
  it("is the public site line from spec/settings.md, with no key", () => {
    expect(siteLine(COFFEE_SHOP_SITE)).toBe(COFFEE_SHOP_SITE_LINE);
  });
});
