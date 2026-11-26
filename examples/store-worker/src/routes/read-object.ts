// GET /objects/:kind/:id: one object, its version and its body.

import { vValidator } from "@hono/valibot-validator";
import { objectParams } from "../check/object-params.ts";
import { openStore } from "../db/open-store.ts";
import { factory } from "../factory.ts";
import { readObject as readStored } from "../work/read-object.ts";

export const readObject = factory.createHandlers(vValidator("param", objectParams), async (c) => {
  const { kind, id } = c.req.valid("param");
  const object = await readStored(openStore(c.env.DB), kind, id);
  if (object === null) {
    return c.json({ error: "no such object" }, 404);
  }
  return c.json(object);
});
