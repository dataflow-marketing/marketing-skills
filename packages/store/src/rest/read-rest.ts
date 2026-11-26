// Reads one object from a rest store with the store's own version. It also reads the largest body the store takes.
// An object the store does not keep (404) is empty, with the version "none", the same as a missing file.

import type { Fetch } from "../ghost/member-calls.ts";
import { NO_VERSION } from "../version.ts";
import { answerProblem } from "./answer-problem.ts";
import { headersFor, limitsUrl, objectUrl } from "./rest-calls.ts";

export type RestLookup = { address: string; kind: string; id: string; key: string };

export type RestRead = { ok: true; text: string; version: string; limit: number } | { ok: false; problem: string };

export async function readRest(lookup: RestLookup, fetch: Fetch): Promise<RestRead> {
  const object = await readOne(lookup, fetch);
  if (!object.ok) {
    return object;
  }
  const limit = await readLimit(lookup, fetch);
  if (!limit.ok) {
    return limit;
  }
  return { ok: true, text: object.text, version: object.version, limit: limit.bytes };
}

type OneRead = { ok: true; text: string; version: string } | { ok: false; problem: string };

async function readOne(lookup: RestLookup, fetch: Fetch): Promise<OneRead> {
  const doing = `read the ${lookup.kind} ${lookup.id}`;
  const response = await fetch(objectUrl(lookup.address, lookup.kind, lookup.id), { method: "GET", headers: headersFor(lookup.key) });
  if (response.status === 404) {
    return { ok: true, text: "", version: NO_VERSION };
  }
  if (!response.ok) {
    return { ok: false, problem: answerProblem(lookup.address, doing, response.status) };
  }
  const body = (await response.json()) as { version?: unknown; body?: unknown };
  if (typeof body.version !== "string" || body.version === "" || typeof body.body !== "string") {
    return { ok: false, problem: `The store at ${lookup.address} answered without a version and a body. It was asked to ${doing}.` };
  }
  return { ok: true, text: body.body, version: body.version };
}

type LimitRead = { ok: true; bytes: number } | { ok: false; problem: string };

async function readLimit(lookup: RestLookup, fetch: Fetch): Promise<LimitRead> {
  const doing = "give its limit";
  const response = await fetch(limitsUrl(lookup.address), { method: "GET", headers: headersFor(lookup.key) });
  if (!response.ok) {
    return { ok: false, problem: answerProblem(lookup.address, doing, response.status) };
  }
  const body = (await response.json()) as { bytes?: unknown };
  if (typeof body.bytes !== "number" || !Number.isInteger(body.bytes) || body.bytes <= 0) {
    return { ok: false, problem: `The store at ${lookup.address} gave no limit in bytes. It was asked to ${doing}.` };
  }
  return { ok: true, bytes: body.bytes };
}
