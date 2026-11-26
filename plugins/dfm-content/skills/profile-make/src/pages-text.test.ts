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
});
