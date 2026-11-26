// Anything that went wrong inside the Worker.
// A request Hono refused (such as a body that is not JSON) keeps its own answer.
// Any other error goes to the Worker's log, never to the caller. Nothing private leaks in a reply.

import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

export function replyError(error: Error, c: Context): Response {
  if (error instanceof HTTPException) {
    return error.getResponse();
  }
  console.error(error);
  return c.json({ error: "the store could not do that" }, 500);
}
