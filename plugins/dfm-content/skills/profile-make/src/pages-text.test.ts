import { describe, expect, it } from "vitest";
import { pagesText } from "./pages-text.ts";
import { readLlmsFull } from "./read-llms-full.ts";

describe("pagesText", () => {
  it("writes the pages in the shape of /llms-full.txt: it reads back the same", () => {
    const items = [
      { kind: "post" as const, title: "Iced coffee is back", url: "https://coffee-shop.example/iced-coffee/", text: "From Monday." },
      { kind: "page" as const, title: "About us", url: "https://coffee-shop.example/about/", text: "A takeaway coffee shop." },
    ];
    const text = pagesText(items);
    expect(text.startsWith("## Pages\n### About us\nURL: https://coffee-shop.example/about/")).toBe(true);
    expect(readLlmsFull(text).map((item) => [item.kind, item.title])).toEqual([
      ["page", "About us"],
      ["post", "Iced coffee is back"],
    ]);
  });

  it("keeps the day a post was published, then reads it back", () => {
    const items = [{ kind: "post" as const, published: "2026-12-01", title: "December's guest coffee", url: "http://localhost:4104/news/decembers-guest-coffee/", text: "A natural Ethiopia." }];
    const text = pagesText(items);
    expect(text).toContain("URL: http://localhost:4104/news/decembers-guest-coffee/\nPublished: 2026-12-01\nA natural Ethiopia.");
    const [read] = readLlmsFull(text);
    expect([read.published, read.text.trim()]).toEqual(["2026-12-01", "A natural Ethiopia."]);
  });
});
