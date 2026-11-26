// Changes an object only when the version sent is still the one kept.
// The check and the write are one statement: two writers cannot both win.

import { and, eq } from "drizzle-orm";
import type { Store } from "../db/open-store.ts";
import { oneObject } from "../db/one-object.ts";
import { objects } from "../db/schema.ts";
import { objectExists } from "./object-exists.ts";
import type { Stamp } from "./stamp.ts";

export type ChangeResult = { outcome: "changed"; version: string } | { outcome: "stale" } | { outcome: "missing" };

export type Change = { kind: string; id: string; body: string; versionRead: string };

export async function changeObject(store: Store, change: Change, stamp: Stamp): Promise<ChangeResult> {
  const changed = await store
    .update(objects)
    .set({ body: change.body, version: stamp.version, updated: stamp.updated })
    .where(and(oneObject(change.kind, change.id), eq(objects.version, change.versionRead)))
    .returning({ version: objects.version });

  if (changed.length === 1) {
    return { outcome: "changed", version: stamp.version };
  }
  if (await objectExists(store, change.kind, change.id)) {
    return { outcome: "stale" };
  }
  return { outcome: "missing" };
}
