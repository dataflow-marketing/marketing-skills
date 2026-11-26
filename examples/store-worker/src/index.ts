// The starter store Worker. It meets the REST contract in spec/store.md.
// Read top to bottom, this file is the whole API: every request needs the key,
// then each route hands its work to one handler.

import { Hono } from "hono";
import type { StoreApp } from "./env.ts";
import { requireKey } from "./routes/require-key.ts";
import { readLimits } from "./routes/read-limits.ts";
import { listObjects } from "./routes/list-objects.ts";
import { readObject } from "./routes/read-object.ts";
import { addObject } from "./routes/add-object.ts";
import { changeObject } from "./routes/change-object.ts";
import { removeObject } from "./routes/remove-object.ts";
import { replyNotFound } from "./routes/reply-not-found.ts";
import { replyError } from "./routes/reply-error.ts";

const app = new Hono<StoreApp>();

app.use("*", requireKey);

app.get("/limits", ...readLimits);
app.get("/objects/:kind", ...listObjects);
app.get("/objects/:kind/:id", ...readObject);
app.post("/objects/:kind", ...addObject);
app.put("/objects/:kind/:id", ...changeObject);
app.delete("/objects/:kind/:id", ...removeObject);

app.notFound(replyNotFound);
app.onError(replyError);

export default app;
