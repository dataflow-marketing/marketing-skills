import { afterEach, describe, expect, it, vi } from "vitest";
import { printOutput } from "./print-output.ts";

const result = {
  text: "site coffee-shop: ghost https://coffee-shop.example",
  data: { business: "coffee-shop" },
};

function printed(mode: "text" | "json"): string {
  const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  printOutput(result, mode);
  return String(write.mock.calls[0][0]);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("printOutput", () => {
  it("prints the text for a person, ending the line", () => {
    expect(printed("text")).toBe(`${result.text}\n`);
  });

  it("prints JSON another script can read", () => {
    expect(JSON.parse(printed("json"))).toEqual(result.data);
  });
});
