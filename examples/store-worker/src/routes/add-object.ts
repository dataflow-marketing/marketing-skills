// POST /objects/:kind with { id, body }: adds a new object.

import { vValidator } from "@hono/valibot-validator";
import { addRequest } from "../check/add-request.ts";
import { kindParams } from "../check/kind-params.ts";
import { openStore } from "../db/open-store.ts";
import { factory } from "../factory.ts";
import { addObject as addStored } from "../work/add-object.ts";
import { isOverLimit } from "../work/is-over-limit.ts";
import { sizeLimit } from "../work/size-limit.ts";
import { newStamp } from "../work/stamp.ts";

export const addObject = factory.createHandlers(
  vValidator("param", kindParams),
  vValidator("json", addRequest),
  async (c) => {
    const { kind } = c.req.valid("param");
    const { id, body } = c.req.valid("json");

    if (isOverLimit(body, sizeLimit(c.env.MAX_BODY_BYTES))) {
      return c.json({ error: "the body is larger than the store takes: see GET /limits" }, 413);
    }

    const result = await addStored(openStore(c.env.DB), kind, id, body, newStamp());
    if (result.outcome === "exists") {
      return c.json({ error: "already kept: read it and change it with its version" }, 409);
    }
    return c.json({ id, version: result.version }, 201);
  },
);
