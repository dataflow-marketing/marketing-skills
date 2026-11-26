// Adds a new object. An object that is already kept is left alone: changing it needs its version. Adding over
// it is refused.

import type { Store } from "../db/open-store.ts";
import { objects } from "../db/schema.ts";
import type { Stamp } from "./stamp.ts";

export type AddResult = { outcome: "added"; version: string } | { outcome: "exists" };

export async function addObject(store: Store, kind: string, id: string, body: string, stamp: Stamp): Promise<AddResult> {
  const added = await store
    .insert(objects)
    .values({ kind, id, body, version: stamp.version, updated: stamp.updated })
    .onConflictDoNothing()
    .returning({ version: objects.version });

  if (added.length === 0) {
    return { outcome: "exists" };
  }
  return { outcome: "added", version: stamp.version };
}
