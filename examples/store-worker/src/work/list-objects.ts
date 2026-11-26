// Lists the objects of one kind: their ids, versions and when each was last written, never their bodies.

import { asc, eq } from "drizzle-orm";
import type { Store } from "../db/open-store.ts";
import { objects } from "../db/schema.ts";

export type ObjectSummary = { id: string; version: string; updated: string };

export async function listObjects(store: Store, kind: string): Promise<ObjectSummary[]> {
  return store
    .select({ id: objects.id, version: objects.version, updated: objects.updated })
    .from(objects)
    .where(eq(objects.kind, kind))
    .orderBy(asc(objects.id))
    .all();
}
