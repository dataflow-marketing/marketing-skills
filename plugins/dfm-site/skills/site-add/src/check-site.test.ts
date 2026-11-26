import { describe, expect, it } from "vitest";
import { checkSite } from "./check-site.ts";
import { COFFEE_SHOP_ADDRESS, COFFEE_SHOP_SITE } from "../../../fixtures/coffee-shop.ts";

describe("checkSite", () => {
  it("takes the coffee shop as a public site with no key", () => {
    expect(checkSite("coffee-shop", `${COFFEE_SHOP_ADDRESS}/`)).toEqual({ ok: true, site: COFFEE_SHOP_SITE });
  });

  it("refuses an address that is not https:// and a name that is not lowercase with hyphens", () => {
    expect(checkSite("coffee-shop", "http://coffee-shop.example").ok).toBe(false);
    expect(checkSite("Coffee Shop", COFFEE_SHOP_ADDRESS).ok).toBe(false);
  });
});
