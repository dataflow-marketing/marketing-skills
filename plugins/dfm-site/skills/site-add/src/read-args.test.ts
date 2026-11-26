import { describe, expect, it } from "vitest";
import { readArgs } from "./read-args.ts";

describe("readArgs", () => {
  const args = ["--name", "coffee-shop", "--address", "https://coffee-shop.example", "--settings", "settings.txt"];

  it("reads the site and the settings file, with no key", () => {
    expect(readArgs([...args, "--go", "--json"])).toEqual({
      ok: true,
      args: { name: "coffee-shop", address: "https://coffee-shop.example", settings: "settings.txt" },
    });
  });

  it("refuses a key, as a public site has none", () => {
    expect(readArgs([...args, "--key-name", "COFFEE_SHOP_KEY"]).ok).toBe(false);
  });

  it("reads the time zone for a new settings file", () => {
    const read = readArgs([...args, "--time-zone", "Australia/Melbourne"]);
    expect(read.ok && read.args.timeZone).toBe("Australia/Melbourne");
  });
});
