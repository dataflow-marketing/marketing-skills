import { describe, expect, it } from "vitest";
import { readArgs } from "./read-args.ts";
import { COFFEE_SHOP_ADDRESS, COFFEE_SHOP_KEY_NAME } from "../../../fixtures/coffee-shop.ts";

describe("readArgs", () => {
  const args = ["--name", "coffee-shop", "--address", COFFEE_SHOP_ADDRESS, "--key-name", COFFEE_SHOP_KEY_NAME, "--settings", "settings.txt"];

  it("reads the site and the settings file", () => {
    expect(readArgs([...args, "--go", "--json"])).toEqual({
      ok: true,
      args: { name: "coffee-shop", address: COFFEE_SHOP_ADDRESS, keyName: COFFEE_SHOP_KEY_NAME, settings: "settings.txt" },
    });
  });

  it("refuses when something is missing or not understood", () => {
    expect(readArgs(args.slice(0, 6)).ok).toBe(false);
    expect(readArgs([...args, "--key", "abc"]).ok).toBe(false);
  });

  it("reads the time zone for a new settings file", () => {
    const read = readArgs([...args, "--time-zone", "Australia/Melbourne"]);
    expect(read.ok && read.args.timeZone).toBe("Australia/Melbourne");
  });
});
