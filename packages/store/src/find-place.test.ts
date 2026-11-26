import { parseSettings } from "@dataflow-marketing/core";
import { describe, expect, it } from "vitest";
import { findPlace } from "./find-place.ts";

const SETTINGS = `spec 1
time zone: Australia/Melbourne
site coffee-shop: ghost https://coffee-shop.example key in COFFEE_SHOP_GHOST_ADMIN_KEY
keys file: ~/.config/dfm/.env
store notes: file ~/dfm/ledgers/
store members: ghost coffee-shop
store api: rest https://api.coffee-shop.example key in COFFEE_SHOP_API_KEY
binding ledger coffee-shop: members owner@coffee-shop.example next
binding people coffee-shop: notes people/coffee-shop.txt
binding forecast coffee-shop: api coffee-shop
`;

function placeOf(text: string, object: string, business = "coffee-shop") {
  return findPlace(parseSettings(text), object, business);
}

describe("findPlace", () => {
  it("finds a member's field in a Ghost store", () => {
    expect(placeOf(SETTINGS, "ledger")).toEqual({
      ok: true,
      place: {
        connector: "ghost",
        site: {
          business: "coffee-shop",
          platform: "ghost",
          address: "https://coffee-shop.example",
          keyName: "COFFEE_SHOP_GHOST_ADMIN_KEY",
        },
        keysFile: "~/.config/dfm/.env",
        email: "owner@coffee-shop.example",
        field: "next",
        label: "ghost coffee-shop member owner@coffee-shop.example field next",
      },
    });
  });

  it("finds a file under a file store's folder", () => {
    expect(placeOf(SETTINGS, "people")).toEqual({
      ok: true,
      place: { connector: "file", path: "~/dfm/ledgers/people/coffee-shop.txt", label: "file ~/dfm/ledgers/people/coffee-shop.txt" },
    });
  });

  it("keeps an object with no binding in the working folder", () => {
    expect(placeOf(SETTINGS, "profile")).toEqual({
      ok: true,
      place: { connector: "file", path: "profile.txt", label: "file profile.txt (no binding: the working folder)" },
    });
  });

  it("refuses the rest connector, not built yet", () => {
    expect(placeOf(SETTINGS, "forecast")).toEqual({
      ok: false,
      problems: ['The store "api" is a rest store. The rest connector is not built yet.'],
    });
  });

  it("refuses settings with problems", () => {
    const result = placeOf(`${SETTINGS}binding profile coffee-shop: nowhere x\n`, "profile");
    expect(result.ok).toBe(false);
  });

  it("refuses an object bound twice", () => {
    const text = `${SETTINGS}binding ledger coffee-shop: notes ledger.txt\n`;
    expect(placeOf(text, "ledger")).toEqual({
      ok: false,
      problems: ["Settings bind the ledger of coffee-shop more than once. Keep one binding line."],
    });
  });

  it("refuses a file place that climbs out of the store's folder", () => {
    const text = SETTINGS.replace("notes people/coffee-shop.txt", "notes ../secrets.txt");
    expect(placeOf(text, "people").ok).toBe(false);
  });

  it("refuses a Ghost place that is not an email and a field", () => {
    const text = SETTINGS.replace("members owner@coffee-shop.example next", "members field next");
    expect(placeOf(text, "ledger")).toEqual({
      ok: false,
      problems: ["The place of the ledger of coffee-shop must be a member's email and a field, such as: owner@example.com next"],
    });
  });

  it("refuses a Ghost store whose site is not in settings", () => {
    const text = SETTINGS.replace("store members: ghost coffee-shop", "store members: ghost bakery");
    expect(placeOf(text, "ledger")).toEqual({
      ok: false,
      problems: ['The store "members" names the Ghost site bakery, which settings do not have. Add it with dfm-ghost:site-add.'],
    });
  });

  it("refuses names that are not lowercase with hyphens", () => {
    expect(placeOf(SETTINGS, "Ledger").ok).toBe(false);
  });
});
