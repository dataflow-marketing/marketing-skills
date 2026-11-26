import { describe, expect, it } from "vitest";
import { currencyOf, findMoney } from "./find-money.ts";

function keys(line: string): string[] {
  return findMoney(line).map((amount) => amount.key);
}

describe("findMoney", () => {
  it("finds an amount with its currency", () => {
    expect(keys("A large iced coffee is $5.50.")).toEqual(["dollar 5.5"]);
    expect(keys("A bag of beans is AUD 18 or 18 dollars.")).toEqual(["AUD 18", "dollar 18"]);
    expect(keys("Cake is \u00A34 and \u20AC4.")).toEqual(["GBP 4", "EUR 4"]);
  });

  it("finds a currency named with no amount", () => {
    expect(keys("Prices are in USD.")).toEqual(["USD"]);
  });

  it("gives the currency of a key", () => {
    expect(currencyOf("dollar 5.5")).toBe("dollar");
  });
});
