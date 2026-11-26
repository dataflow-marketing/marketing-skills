// Tells whether an object is kept at all. A failed write can then say "an old version" (409) rather than
// "no such object" (404).

import type { Store } from "../db/open-store.ts";
import { oneObject } from "../db/one-object.ts";
import { objects } from "../db/schema.ts";

export async function objectExists(store: Store, kind: string, id: string): Promise<boolean> {
  const row = await store.select({ id: objects.id }).from(objects).where(oneObject(kind, id)).get();
  return row !== undefined;
}
