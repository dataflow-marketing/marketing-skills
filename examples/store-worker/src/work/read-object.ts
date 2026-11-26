// Reads one object with its version. Gives back null when there is no such object.

import type { Store } from "../db/open-store.ts";
import { oneObject } from "../db/one-object.ts";
import { objects } from "../db/schema.ts";

export type StoredObject = { id: string; version: string; body: string };

export async function readObject(store: Store, kind: string, id: string): Promise<StoredObject | null> {
  const row = await store
    .select({ id: objects.id, version: objects.version, body: objects.body })
    .from(objects)
    .where(oneObject(kind, id))
    .get();
  return row ?? null;
}
