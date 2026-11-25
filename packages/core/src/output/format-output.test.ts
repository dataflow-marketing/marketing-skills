import { describe, expect, it } from "vitest";
import { formatOutput } from "./format-output.ts";

describe("formatOutput", () => {
  const result = {
    text: "site coffee-shop: ghost https://coffee-shop.example",
    data: { business: "coffee-shop", platform: "ghost" },
  };

  it("gives the text for a person", () => {
    expect(formatOutput(result, "text")).toBe(result.text);
  });

  it("gives JSON another script can read", () => {
    expect(JSON.parse(formatOutput(result, "json"))).toEqual(result.data);
  });
});
