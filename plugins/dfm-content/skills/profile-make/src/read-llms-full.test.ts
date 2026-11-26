import { describe, expect, it } from "vitest";
import { readLlmsFull } from "./read-llms-full.ts";
import { COFFEE_SHOP_LLMS_FULL } from "../../../fixtures/coffee-shop-site.ts";

describe("readLlmsFull", () => {
  const items = readLlmsFull(COFFEE_SHOP_LLMS_FULL);

  it("finds each page and post with its title and address", () => {
    expect(items.map((item) => [item.kind, item.title])).toEqual([
      ["page", "About us"],
      ["post", "Iced coffee is back"],
      ["post", "Stamp card"],
    ]);
    expect(items[0].url).toBe("https://coffee-shop.example/about/");
  });

  it("keeps a heading inside an item as its text", () => {
    expect(items[0].text).toContain("## Our hours");
  });

  it("leaves the address and date lines out of the words", () => {
    expect(items[1].text).not.toContain("URL:");
    expect(items[1].text).not.toContain("Last updated:");
  });
});
