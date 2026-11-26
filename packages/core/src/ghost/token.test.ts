// The Ghost Admin API token, run inside workerd the way a Worker runs it.

import { decodeJwt, decodeProtectedHeader, jwtVerify } from "jose";
import { describe, expect, it } from "vitest";
import { MalformedAdminKeyError } from "./admin-key.ts";
import { adminToken } from "./token.ts";
import {
  COFFEE_SHOP_ADMIN_KEY,
  COFFEE_SHOP_KEY_ID,
  COFFEE_SHOP_KEY_SECRET,
  FIXED_TIME,
  FIXED_TIME_IN_SECONDS,
} from "../../fixtures/ghost-admin-key.ts";

function secretBytes(): Uint8Array {
  const bytes = new Uint8Array(COFFEE_SHOP_KEY_SECRET.length / 2);
  for (let index = 0; index < bytes.length; index++) {
    bytes[index] = parseInt(COFFEE_SHOP_KEY_SECRET.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

describe("adminToken", () => {
  it("has the header Ghost asks for", async () => {
    const token = await adminToken(COFFEE_SHOP_ADMIN_KEY, FIXED_TIME);
    const header = decodeProtectedHeader(token);
    expect(header).toEqual({ alg: "HS256", typ: "JWT", kid: COFFEE_SHOP_KEY_ID });
  });

  it("has the claims Ghost asks for", async () => {
    const token = await adminToken(COFFEE_SHOP_ADMIN_KEY, FIXED_TIME);
    const claims = decodeJwt(token);
    expect(claims).toEqual({
      iat: FIXED_TIME_IN_SECONDS,
      exp: FIXED_TIME_IN_SECONDS + 300,
      aud: "/admin/",
    });
  });

  it("ends 5 minutes after it is made", async () => {
    const token = await adminToken(COFFEE_SHOP_ADMIN_KEY, FIXED_TIME);
    const claims = decodeJwt(token);
    expect(Number(claims.exp) - Number(claims.iat)).toBe(5 * 60);
  });

  it("verifies with the hex decoded secret", async () => {
    const token = await adminToken(COFFEE_SHOP_ADMIN_KEY, FIXED_TIME);
    const verified = await jwtVerify(token, secretBytes(), {
      algorithms: ["HS256"],
      audience: "/admin/",
      currentDate: FIXED_TIME,
    });
    expect(verified.payload.aud).toBe("/admin/");
  });

  it("verifies with Web Crypto alone", async () => {
    const token = await adminToken(COFFEE_SHOP_ADMIN_KEY, FIXED_TIME);
    const [header, claims, signature] = token.split(".");
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      secretBytes(),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const signatureBytes = Uint8Array.from(atob(signature.replace(/-/g, "+").replace(/_/g, "/")), (character) =>
      character.charCodeAt(0),
    );
    const signed = new TextEncoder().encode(`${header}.${claims}`);
    const valid = await crypto.subtle.verify("HMAC", cryptoKey, signatureBytes, signed);
    expect(valid).toBe(true);
  });

  it("uses the real clock when no time is given", async () => {
    const before = Math.floor(Date.now() / 1000);
    const claims = decodeJwt(await adminToken(COFFEE_SHOP_ADMIN_KEY));
    expect(Number(claims.iat)).toBeGreaterThanOrEqual(before);
  });
});

describe("adminToken with a malformed key", () => {
  const malformedKeys = [
    "",
    COFFEE_SHOP_KEY_SECRET,
    `${COFFEE_SHOP_KEY_ID}:`,
    `:${COFFEE_SHOP_KEY_SECRET}`,
    `${COFFEE_SHOP_KEY_ID}:${COFFEE_SHOP_KEY_SECRET.slice(1)}`,
    `${COFFEE_SHOP_KEY_ID}:${COFFEE_SHOP_KEY_SECRET.slice(2)}zz`,
    `${COFFEE_SHOP_KEY_ID}x:${COFFEE_SHOP_KEY_SECRET}`,
    `${COFFEE_SHOP_KEY_ID}:${COFFEE_SHOP_KEY_SECRET}:extra`,
  ];

  for (const key of malformedKeys) {
    it(`refuses a key ${key.length} characters long`, async () => {
      await expect(adminToken(key, FIXED_TIME)).rejects.toThrow(MalformedAdminKeyError);
    });
  }

  it("never puts the key or its secret in the error", async () => {
    const leakyKey = `${COFFEE_SHOP_KEY_ID}:${COFFEE_SHOP_KEY_SECRET}0`;
    const error = await adminToken(leakyKey, FIXED_TIME).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(MalformedAdminKeyError);
    const shown = `${String(error)} ${(error as Error).stack ?? ""}`;
    expect(shown).not.toContain(COFFEE_SHOP_KEY_SECRET);
    expect(shown).not.toContain(COFFEE_SHOP_KEY_SECRET.slice(0, 16));
    expect(shown).not.toContain(COFFEE_SHOP_KEY_ID);
  });
});
