import { describe, expect, it } from "vitest";
import { noLlmsFull } from "./no-llms-full.ts";

describe("noLlmsFull", () => {
  it("names the address and offers the sitemap instead", () => {
    const said = noLlmsFull("https://coffee-shop.example/llms-full.txt", "it answered 404");
    expect(said).toContain("There is no https://coffee-shop.example/llms-full.txt (it answered 404).");
    expect(said).toContain("--from-sitemap");
  });
});
