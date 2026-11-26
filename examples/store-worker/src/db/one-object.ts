// The where clause that names one object: its kind and its id.

import { and, eq } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { objects } from "./schema.ts";

export function oneObject(kind: string, id: string): SQL {
  return and(eq(objects.kind, kind), eq(objects.id, id)) as SQL;
}
