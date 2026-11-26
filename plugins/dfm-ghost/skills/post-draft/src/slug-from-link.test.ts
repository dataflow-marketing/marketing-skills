import { describe, expect, it } from "vitest";
import { slugFromLink } from "./slug-from-link.ts";
import { COFFEE_SHOP_ADDRESS } from "../../../fixtures/coffee-shop.ts";

describe("slugFromLink", () => {
  it("takes the slug from a link on the site", () => {
    expect(slugFromLink("https://coffee-shop.example/iced-coffee/", COFFEE_SHOP_ADDRESS)).toBe("iced-coffee");
  });

  it("gives nothing for a link elsewhere or no link", () => {
    expect(slugFromLink("https://instagram.example/coffee-shop/", COFFEE_SHOP_ADDRESS)).toBeUndefined();
    expect(slugFromLink(undefined, COFFEE_SHOP_ADDRESS)).toBeUndefined();
    expect(slugFromLink("https://coffee-shop.example/", COFFEE_SHOP_ADDRESS)).toBeUndefined();
  });
});
