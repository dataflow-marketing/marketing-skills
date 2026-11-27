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

describe("siteUrls on this computer", () => {
  it("reads http://localhost, for a site served here such as a demo", () => {
    expect(siteUrls("http://localhost:4101/")).toEqual({ ok: true, home: "http://localhost:4101/", llmsFull: "http://localhost:4101/llms-full.txt" });
  });

  it("still refuses plain http anywhere else", () => {
    expect(siteUrls("http://coffee-shop.example").ok).toBe(false);
  });
});
