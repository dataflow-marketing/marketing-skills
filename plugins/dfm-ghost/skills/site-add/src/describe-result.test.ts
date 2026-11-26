import { describe, expect, it } from "vitest";
import { describeAdded, describePlan, describeReplaced } from "./describe-result.ts";
import { planAdd } from "./plan-add.ts";
import { COFFEE_SHOP_SITE, COFFEE_SHOP_SITE_LINE } from "../../../fixtures/coffee-shop.ts";

describe("describe", () => {
  it("says a preview wrote nothing", () => {
    const plan = planAdd(undefined, COFFEE_SHOP_SITE, { timeZone: "Australia/Melbourne", keysFile: "~/.config/dfm/.env" });
    expect(describePlan(plan, "settings.txt").text).toContain("preview: nothing written");
  });

  it("says what was added and the read back", () => {
    const text = describeAdded([COFFEE_SHOP_SITE_LINE], "settings.txt", []).text;
    expect(text).toContain(COFFEE_SHOP_SITE_LINE);
    expect(text).toContain("read back: the site is there");
  });

  it("shows the public line a Ghost site replaces", () => {
    const plan = { kind: "replace" as const, replaces: "site coffee-shop: public https://coffee-shop.example", lines: [COFFEE_SHOP_SITE_LINE], text: "" };
    const text = describePlan(plan, "settings.txt").text;
    expect(text).toContain("would replace in settings.txt:\nsite coffee-shop: public https://coffee-shop.example\nwith:");
  });

  it("says a public line is only taken out when the Ghost line is already there", () => {
    const plan = { kind: "replace" as const, replaces: "site coffee-shop: public https://coffee-shop.example", lines: [], text: "" };
    expect(describePlan(plan, "settings.txt").text).toContain("would take out of settings.txt:");
    expect(describeReplaced(plan, "settings.txt", []).text).toContain("took out of settings.txt:");
  });
});
