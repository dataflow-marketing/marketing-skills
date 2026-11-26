// The objects table in drizzle's words. It matches migrations/0001_objects.sql, which makes the table:
// one row for each object a skill keeps, named by its kind and id.

import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const objects = sqliteTable(
  "objects",
  {
    kind: text("kind").notNull(),
    id: text("id").notNull(),
    version: text("version").notNull(),
    updated: text("updated").notNull(),
    body: text("body").notNull(),
  },
  (table) => [primaryKey({ columns: [table.kind, table.id] })],
);
