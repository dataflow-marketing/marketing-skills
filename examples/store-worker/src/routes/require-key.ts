// Every request must send the store's key: Authorization: Bearer <key>.
// Without it or with the wrong one the answer is 401 and nothing is read or written.

import { createMiddleware } from "hono/factory";
import type { StoreApp } from "../env.ts";
import { bearerKey } from "../work/bearer-key.ts";
import { keyMatches } from "../work/key-matches.ts";

export const requireKey = createMiddleware<StoreApp>(async (c, next) => {
  const storeKey = c.env.STORE_KEY;
  if (!storeKey) {
    throw new Error("STORE_KEY is not set: wrangler secret put STORE_KEY");
  }

  const sent = bearerKey(c.req.header("Authorization"));
  if (sent === null) {
    return c.json({ error: "send the store key as Authorization: Bearer <key>" }, 401);
  }
  if (!(await keyMatches(sent, storeKey))) {
    return c.json({ error: "the store key is wrong" }, 401);
  }

  await next();
});
