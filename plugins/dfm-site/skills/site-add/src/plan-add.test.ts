import { describe, expect, it } from "vitest";
import { planAdd } from "./plan-add.ts";
import { COFFEE_SHOP_SITE, COFFEE_SHOP_SITE_LINE } from "../../../fixtures/coffee-shop.ts";

const SETTINGS = "spec 1\ntime zone: Australia/Melbourne\n";

describe("planAdd", () => {
  it("starts a new settings file with spec 1, the time zone and the site", () => {
    expect(planAdd(undefined, COFFEE_SHOP_SITE, "Australia/Melbourne")).toEqual({
      kind: "add",
      lines: [COFFEE_SHOP_SITE_LINE],
      append: `${SETTINGS}${COFFEE_SHOP_SITE_LINE}\n`,
      newFile: true,
    });
  });

  it("asks for the time zone before starting a settings file", () => {
    const plan = planAdd(undefined, COFFEE_SHOP_SITE);
    expect(plan.kind === "refused" && plan.problem).toMatch(/--time-zone/);
  });

  it("adds the site to settings with no keys file", () => {
    const plan = planAdd(SETTINGS, COFFEE_SHOP_SITE);
    expect(plan.kind === "add" && plan.append).toBe(`${COFFEE_SHOP_SITE_LINE}\n`);
  });

  it("leaves a site that is already there alone", () => {
    expect(planAdd(`${SETTINGS}${COFFEE_SHOP_SITE_LINE}\n`, COFFEE_SHOP_SITE).kind).toBe("already there");
  });

  it("refuses a site of the same name on another platform", () => {
    const ghost = `${SETTINGS}site coffee-shop: ghost https://coffee-shop.example key in COFFEE_SHOP_GHOST_ADMIN_KEY\n`;
    expect(planAdd(ghost, COFFEE_SHOP_SITE).kind).toBe("refused");
  });

  it("refuses settings that already have problems until they are fixed", () => {
    expect(planAdd("spec 1\nweek starts: Funday\n", COFFEE_SHOP_SITE).kind).toBe("refused");
  });
});
