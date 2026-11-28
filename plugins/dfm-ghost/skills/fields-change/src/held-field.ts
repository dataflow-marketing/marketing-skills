// A field that holds a store object (a ledger bound in settings: `binding ledger <business>: <store> <email> next`) is
// never changed here: it is changed with dfm-store:object-change, with its version check, backup and read back.

import type { Binding } from "@dataflow-marketing/core";

export function holdsAnObject(bindings: readonly Binding[], field: string): Binding | undefined {
  return bindings.find((binding) => binding.place.trim().split(/\s+/).at(-1) === field);
}
