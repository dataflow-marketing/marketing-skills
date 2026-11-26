import { describe, expect, it } from "vitest";
import { COFFEE_SHOP_SETTINGS } from "../../fixtures/coffee-shop.ts";
import { parseSettings } from "./parse-settings.ts";

describe("parseSettings on the coffee shop", () => {
  const { settings, problems } = parseSettings(COFFEE_SHOP_SETTINGS);

  it("finds no problems", () => {
    expect(problems).toEqual([]);
  });

  it("reads the time zone, week start, keys file and backups folder", () => {
    expect(settings.spec).toBe("spec 1");
    expect(settings.timeZone).toBe("Australia/Melbourne");
    expect(settings.weekStarts).toBe("Monday");
    expect(settings.keysFile).toBe("~/.config/dfm/.env");
    expect(settings.backups).toBe("~/.config/dfm/backups");
  });

  it("reads both sites with the names of their keys", () => {
    expect(settings.sites).toEqual([
      {
        business: "coffee-shop",
        platform: "ghost",
        address: "https://coffee-shop.example",
        keyName: "COFFEE_SHOP_GHOST_ADMIN_KEY",
      },
      {
        business: "coffee-shop",
        platform: "cloudflare",
        address: "coffee-shop.example",
        account: "0123456789abcdef0123456789abcdef",
        keyName: "CLOUDFLARE_API_TOKEN",
      },
    ]);
  });

  it("reads the three stores, with a key only where one is named", () => {
    expect(settings.stores).toEqual([
      { name: "notes", connector: "file", where: "~/dfm/ledgers" },
      { name: "members", connector: "ghost", where: "coffee-shop" },
      {
        name: "api",
        connector: "rest",
        where: "https://api.coffee-shop.example",
        keyName: "COFFEE_SHOP_API_KEY",
      },
    ]);
  });

  it("reads which store holds each object", () => {
    expect(settings.bindings).toEqual([
      { object: "ledger", business: "coffee-shop", store: "members", place: "owner@coffee-shop.example next" },
      { object: "profile", business: "coffee-shop", store: "members", place: "owner@coffee-shop.example context" },
      { object: "people", business: "coffee-shop", store: "notes", place: "people/coffee-shop.txt" },
    ]);
  });

  it("reads the house rules", () => {
    expect(settings.houseRules).toEqual([
      { name: "spelling", rule: "Australian English" },
      { name: "message length", rule: "three sentences at most" },
      { name: "avoid", rule: "em dashes" },
    ]);
  });
});

describe("parseSettings on lines it cannot read", () => {
  it("names a missing spec line", () => {
    const { problems } = parseSettings("time zone: Australia/Melbourne\n");
    expect(problems).toEqual(['line 1: expected "spec 1"', "time zone: missing (it is required)"]);
  });

  it("names a line it does not understand by its kind and keeps the rest", () => {
    const text = "spec 1\ntime zone: Australia/Melbourne\nweek starts: Sunday\nsite coffee-shop: ghost\n";
    const { settings, problems } = parseSettings(text);
    expect(settings.weekStarts).toBe("Sunday");
    expect(settings.sites).toEqual([]);
    expect(problems).toEqual(["line 4: a site line that is not understood"]);
  });

  it("never prints back a key pasted into settings", () => {
    const text = "spec 1\ntime zone: Australia/Melbourne\nsite coffee-shop: ghost https://coffee-shop.example key abc123:example-secret\nabc123:example-secret\n";
    const { problems } = parseSettings(text);
    expect(problems).toEqual(["line 3: a site line that is not understood", "line 4: not understood"]);
    expect(problems.join(" ")).not.toContain("example-secret");
  });

  it("starts the week on Monday when settings do not say", () => {
    const { settings } = parseSettings("spec 1\ntime zone: Australia/Melbourne\n");
    expect(settings.weekStarts).toBe("Monday");
  });
});

describe("parseSettings on a line given twice", () => {
  it("stops on a line that may be given once given twice", () => {
    const text = "spec 1\ntime zone: Australia/Melbourne\ntime zone: Europe/London\n";
    const { problems } = parseSettings(text);
    expect(problems).toEqual(["line 3: time zone is given more than once"]);
  });

  it("stops on a backups line given twice", () => {
    const text = "spec 1\ntime zone: Australia/Melbourne\nbackups: ~/a\nbackups: ~/b\n";
    const { problems } = parseSettings(text);
    expect(problems).toEqual(["line 4: backups is given more than once"]);
  });
});
