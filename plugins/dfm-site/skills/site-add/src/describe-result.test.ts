import { describe, expect, it } from "vitest";
import { describeAdded, describePlan } from "./describe-result.ts";
import { planAdd } from "./plan-add.ts";
import { COFFEE_SHOP_SITE, COFFEE_SHOP_SITE_LINE } from "../../../fixtures/coffee-shop.ts";

describe("describe", () => {
  it("says a preview wrote nothing", () => {
    const plan = planAdd(undefined, COFFEE_SHOP_SITE, "Australia/Melbourne");
    expect(describePlan(plan, "settings.txt").text).toContain("preview: nothing written");
  });

  it("says what was added and the read back", () => {
    const text = describeAdded([COFFEE_SHOP_SITE_LINE], "settings.txt", []).text;
    expect(text).toContain(COFFEE_SHOP_SITE_LINE);
    expect(text).toContain("read back: the site is there");
  });
});
