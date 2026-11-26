import { describe, expect, it } from "vitest";
import { checkSite } from "./check-site.ts";
import {
  COFFEE_SHOP_ADDRESS,
  COFFEE_SHOP_ADMIN_KEY,
  COFFEE_SHOP_KEY_NAME,
  COFFEE_SHOP_SITE,
} from "../../../fixtures/coffee-shop.ts";

describe("checkSite", () => {
  it("takes the coffee shop", () => {
    expect(checkSite("coffee-shop", COFFEE_SHOP_ADDRESS, COFFEE_SHOP_KEY_NAME)).toEqual({ ok: true, site: COFFEE_SHOP_SITE });
  });

  it("takes the last slash off the address", () => {
    const checked = checkSite("coffee-shop", "https://coffee-shop.example/", COFFEE_SHOP_KEY_NAME);
    expect(checked.ok && checked.site.address).toBe(COFFEE_SHOP_ADDRESS);
  });

  it("refuses an address that is not https://", () => {
    expect(checkSite("coffee-shop", "http://coffee-shop.example", COFFEE_SHOP_KEY_NAME).ok).toBe(false);
    expect(checkSite("coffee-shop", "coffee-shop.example", COFFEE_SHOP_KEY_NAME).ok).toBe(false);
  });

  it("refuses an address with a user, a query or a fragment", () => {
    expect(checkSite("coffee-shop", "https://sam:secret@coffee-shop.example", COFFEE_SHOP_KEY_NAME).ok).toBe(false);
    expect(checkSite("coffee-shop", "https://coffee-shop.example/?key=1", COFFEE_SHOP_KEY_NAME).ok).toBe(false);
  });

  it("refuses a name that is not lowercase with hyphens", () => {
    expect(checkSite("Coffee Shop", COFFEE_SHOP_ADDRESS, COFFEE_SHOP_KEY_NAME).ok).toBe(false);
  });

  it("refuses a key given in place of the variable's name, without repeating it", () => {
    const checked = checkSite("coffee-shop", COFFEE_SHOP_ADDRESS, COFFEE_SHOP_ADMIN_KEY);
    expect(checked.ok).toBe(false);
    expect(JSON.stringify(checked)).not.toContain(COFFEE_SHOP_ADMIN_KEY);
  });
});
