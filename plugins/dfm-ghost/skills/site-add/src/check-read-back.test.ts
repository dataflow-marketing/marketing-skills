import { describe, expect, it } from "vitest";
import { checkReadBack } from "./check-read-back.ts";
import { COFFEE_SHOP_SITE, COFFEE_SHOP_SITE_LINE } from "../../../fixtures/coffee-shop.ts";

describe("checkReadBack", () => {
  it("passes when the line is there", () => {
    const settings = `spec 1\ntime zone: Australia/Melbourne\nkeys file: ~/.config/dfm/.env\n${COFFEE_SHOP_SITE_LINE}\n`;
    expect(checkReadBack(settings, COFFEE_SHOP_SITE)).toEqual([]);
  });

  it("finds a missing line and a missing file", () => {
    expect(checkReadBack("spec 1\ntime zone: Australia/Melbourne\nkeys file: ~/.config/dfm/.env\n", COFFEE_SHOP_SITE).length).toBe(1);
    expect(checkReadBack(undefined, COFFEE_SHOP_SITE).length).toBe(1);
  });

  it("finds settings that name no keys file", () => {
    const settings = `spec 1\ntime zone: Australia/Melbourne\n${COFFEE_SHOP_SITE_LINE}\n`;
    expect(checkReadBack(settings, COFFEE_SHOP_SITE)).toEqual(["The settings file names no keys file."]);
  });

  it("finds a site named twice", () => {
    const settings = `spec 1\ntime zone: Australia/Melbourne\nkeys file: ~/.config/dfm/.env\nsite coffee-shop: public https://coffee-shop.example\n${COFFEE_SHOP_SITE_LINE}\n`;
    expect(checkReadBack(settings, COFFEE_SHOP_SITE)).toEqual(["Settings name the site coffee-shop more than once."]);
  });
});
