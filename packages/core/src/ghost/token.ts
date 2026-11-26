// Makes the short lived token the Ghost Admin API asks for.
// The token is an HS256 JWT: the header names the key id (kid),
// the claims say when it was made (iat), when it ends (exp, 5 minutes on)
// and who it is for (aud "/admin/"). It is signed with the key's secret.
// Send it as the header Authorization: Ghost <token>.

import { SignJWT } from "jose";
import { parseAdminKey } from "./admin-key.ts";

// now is the clock. Tests pass a fixed time.
export async function adminToken(key: string, now: Date = new Date()): Promise<string> {
  const { id, secret } = parseAdminKey(key);
  const issuedAt = Math.floor(now.getTime() / 1000);
  const fiveMinutesInSeconds = 5 * 60;

  const token = new SignJWT({})
    .setProtectedHeader({ alg: "HS256", typ: "JWT", kid: id })
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + fiveMinutesInSeconds)
    .setAudience("/admin/");

  return token.sign(secret);
}
