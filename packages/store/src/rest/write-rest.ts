// Writes one object to a rest store at the version it was read at. It gives back the store's new version.
// An object read as missing ("none") is added; any other is changed with If-Match. The store checks the version
// in the same step as the write: a 409 means it has moved since it was read and nothing was written. So does a
// 404 on a change: the object was removed since it was read.

import type { Fetch } from "../ghost/member-calls.ts";
import { NO_VERSION } from "../version.ts";
import { answerProblem } from "./answer-problem.ts";
import { headersFor, objectUrl, objectsUrl } from "./rest-calls.ts";

export type RestChange = { address: string; kind: string; id: string; key: string; readAt: string; text: string };

export type RestWrite = { ok: true; version: string } | { ok: false; moved: true } | { ok: false; moved: false; problem: string };

export async function writeRest(change: RestChange, fetch: Fetch): Promise<RestWrite> {
  if (change.readAt === NO_VERSION) {
    return add(change, fetch);
  }
  return changeAt(change, fetch);
}

async function add(change: RestChange, fetch: Fetch): Promise<RestWrite> {
  const response = await fetch(objectsUrl(change.address, change.kind), {
    method: "POST",
    headers: headersFor(change.key, true),
    body: JSON.stringify({ id: change.id, body: change.text }),
  });
  return answered(change, `add the ${change.kind} ${change.id}`, response, [409]);
}

async function changeAt(change: RestChange, fetch: Fetch): Promise<RestWrite> {
  const response = await fetch(objectUrl(change.address, change.kind, change.id), {
    method: "PUT",
    headers: headersFor(change.key, true, change.readAt),
    body: JSON.stringify({ body: change.text }),
  });
  return answered(change, `change the ${change.kind} ${change.id}`, response, [404, 409]);
}

async function answered(change: RestChange, doing: string, response: Response, movedWhen: number[]): Promise<RestWrite> {
  if (movedWhen.includes(response.status)) {
    return { ok: false, moved: true };
  }
  if (!response.ok) {
    return { ok: false, moved: false, problem: answerProblem(change.address, doing, response.status) };
  }
  const body = (await response.json()) as { version?: unknown };
  if (typeof body.version !== "string" || body.version === "") {
    return { ok: false, moved: false, problem: `The store at ${change.address} answered without a new version. It was asked to ${doing}.` };
  }
  return { ok: true, version: body.version };
}
