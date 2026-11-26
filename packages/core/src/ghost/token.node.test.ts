// token.ts checked against Node: the token matches the Node crypto way of making it, byte for byte, given the
// same key and the same time. A .node.test.ts file runs in Node: workerd has no node:crypto.

import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { adminToken } from "./token.ts";
import {
  COFFEE_SHOP_ADMIN_KEY,
  COFFEE_SHOP_KEY_ID,
  COFFEE_SHOP_KEY_SECRET,
  FIXED_TIME,
  FIXED_TIME_IN_SECONDS,
} from "../../fixtures/ghost-admin-key.ts";

// The reference: an HS256 JWT made by hand with node:crypto.
function encodePart(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function nodeCryptoToken(id: string, secret: string, issuedAt: number): string {
  const header = encodePart({ alg: "HS256", typ: "JWT", kid: id });
  const claims = encodePart({ iat: issuedAt, exp: issuedAt + 300, aud: "/admin/" });
  const unsigned = `${header}.${claims}`;
  const hmac = createHmac("sha256", Buffer.from(secret, "hex"));
  const signature = hmac.update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}

describe("adminToken", () => {
  it("is the same token as the Node crypto reference", async () => {
    const expected = nodeCryptoToken(COFFEE_SHOP_KEY_ID, COFFEE_SHOP_KEY_SECRET, FIXED_TIME_IN_SECONDS);
    const token = await adminToken(COFFEE_SHOP_ADMIN_KEY, FIXED_TIME);
    expect(token).toBe(expected);
  });
});
