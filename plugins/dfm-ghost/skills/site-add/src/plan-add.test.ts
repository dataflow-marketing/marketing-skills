import { describe, expect, it } from "vitest";
import { planAdd } from "./plan-add.ts";
import { COFFEE_SHOP_SITE, COFFEE_SHOP_SITE_LINE } from "../../../fixtures/coffee-shop.ts";

const NEW_FILE = { timeZone: "Australia/Melbourne", keysFile: "~/.config/dfm/.env" };
const SETTINGS = "spec 1\ntime zone: Australia/Melbourne\nkeys file: ~/.config/dfm/.env\n";

describe("planAdd for a new settings file", () => {
  it("starts it with spec 1, the time zone, the keys file and the site", () => {
    expect(planAdd(undefined, COFFEE_SHOP_SITE, NEW_FILE)).toEqual({
      kind: "add",
      lines: ["keys file: ~/.config/dfm/.env", COFFEE_SHOP_SITE_LINE],
      append: `${SETTINGS}${COFFEE_SHOP_SITE_LINE}\n`,
      newFile: true,
    });
  });

  it("asks for the time zone before starting one", () => {
    const plan = planAdd(undefined, COFFEE_SHOP_SITE, { keysFile: "~/.config/dfm/.env" });
    expect(plan.kind === "refused" && plan.problem).toMatch(/--time-zone/);
  });

  it("asks for the keys file before starting one", () => {
    const plan = planAdd(undefined, COFFEE_SHOP_SITE, { timeZone: "Australia/Melbourne" });
    expect(plan.kind === "refused" && plan.problem).toMatch(/--keys-file/);
  });

  it("refuses a time zone it does not know", () => {
    expect(planAdd(undefined, COFFEE_SHOP_SITE, { ...NEW_FILE, timeZone: "Mars/Base" }).kind).toBe("refused");
  });
});

describe("planAdd for settings already there", () => {
  it("adds the site on a line of its own", () => {
    const plan = planAdd(SETTINGS.trimEnd(), COFFEE_SHOP_SITE);
    expect(plan.kind === "add" && plan.append).toBe(`\n${COFFEE_SHOP_SITE_LINE}\n`);
  });

  it("leaves a site that is already there alone", () => {
    expect(planAdd(`${SETTINGS}${COFFEE_SHOP_SITE_LINE}\n`, COFFEE_SHOP_SITE).kind).toBe("already there");
  });

  it("asks for the keys file when settings name none", () => {
    const plan = planAdd("spec 1\ntime zone: Australia/Melbourne\n", COFFEE_SHOP_SITE);
    expect(plan.kind === "refused" && plan.problem).toMatch(/--keys-file/);
  });

  it("adds the keys file line with the site when it is given", () => {
    const plan = planAdd("spec 1\ntime zone: Australia/Melbourne\n", COFFEE_SHOP_SITE, { keysFile: "~/.config/dfm/.env" });
    expect(plan.kind === "add" && plan.lines).toEqual(["keys file: ~/.config/dfm/.env", COFFEE_SHOP_SITE_LINE]);
  });

  it("adds only the keys file line when the site is already there", () => {
    const settings = `spec 1\ntime zone: Australia/Melbourne\n${COFFEE_SHOP_SITE_LINE}\n`;
    const plan = planAdd(settings, COFFEE_SHOP_SITE, { keysFile: "~/.config/dfm/.env" });
    expect(plan.kind === "add" && plan.append).toBe("keys file: ~/.config/dfm/.env\n");
  });

  it("refuses to change a Ghost site of the same name", () => {
    const other = `${SETTINGS}site coffee-shop: ghost https://old.coffee-shop.example key in OLD_KEY\n`;
    expect(planAdd(other, COFFEE_SHOP_SITE).kind).toBe("refused");
  });

  it("refuses settings that already have problems until they are fixed", () => {
    const plan = planAdd("spec 1\nweek starts: Funday\n", COFFEE_SHOP_SITE);
    expect(plan.kind === "refused" && plan.problem).toMatch(/Fix the settings file first/);
  });

  it("refuses a file that is not settings", () => {
    expect(planAdd("shopping list\n", COFFEE_SHOP_SITE).kind).toBe("refused");
  });

  it("turns a public site of the same name into the Ghost site, replacing its line", () => {
    const settings = `${SETTINGS}site coffee-shop: public https://coffee-shop.example\nhouse rule spelling: Australian English\n`;
    const plan = planAdd(settings, COFFEE_SHOP_SITE);
    expect(plan).toEqual({
      kind: "replace",
      replaces: "site coffee-shop: public https://coffee-shop.example",
      lines: [COFFEE_SHOP_SITE_LINE],
      text: `${SETTINGS}${COFFEE_SHOP_SITE_LINE}\nhouse rule spelling: Australian English\n`,
    });
  });

  it("adds the keys file line with it when settings name none", () => {
    const settings = "spec 1\ntime zone: Australia/Melbourne\nsite coffee-shop: public https://coffee-shop.example\n";
    const plan = planAdd(settings, COFFEE_SHOP_SITE, { keysFile: "~/.config/dfm/.env" });
    expect(plan.kind === "replace" && plan.lines).toEqual([COFFEE_SHOP_SITE_LINE, "keys file: ~/.config/dfm/.env"]);
  });
});

describe("planAdd for a site already named twice", () => {
  it("takes the public line out when the same Ghost line is already there, leaving one line", () => {
    const settings = `${SETTINGS}site coffee-shop: public https://coffee-shop.example\n${COFFEE_SHOP_SITE_LINE}\n`;
    const plan = planAdd(settings, COFFEE_SHOP_SITE);
    expect(plan.kind === "replace" && plan.text).toBe(`${SETTINGS}${COFFEE_SHOP_SITE_LINE}\n`);
  });

  it("refuses when a different Ghost line of the same name is there too", () => {
    const settings = `${SETTINGS}site coffee-shop: public https://coffee-shop.example\nsite coffee-shop: ghost https://old.coffee-shop.example key in OLD_KEY\n`;
    expect(planAdd(settings, COFFEE_SHOP_SITE).kind).toBe("refused");
  });

  it("replaces a public line that names a key too", () => {
    const settings = `${SETTINGS}site coffee-shop: public https://coffee-shop.example key in OLD_KEY\n`;
    const plan = planAdd(settings, COFFEE_SHOP_SITE);
    expect(plan.kind === "replace" && plan.text).toBe(`${SETTINGS}${COFFEE_SHOP_SITE_LINE}\n`);
  });

  it("refuses two public lines of the same name rather than guess which to replace", () => {
    const settings = `${SETTINGS}site coffee-shop: public https://coffee-shop.example\nsite coffee-shop: public https://www.coffee-shop.example\n`;
    expect(planAdd(settings, COFFEE_SHOP_SITE).kind).toBe("refused");
  });
});
