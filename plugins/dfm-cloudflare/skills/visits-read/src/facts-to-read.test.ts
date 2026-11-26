import { describe, expect, it } from "vitest";
import { bareHost, factsToRead } from "./facts-to-read.ts";

describe("factsToRead", () => {
  it("reads every fact whose source is cloudflare and leaves the rest", () => {
    const facts = [
      { fact: "site visits", source: "cloudflare coffee-shop.example visits" },
      { fact: "pages viewed", source: "cloudflare www.coffee-shop.example views (observed)" },
      { fact: "found the site", source: "cloudflare coffee-shop.example outside" },
      { fact: "cups served", source: "told" },
    ];
    expect(factsToRead(facts)).toEqual({
      facts: [
        { fact: "site visits", host: "coffee-shop.example", measure: "visits" },
        { fact: "pages viewed", host: "coffee-shop.example", measure: "views" },
        { fact: "found the site", host: "coffee-shop.example", measure: "outside" },
      ],
      problems: [],
    });
  });

  it("names a measure Cloudflare does not count", () => {
    const result = factsToRead([{ fact: "sales", source: "cloudflare coffee-shop.example sales" }]);
    expect(result.problems).toEqual(["fact sales: Cloudflare counts visits, views or outside, not sales"]);
  });

  it("finds nothing when no fact comes from Cloudflare", () => {
    expect(factsToRead([{ fact: "cups served", source: "told" }])).toEqual({ facts: [], problems: [] });
  });
});

describe("bareHost", () => {
  it("takes off www and lowers the case", () => {
    expect(bareHost("WWW.Coffee-Shop.example")).toBe("coffee-shop.example");
  });
});
