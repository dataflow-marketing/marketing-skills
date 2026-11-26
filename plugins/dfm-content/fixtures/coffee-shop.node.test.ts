// The coffee shop profile in the fixtures is the example profile word for word.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { COFFEE_SHOP_PROFILE } from "./coffee-shop.ts";

const EXAMPLE = fileURLToPath(new URL("../../../examples/coffee-shop/profile.txt", import.meta.url));

describe("the coffee shop fixture", () => {
  it("is examples/coffee-shop/profile.txt", async () => {
    expect(COFFEE_SHOP_PROFILE).toBe(await readFile(EXAMPLE, "utf8"));
  });
});
