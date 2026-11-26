import { parseSettings } from "@dataflow-marketing/core";
import { describe, expect, it } from "vitest";
import { findGhostSite } from "./find-ghost-site.ts";
import { COFFEE_SHOP_SITE, coffeeShopSettings } from "../../../fixtures/coffee-shop.ts";

describe("findGhostSite", () => {
  it("finds the coffee shop and its keys file", () => {
    const found = findGhostSite(parseSettings(coffeeShopSettings("/keys/.env")), "coffee-shop");
    expect(found).toEqual({ ok: true, found: { site: COFFEE_SHOP_SITE, keysFile: "/keys/.env" } });
  });

  it("refuses a site that is not there, settings with no keys file and settings it cannot read", () => {
    expect(findGhostSite(parseSettings(coffeeShopSettings("/keys/.env")), "bakery").ok).toBe(false);
    expect(findGhostSite(parseSettings("spec 1\nsite coffee-shop: ghost https://coffee-shop.example key in K\n"), "coffee-shop").ok).toBe(false);
    expect(findGhostSite(parseSettings("spec 1\nnonsense\n"), "coffee-shop").ok).toBe(false);
  });

  it("refuses an address that is not https://", () => {
    const settings = parseSettings("spec 1\nsite coffee-shop: ghost http://coffee-shop.example key in K\nkeys file: /k\n");
    expect(findGhostSite(settings, "coffee-shop").ok).toBe(false);
  });
});
