import { describe, expect, it } from "vitest";
import { findSites } from "./find-sites.ts";

describe("findSites", () => {
  it("finds each Ghost site the facts name, once", () => {
    const facts = [{ source: "ghost coffee-shop new members" }, { source: "ghost coffee-shop email opens" }, { source: "told" }];
    const sites = [{ business: "coffee-shop", platform: "ghost", address: "https://coffee-shop.example/", keyName: "GHOST" }];
    expect(findSites(facts, sites)).toEqual({ sites: [{ name: "coffee-shop", address: "https://coffee-shop.example", keyName: "GHOST" }], problems: [] });
  });

  it("finds nothing when no fact comes from Ghost", () => {
    expect(findSites([{ source: "told" }], [])).toEqual({ sites: [], problems: [] });
  });

  it("says to run site-add when there is no Ghost line", () => {
    expect(findSites([{ source: "ghost coffee-shop new members" }], []).problems).toEqual(["No Ghost line for coffee-shop in settings: run dfm-ghost:site-add for it"]);
  });
});
