import { describe, expect, it } from "vitest";
import { checkPlan } from "./check-plan.ts";
import { COFFEE_SHOP_LEDGER, COFFEE_SHOP_SETTINGS } from "../../../fixtures/coffee-shop.ts";

describe("checkPlan", () => {
  it("passes the coffee shop", () => {
    expect(checkPlan(COFFEE_SHOP_LEDGER, COFFEE_SHOP_SETTINGS)).toEqual({ problems: [], setAside: [], ledgerChecked: true });
  });

  it("names every kind of problem in a ledger", () => {
    const broken = COFFEE_SHOP_LEDGER.replace("every week open the cafe", "every week market stall")
      .concat("2026-11-16 fact total stamp cards started: 20\n2026-11-16 fact count emails sent: 3\nnot a line\n");
    const kinds = checkPlan(broken).problems.map((problem) => problem.kind);
    expect(kinds).toEqual(["unreadable line", "fact not declared", "step with no link", "count and total in one week"]);
  });

  it("does not read the ledger while the settings have problems", () => {
    const result = checkPlan(COFFEE_SHOP_LEDGER, "spec 1\n");
    expect(result.ledgerChecked).toBe(false);
    expect(result.problems[0].kind).toBe("settings");
  });

  it("sets aside a line with a new spec 1 word, never as a problem", () => {
    const result = checkPlan(COFFEE_SHOP_LEDGER.replace("=== plan ===", "limit seats: 24\n=== plan ==="));
    expect(result.problems).toEqual([]);
    expect(result.setAside).toEqual([{ word: "limit", line: 7 }]);
  });
});
