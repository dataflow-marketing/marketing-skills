// Decides what a remove may do once the object has been read again just before removing (spec/store.md, every
// write). The store never merges: when the version is not the one the preview showed, it stops.

import { NO_VERSION } from "@dataflow-marketing/store";

export type RemoveDecision = { kind: "remove" } | { kind: "nothing to remove" } | { kind: "moved"; now: string };

export type RemoveCheck = { seenVersion: string; current: { text: string; version: string } };

export function decideRemove(check: RemoveCheck): RemoveDecision {
  if (check.current.version === NO_VERSION) {
    return { kind: "nothing to remove" };
  }
  if (check.current.version !== check.seenVersion) {
    return { kind: "moved", now: check.current.text };
  }
  return { kind: "remove" };
}
