import { describe, expect, it } from "vitest";
import { COFFEE_SHOP_SETTINGS } from "../../../fixtures/coffee-shop.ts";
import { parseSettings } from "../../../src/index.ts";
import { describeSettings } from "./describe-settings.ts";

describe("describeSettings", () => {
  it("describes the coffee shop settings for a person", () => {
    const { text } = describeSettings(parseSettings(COFFEE_SHOP_SETTINGS));
    expect(text).toContain("site coffee-shop: ghost https://coffee-shop.example");
    expect(text).toContain("binding people coffee-shop: notes people/coffee-shop.txt");
    expect(text).not.toContain("problem:");
  });
});
