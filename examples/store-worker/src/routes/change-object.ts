// PUT /objects/:kind/:id with { body } and If-Match: <version>.
// Writes only when the version is still the one kept, otherwise 409.

import { vValidator } from "@hono/valibot-validator";
import { changeRequest } from "../check/change-request.ts";
import { ifMatch } from "../check/if-match.ts";
import { objectParams } from "../check/object-params.ts";
import { openStore } from "../db/open-store.ts";
import { factory } from "../factory.ts";
import { changeObject as changeStored } from "../work/change-object.ts";
import { isOverLimit } from "../work/is-over-limit.ts";
import { sizeLimit } from "../work/size-limit.ts";
import { newStamp } from "../work/stamp.ts";

export const changeObject = factory.createHandlers(
  vValidator("param", objectParams),
  ifMatch,
  vValidator("json", changeRequest),
  async (c) => {
    const { kind, id } = c.req.valid("param");
    const versionRead = c.req.valid("header")["if-match"];
    const { body } = c.req.valid("json");

    if (isOverLimit(body, sizeLimit(c.env.MAX_BODY_BYTES))) {
      return c.json({ error: "the body is larger than the store takes: see GET /limits" }, 413);
    }

    const result = await changeStored(openStore(c.env.DB), { kind, id, body, versionRead }, newStamp());
    if (result.outcome === "missing") {
      return c.json({ error: "no such object" }, 404);
    }
    if (result.outcome === "stale") {
      return c.json({ error: "changed since you read it: read it again and merge" }, 409);
    }
    return c.json({ id, version: result.version });
  },
);
