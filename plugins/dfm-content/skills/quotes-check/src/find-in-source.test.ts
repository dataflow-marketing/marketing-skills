import { describe, expect, it } from "vitest";
import { findInSource } from "./find-in-source.ts";
import { indexSources } from "./index-sources.ts";
import { COFFEE_SHOP_COUNTS, COFFEE_SHOP_SITE } from "../../../fixtures/coffee-shop.ts";

const index = indexSources([
  { name: "site.txt", text: COFFEE_SHOP_SITE },
  { name: "counts.txt", text: COFFEE_SHOP_COUNTS },
]);

describe("findInSource", () => {
  it("finds a quote and the line it starts on", () => {
    const mention = { kind: "quote" as const, written: "", key: "the tenth coffee is on us", textLine: 1 };
    expect(findInSource(mention, index)).toEqual({ source: "site.txt", line: 13 });
  });

  it("finds a number word by its figure in the counts", () => {
    const mention = { kind: "number" as const, written: "four", key: "4", textLine: 1 };
    expect(findInSource(mention, index)).toEqual({ source: "counts.txt", line: 1 });
  });

  it("never finds a claim", () => {
    const mention = { kind: "claim" as const, written: "x", key: "x", textLine: 1 };
    expect(findInSource(mention, index)).toBeUndefined();
  });

  it("finds a quote that runs over a line break", () => {
    const wrapped = indexSources([{ name: "notes", text: "The first hot morning\nalways brings the same question." }]);
    const mention = { kind: "quote" as const, written: "", key: "hot morning always brings", textLine: 1 };
    expect(findInSource(mention, wrapped)).toEqual({ source: "notes", line: 1 });
  });

  it("finds money only in the same currency", () => {
    const menu = indexSources([{ name: "menu", text: "Latte $5.50" }]);
    const dollars = { kind: "money" as const, written: "$5.50", key: "dollar 5.5", textLine: 1 };
    const pounds = { kind: "money" as const, written: "\u00A35.50", key: "GBP 5.5", textLine: 1 };
    expect(findInSource(dollars, menu)).toEqual({ source: "menu", line: 1 });
    expect(findInSource(pounds, menu)).toBeUndefined();
  });
});
