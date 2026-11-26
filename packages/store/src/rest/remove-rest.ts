// Removes one object from a rest store at the version it was read at (DELETE with If-Match).
// The store checks the version in the same step: a 409 means it has moved since it was read; so does a 404
// (it was removed since). Nothing is removed then.

import type { Fetch } from "../ghost/member-calls.ts";
import { answerProblem } from "./answer-problem.ts";
import { headersFor, objectUrl } from "./rest-calls.ts";

export type RestRemoval = { address: string; kind: string; id: string; key: string; readAt: string };

export type RestRemove = { ok: true } | { ok: false; moved: true } | { ok: false; moved: false; problem: string };

export async function removeRest(removal: RestRemoval, fetch: Fetch): Promise<RestRemove> {
  const response = await fetch(objectUrl(removal.address, removal.kind, removal.id), {
    method: "DELETE",
    headers: headersFor(removal.key, false, removal.readAt),
  });
  if (response.status === 404 || response.status === 409) {
    return { ok: false, moved: true };
  }
  if (!response.ok) {
    return { ok: false, moved: false, problem: answerProblem(removal.address, `remove the ${removal.kind} ${removal.id}`, response.status) };
  }
  return { ok: true };
}
