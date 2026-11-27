// The whole check on the coffee shop: its profile passes; each kind of invention is caught.

import { describe, expect, it } from "vitest";
import { checkText } from "./check-text.ts";
import type { CheckLine } from "./types.ts";
import {
  COFFEE_SHOP_COUNTS,
  COFFEE_SHOP_PROFILE,
  COFFEE_SHOP_SITE,
  DRAFT_WITH_INVENTIONS,
} from "../../../fixtures/coffee-shop.ts";

const SITE = { name: "site.txt", text: COFFEE_SHOP_SITE };
const COUNTS = { name: "counts.txt", text: COFFEE_SHOP_COUNTS };

function notFound(lines: readonly CheckLine[]): string[] {
  const missing: string[] = [];
  for (const line of lines) {
    if (!line.found) {
      missing.push(`${line.kind} ${line.written}`);
    }
  }
  return missing;
}

describe("checkText on the coffee shop profile", () => {
  const result = checkText(COFFEE_SHOP_PROFILE, [SITE, COUNTS]);

  it("finds every quote in the site or the counts", () => {
    expect(result.problems).toBe(0);
    expect(notFound(result.lines)).toEqual([]);
  });

  it("says where a how they write sentence is", () => {
    const line = result.lines.find((checked) => checked.written === '"The tenth coffee is on us."');
    expect(line?.found).toBe(true);
    expect(line?.where).toEqual({ source: "site.txt", line: 13 });
  });

  it("misses the counts when only the site is given", () => {
    const siteOnly = checkText(COFFEE_SHOP_PROFILE, [SITE]);
    expect(notFound(siteOnly.lines)).toContain("number 120");
    expect(notFound(siteOnly.lines)).toContain('quote "the home page"');
  });
});

describe("checkText on a draft with inventions", () => {
  const result = checkText(DRAFT_WITH_INVENTIONS, [SITE]);

  it("catches an invented quote, name, number and price", () => {
    expect(notFound(result.lines)).toEqual([
      'quote "Best iced coffee in town,"',
      "name Sam",
      "number 1987",
      "money $5.50",
    ]);
    expect(result.problems).toBe(4);
  });

  it("finds what the site does say", () => {
    const monday = result.lines.find((checked) => checked.written === "Monday");
    expect(monday?.found).toBe(true);
  });
});

describe("checkText rules from the trial", () => {
  it("needs a date whole, never its parts from different places", () => {
    const source = [{ name: "site", text: "Posts from 2027-02-01 to 2026-12-04." }];
    expect(notFound(checkText("The latest post is 2027-01-04.", source).lines)).toEqual(["number 2027-01-04"]);
    expect(checkText("The latest post is 2026-12-04.", source).problems).toBe(0);
    expect(checkText("Posting since 2026.", source).problems).toBe(0);
  });

  it("matches a number word to its figure both ways", () => {
    const counts = [COUNTS];
    expect(checkText("There are four short posts.", counts).problems).toBe(0);
    expect(checkText("There are 3 pages.", [{ name: "site", text: "There are three pages." }]).problems).toBe(0);
    expect(checkText("There are five short posts.", counts).problems).toBe(1);
  });

  it("does not take a capital that starts a sentence for a name", () => {
    const result = checkText("Cake comes from next door. Takeaway only.", [SITE]);
    expect(result.lines).toEqual([]);
  });

  it("ignores punctuation at the end of a quote", () => {
    const result = checkText('They say "the tenth coffee is on us!"', [SITE]);
    expect(result.problems).toBe(0);
  });

  it("is not thrown by a quote in brackets or a list of quotes", () => {
    const text = 'Titles name the thing (such as "Iced coffee is back"). It says "regulars", "on us" and "the counter".';
    const result = checkText(text, [SITE]);
    expect(result.problems).toBe(0);
    expect(result.lines.filter((line) => line.kind === "quote").length).toBe(4);
  });
});
