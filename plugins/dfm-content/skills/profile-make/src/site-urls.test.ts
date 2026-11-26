import { describe, expect, it } from "vitest";
import { siteUrls } from "./site-urls.ts";

describe("siteUrls", () => {
  it("gives the home page and /llms-full.txt of the site", () => {
    expect(siteUrls("https://coffee-shop.example/about/")).toEqual({
      ok: true,
      home: "https://coffee-shop.example/",
      llmsFull: "https://coffee-shop.example/llms-full.txt",
    });
  });

  it("refuses an address that is not https:// or not an address", () => {
    expect(siteUrls("http://coffee-shop.example").ok).toBe(false);
    expect(siteUrls("coffee shop").ok).toBe(false);
  });
});
