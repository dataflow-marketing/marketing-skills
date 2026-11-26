// Removes an object only when the version sent is still the one kept.

import { and, eq } from "drizzle-orm";
import type { Store } from "../db/open-store.ts";
import { oneObject } from "../db/one-object.ts";
import { objects } from "../db/schema.ts";
import { objectExists } from "./object-exists.ts";

export type RemoveResult = { outcome: "removed" } | { outcome: "stale" } | { outcome: "missing" };

export async function removeObject(store: Store, kind: string, id: string, versionRead: string): Promise<RemoveResult> {
  const removed = await store
    .delete(objects)
    .where(and(oneObject(kind, id), eq(objects.version, versionRead)))
    .returning({ id: objects.id });

  if (removed.length === 1) {
    return { outcome: "removed" };
  }
  if (await objectExists(store, kind, id)) {
    return { outcome: "stale" };
  }
  return { outcome: "missing" };
}
