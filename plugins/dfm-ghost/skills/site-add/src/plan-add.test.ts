import { describe, expect, it } from "vitest";
import { planAdd } from "./plan-add.ts";
import { COFFEE_SHOP_SITE, COFFEE_SHOP_SITE_LINE } from "../../../fixtures/coffee-shop.ts";

describe("planAdd", () => {
  it("starts a new settings file with spec 1 and the time zone it is given", () => {
    expect(planAdd(undefined, COFFEE_SHOP_SITE, "Australia/Melbourne")).toEqual({
      kind: "add",
      line: COFFEE_SHOP_SITE_LINE,
      append: `spec 1\ntime zone: Australia/Melbourne\n${COFFEE_SHOP_SITE_LINE}\n`,
      newFile: true,
    });
  });

  it("asks for the time zone before starting a new settings file", () => {
    const plan = planAdd(undefined, COFFEE_SHOP_SITE);
    expect(plan.kind).toBe("refused");
    expect(plan.kind === "refused" && plan.problem).toMatch(/--time-zone/);
  });

  it("refuses a time zone it does not know", () => {
    expect(planAdd(undefined, COFFEE_SHOP_SITE, "Mars/Base").kind).toBe("refused");
  });

  it("refuses settings that already have problems until they are fixed", () => {
    const plan = planAdd("spec 1\nweek starts: Funday\n", COFFEE_SHOP_SITE);
    expect(plan.kind === "refused" && plan.problem).toMatch(/Fix the settings file first/);
  });

  it("adds the line on a line of its own", () => {
    const plan = planAdd("spec 1\ntime zone: Australia/Melbourne", COFFEE_SHOP_SITE);
    expect(plan.kind === "add" && plan.append).toBe(`\n${COFFEE_SHOP_SITE_LINE}\n`);
  });

  it("leaves a site that is already there alone", () => {
    const settings = `spec 1\ntime zone: Australia/Melbourne\n${COFFEE_SHOP_SITE_LINE}\n`;
    expect(planAdd(settings, COFFEE_SHOP_SITE).kind).toBe("already there");
  });

  it("refuses to change a Ghost site of the same name", () => {
    const other = "spec 1\ntime zone: Australia/Melbourne\nsite coffee-shop: ghost https://old.coffee-shop.example key in OLD_KEY\n";
    expect(planAdd(other, COFFEE_SHOP_SITE).kind).toBe("refused");
  });

  it("refuses a file that is not settings", () => {
    expect(planAdd("shopping list\n", COFFEE_SHOP_SITE).kind).toBe("refused");
  });
});
