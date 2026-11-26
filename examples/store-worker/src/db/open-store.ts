// Opens the D1 database the Worker is given through drizzle.

import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export type Store = DrizzleD1Database;

export function openStore(db: D1Database): Store {
  return drizzle(db);
}
