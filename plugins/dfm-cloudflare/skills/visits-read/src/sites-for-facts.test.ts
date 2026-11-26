import { describe, expect, it } from "vitest";
import { sitesForFacts } from "./sites-for-facts.ts";

const VISITS = { fact: "site visits", host: "coffee-shop.example", measure: "visits" as const };
const VIEWS = { fact: "pages viewed", host: "coffee-shop.example", measure: "views" as const };

describe("sitesForFacts", () => {
  it("finds the one site line for a host named by two facts", () => {
    const sites = [
      { business: "coffee-shop", platform: "ghost", address: "https://coffee-shop.example", keyName: "GHOST" },
      { business: "coffee-shop", platform: "cloudflare", address: "www.coffee-shop.example", account: "abc", keyName: "CF" },
    ];
    expect(sitesForFacts([VISITS, VIEWS], sites)).toEqual({
      sites: [{ host: "coffee-shop.example", account: "abc", keyName: "CF" }],
      problems: [],
    });
  });

  it("says the line to add when there is none", () => {
    const result = sitesForFacts([VISITS], []);
    expect(result.problems).toEqual([
      'No Cloudflare line for coffee-shop.example in settings: add "site <name>: cloudflare coffee-shop.example account <account id> key in <NAME>"',
    ]);
  });

  it("refuses a line with no account", () => {
    const sites = [{ business: "coffee-shop", platform: "cloudflare", address: "coffee-shop.example", keyName: "CF" }];
    expect(sitesForFacts([VISITS], sites).problems).toHaveLength(1);
  });
});
