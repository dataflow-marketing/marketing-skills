// Checks that a change or a remove names the version it read, in If-Match.
// Without it the store cannot tell a stale write. It answers 428 and writes nothing.

import { vValidator } from "@hono/valibot-validator";
import type { Context } from "hono";
import * as v from "valibot";

const ifMatchHeader = v.object({
  "if-match": v.pipe(v.string(), v.trim(), v.minLength(1)),
});

function replyWhenMissing(result: { success: boolean }, c: Context) {
  if (!result.success) {
    return c.json({ error: "send the version you read in If-Match" }, 428);
  }
}

export const ifMatch = vValidator("header", ifMatchHeader, replyWhenMissing);
