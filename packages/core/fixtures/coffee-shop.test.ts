// The coffee shop fixture must stay the example in spec/settings.md.

import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { COFFEE_SHOP_SETTINGS } from "./coffee-shop.ts";

const SPEC_FILE = new URL("../../../spec/settings.md", import.meta.url);

async function exampleInSpec(): Promise<string> {
  const spec = await readFile(SPEC_FILE, "utf8");
  const start = spec.indexOf("```\n") + "```\n".length;
  const end = spec.indexOf("```", start);
  return spec.slice(start, end);
}

describe("the coffee shop settings fixture", () => {
  it("is the example in spec/settings.md", async () => {
    expect(await exampleInSpec()).toBe(COFFEE_SHOP_SETTINGS);
  });
});
