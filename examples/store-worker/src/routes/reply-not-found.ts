// Any path outside the contract.

import type { Context } from "hono";

export function replyNotFound(c: Context): Response {
  return c.json({ error: "not part of the store contract" }, 404);
}
