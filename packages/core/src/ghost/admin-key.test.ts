import { describe, expect, it } from "vitest";
import { COFFEE_SHOP_ADMIN_KEY, COFFEE_SHOP_KEY_ID } from "../../fixtures/ghost-admin-key.ts";
import { MalformedAdminKeyError, parseAdminKey } from "./admin-key.ts";

describe("parseAdminKey", () => {
  it("splits a key into its id and its secret as bytes", () => {
    const key = parseAdminKey(COFFEE_SHOP_ADMIN_KEY);
    expect(key.id).toBe(COFFEE_SHOP_KEY_ID);
    expect(key.secret.length).toBe(32);
    expect(key.secret[0]).toBe(0x01);
  });

  it("allows spaces around a pasted key", () => {
    expect(parseAdminKey(` ${COFFEE_SHOP_ADMIN_KEY}\n`).id).toBe(COFFEE_SHOP_KEY_ID);
  });

  it("refuses a key not in the id:secret form", () => {
    expect(() => parseAdminKey("not-a-key")).toThrow(MalformedAdminKeyError);
  });
});
