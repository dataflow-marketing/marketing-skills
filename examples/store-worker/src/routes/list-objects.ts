// GET /objects/:kind: every object of that kind, with its version.

import { vValidator } from "@hono/valibot-validator";
import { kindParams } from "../check/kind-params.ts";
import { openStore } from "../db/open-store.ts";
import { factory } from "../factory.ts";
import { listObjects as listStored } from "../work/list-objects.ts";

export const listObjects = factory.createHandlers(vValidator("param", kindParams), async (c) => {
  const { kind } = c.req.valid("param");
  const objects = await listStored(openStore(c.env.DB), kind);
  return c.json(objects);
});
