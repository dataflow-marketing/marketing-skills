import { describe, expect, it } from "vitest";
import { describeResult } from "./describe-result.ts";
import { COFFEE_SHOP_SITE } from "../../../fixtures/coffee-shop.ts";

describe("describeResult", () => {
  it("links the draft in Ghost and says a person publishes", () => {
    const post = { id: "post1", status: "draft", title: "Iced coffee is back", slug: "iced-coffee" };
    const text = describeResult(COFFEE_SHOP_SITE, post, { isDraft: true, problems: [] }, true).text;
    expect(text).toContain("created on coffee-shop: id post1 (status was not sent)");
    expect(text).toContain("open it in Ghost: https://coffee-shop.example/ghost/#/editor/post/post1");
    expect(text).toContain("a person reads it and publishes it: no skill does");
  });
});
