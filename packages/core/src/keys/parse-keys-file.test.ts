import { describe, expect, it } from "vitest";
import { COFFEE_SHOP_KEYS } from "../../fixtures/coffee-shop.ts";
import { parseKeysFile } from "./parse-keys-file.ts";

describe("parseKeysFile", () => {
  const keys = parseKeysFile(COFFEE_SHOP_KEYS);

  it("reads plain, exported and quoted keys", () => {
    expect(keys.COFFEE_SHOP_GHOST_ADMIN_KEY).toBe("example-id:example-secret");
    expect(keys.CLOUDFLARE_API_TOKEN).toBe("example-cloudflare-token");
    expect(keys.COFFEE_SHOP_API_KEY).toBe("example-api-key");
  });

  it("skips comment lines: a commented out key is not read", () => {
    expect(Object.keys(keys)).toEqual([
      "COFFEE_SHOP_GHOST_ADMIN_KEY",
      "CLOUDFLARE_API_TOKEN",
      "COFFEE_SHOP_API_KEY",
      "EMPTY_KEY",
      "NOTED_KEY",
    ]);
  });

  it("leaves a note after a value out of the value", () => {
    expect(keys.NOTED_KEY).toBe("example-noted");
    expect(keys.CLOUDFLARE_API_TOKEN).toBe("example-cloudflare-token");
  });
});
