import { describe, expect, it } from "vitest";
import { findSites } from "./find-sites.ts";

const NEW_MEMBERS = { fact: "new subscribers", site: "coffee-shop", measure: "new members" as const };
const OPENS = { fact: "opens", site: "coffee-shop", measure: "email opens" as const };

describe("findSites", () => {
  it("finds the one Ghost line for a site named by two facts", () => {
    const sites = [
      { business: "coffee-shop", platform: "cloudflare", address: "coffee-shop.example", account: "abc", keyName: "CF" },
      { business: "coffee-shop", platform: "ghost", address: "https://coffee-shop.example/", keyName: "GHOST" },
    ];
    expect(findSites([NEW_MEMBERS, OPENS], sites)).toEqual({
      sites: [{ name: "coffee-shop", address: "https://coffee-shop.example", keyName: "GHOST" }],
      problems: [],
    });
  });

  it("says to add the site when there is no Ghost line", () => {
    expect(findSites([NEW_MEMBERS], []).problems).toEqual(["No Ghost line for coffee-shop in settings: run dfm-ghost:site-add for it"]);
  });
});
