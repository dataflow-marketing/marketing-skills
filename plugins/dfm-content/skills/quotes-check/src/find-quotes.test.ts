import { describe, expect, it } from "vitest";
import { findQuotes } from "./find-quotes.ts";

describe("findQuotes", () => {
  it("pairs marks in order across a list", () => {
    const found = findQuotes('It uses "regulars", "the counter" and "on us".');
    expect(found.quotes.map((quote) => quote.inner)).toEqual(["regulars", "the counter", "on us"]);
    expect(found.unpaired).toBe(false);
  });

  it("reads curly quote marks", () => {
    const found = findQuotes("\u201CThe tenth coffee is on us.\u201D [Stamp card]");
    expect(found.quotes[0].inner).toBe("The tenth coffee is on us.");
  });

  it("says when a mark has no pair", () => {
    expect(findQuotes('She said "the tenth is free').unpaired).toBe(true);
  });
});
