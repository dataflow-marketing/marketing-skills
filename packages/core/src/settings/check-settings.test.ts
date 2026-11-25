import { describe, expect, it } from "vitest";
import { COFFEE_SHOP_SETTINGS } from "../../fixtures/coffee-shop.ts";
import { checkSettings } from "./check-settings.ts";
import { parseSettings } from "./parse-settings.ts";

describe("checkSettings on the coffee shop", () => {
  it("finds nothing wrong", () => {
    expect(checkSettings(parseSettings(COFFEE_SHOP_SETTINGS).settings)).toEqual([]);
  });
});

describe("checkSettings on settings that would break a skill", () => {
  it("stops on a missing time zone", () => {
    const problems = checkSettings(parseSettings("spec 1\n").settings);
    expect(problems).toEqual(["time zone: missing (it is required)"]);
  });

  it("stops on a time zone it does not know", () => {
    const problems = checkSettings(parseSettings("spec 1\ntime zone: Mars/Base\n").settings);
    expect(problems).toEqual(["time zone: not a known time zone (for example Australia/Melbourne)"]);
  });

  it("stops on a week start that is not a day", () => {
    const problems = checkSettings(parseSettings("spec 1\ntime zone: Australia/Melbourne\nweek starts: Funday\n").settings);
    expect(problems).toEqual(["week starts: not a day of the week (for example Monday)"]);
  });

  it("stops on a binding to a store that is not listed", () => {
    const text = "spec 1\ntime zone: Australia/Melbourne\nbinding ledger coffee-shop: members field next\n";
    const problems = checkSettings(parseSettings(text).settings);
    expect(problems).toEqual(['binding ledger coffee-shop: the store "members" is not listed']);
  });
});
