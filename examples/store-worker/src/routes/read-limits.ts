// GET /limits: the largest body the store takes, in bytes.

import { factory } from "../factory.ts";
import { sizeLimit } from "../work/size-limit.ts";

export const readLimits = factory.createHandlers((c) => {
  const bytes = sizeLimit(c.env.MAX_BODY_BYTES);
  return c.json({ bytes });
});
