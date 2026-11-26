import { describe, expect, it } from "vitest";
import { readBindingLine, readHouseRuleLine, readSiteLine, readStoreLine, readValueAfter } from "./read-line.ts";

describe("readSiteLine", () => {
  it("reads a site with the name of its key", () => {
    const line = "site coffee-shop: ghost https://coffee-shop.example key in COFFEE_SHOP_GHOST_ADMIN_KEY";
    expect(readSiteLine(line)).toEqual({
      business: "coffee-shop",
      platform: "ghost",
      address: "https://coffee-shop.example",
      keyName: "COFFEE_SHOP_GHOST_ADMIN_KEY",
    });
  });

  it("reads a public site, which has no key", () => {
    expect(readSiteLine("site coffee-shop: public https://coffee-shop.example")).toEqual({
      business: "coffee-shop",
      platform: "public",
      address: "https://coffee-shop.example",
    });
  });

  it("refuses a site line with no address", () => {
    expect(readSiteLine("site coffee-shop: ghost")).toBeUndefined();
  });
});

describe("readStoreLine", () => {
  it("reads a store with no key", () => {
    expect(readStoreLine("store notes: file ~/dfm/ledgers")).toEqual({
      name: "notes",
      connector: "file",
      where: "~/dfm/ledgers",
    });
  });

  it("reads a store with a key", () => {
    expect(readStoreLine("store api: rest https://api.coffee-shop.example key in COFFEE_SHOP_API_KEY")).toEqual({
      name: "api",
      connector: "rest",
      where: "https://api.coffee-shop.example",
      keyName: "COFFEE_SHOP_API_KEY",
    });
  });

  it("refuses a store with nothing after its connector", () => {
    expect(readStoreLine("store notes: file")).toBeUndefined();
  });
});

describe("readBindingLine", () => {
  it("reads which store holds an object", () => {
    expect(readBindingLine("binding ledger coffee-shop: members field next")).toEqual({
      object: "ledger",
      business: "coffee-shop",
      store: "members",
      place: "field next",
    });
  });

  it("refuses a binding with no place", () => {
    expect(readBindingLine("binding ledger coffee-shop: members")).toBeUndefined();
  });
});

describe("readHouseRuleLine", () => {
  it("reads a rule whose name has spaces", () => {
    expect(readHouseRuleLine("house rule message length: three sentences at most")).toEqual({
      name: "message length",
      rule: "three sentences at most",
    });
  });
});

describe("readValueAfter", () => {
  it("gives the value after the prefix", () => {
    expect(readValueAfter("time zone:", "time zone: Australia/Melbourne")).toBe("Australia/Melbourne");
  });

  it("gives nothing for another kind of line or an empty value", () => {
    expect(readValueAfter("time zone:", "week starts: Monday")).toBeUndefined();
    expect(readValueAfter("time zone:", "time zone:")).toBeUndefined();
  });
});
