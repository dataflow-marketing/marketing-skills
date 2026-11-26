// DELETE /objects/:kind/:id with If-Match: <version>.
// Removes only when the version is still the one kept, otherwise 409.

import { vValidator } from "@hono/valibot-validator";
import { ifMatch } from "../check/if-match.ts";
import { objectParams } from "../check/object-params.ts";
import { openStore } from "../db/open-store.ts";
import { factory } from "../factory.ts";
import { removeObject as removeStored } from "../work/remove-object.ts";

export const removeObject = factory.createHandlers(vValidator("param", objectParams), ifMatch, async (c) => {
  const { kind, id } = c.req.valid("param");
  const versionRead = c.req.valid("header")["if-match"];

  const result = await removeStored(openStore(c.env.DB), kind, id, versionRead);
  if (result.outcome === "missing") {
    return c.json({ error: "no such object" }, 404);
  }
  if (result.outcome === "stale") {
    return c.json({ error: "changed since you read it: read it again first" }, 409);
  }
  return c.body(null, 204);
});
