// The bindings in settings for one kind of object (every ledger, every profile), in business order.
// Pure: a kind that is not a lowercase name with hyphens is a problem, never guessed at.

import type { Binding, Settings } from "@dataflow-marketing/core";

export type KindResult = { ok: true; bindings: Binding[] } | { ok: false; problem: string };

const NAME = /^[a-z0-9-]+$/;

export function bindingsOfKind(settings: Settings, kind: string): KindResult {
  if (!NAME.test(kind)) {
    return { ok: false, problem: `The kind is a lowercase name with hyphens, such as ledger: ${kind}` };
  }
  const bindings = settings.bindings.filter((binding) => binding.object === kind);
  const sorted = [...bindings].sort((one, other) => one.business.localeCompare(other.business));
  return { ok: true, bindings: sorted };
}
