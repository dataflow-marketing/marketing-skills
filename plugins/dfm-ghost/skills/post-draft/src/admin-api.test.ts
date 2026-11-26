import { describe, expect, it } from "vitest";
import { editorUrl, postsUrl, postUrl } from "./admin-api.ts";
import { COFFEE_SHOP_ADDRESS } from "../../../fixtures/coffee-shop.ts";

describe("admin addresses", () => {
  it("are on the site's Ghost Admin API", () => {
    expect(postsUrl(COFFEE_SHOP_ADDRESS)).toBe("https://coffee-shop.example/ghost/api/admin/posts/?source=html");
    expect(postUrl(COFFEE_SHOP_ADDRESS, "post1")).toBe("https://coffee-shop.example/ghost/api/admin/posts/post1/");
    expect(editorUrl(COFFEE_SHOP_ADDRESS, "post1")).toBe("https://coffee-shop.example/ghost/#/editor/post/post1");
  });
});
