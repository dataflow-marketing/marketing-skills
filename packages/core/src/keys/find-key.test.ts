import { describe, expect, it } from "vitest";
import { COFFEE_SHOP_KEYS } from "../../fixtures/coffee-shop.ts";
import { findKey, MissingKeyError } from "./find-key.ts";
import { parseKeysFile } from "./parse-keys-file.ts";

describe("findKey", () => {
  const keys = parseKeysFile(COFFEE_SHOP_KEYS);

  it("gives back the named key", () => {
    expect(findKey(keys, "COFFEE_SHOP_API_KEY")).toBe("example-api-key");
  });

  it("refuses a missing key and names it", () => {
    expect(() => findKey(keys, "COFFEE_SHOP_MAILGUN_KEY")).toThrow(MissingKeyError);
    expect(() => findKey(keys, "COFFEE_SHOP_MAILGUN_KEY")).toThrow(/COFFEE_SHOP_MAILGUN_KEY/);
  });

  it("treats an empty key as missing", () => {
    expect(() => findKey(keys, "EMPTY_KEY")).toThrow(MissingKeyError);
  });

  it("never puts another key's name or value in an error", () => {
    const keysWithEmpty = { OTHER_KEY: "example-secret-value", EMPTY_KEY: "" };
    expect(() => findKey(keysWithEmpty, "EMPTY_KEY")).toThrow(MissingKeyError);
    let message = "";
    try {
      findKey(keysWithEmpty, "EMPTY_KEY");
    } catch (error) {
      message = String(error);
    }
    expect(message).not.toContain("example-secret-value");
    expect(message).not.toContain("OTHER_KEY");
  });
});
