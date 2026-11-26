// A fake rest store, for tests: a fetch that answers the REST contract (spec/store.md) for one made up address and
// refuses any other. Nothing leaves the machine.
//
// It keeps its objects by kind and id, gives each write a new version (v1, v2 and on) and keeps every request.
// An object given with a version keeps it; written says how many versions were given before. A fake saved
// between two runs of a script picks up where it was.
// edit() changes an object as someone else would, between a skill's read and its write.

import type { Fetch } from "../src/ghost/member-calls.ts";

export type FakeObject = { kind: string; id: string; version: string; body: string };

export type SeenRequest = { method: string; url: string; headers: Record<string, string>; body?: string };

export type FakeRestStore = {
  fetch: Fetch;
  requests: SeenRequest[];
  objects: FakeObject[];
  edit: (kind: string, id: string, body: string) => void;
  readonly written: number;
};

export type FakeRestOptions = {
  address?: string;
  key?: string;
  limit?: number;
  objects?: (Omit<FakeObject, "version"> & { version?: string })[];
  written?: number;
};

export const FAKE_REST_ADDRESS = "https://store.coffee-shop.example";
export const FAKE_REST_KEY = "made-up-store-key";

export function fakeRestStore(options: FakeRestOptions = {}): FakeRestStore {
  const address = options.address ?? FAKE_REST_ADDRESS;
  const key = options.key ?? FAKE_REST_KEY;
  const limit = options.limit ?? 1000;
  const requests: SeenRequest[] = [];
  let written = options.written ?? 0;
  const nextVersion = (): string => {
    written += 1;
    return `v${written}`;
  };
  const objects: FakeObject[] = (options.objects ?? []).map((each) => ({ ...each, version: each.version ?? nextVersion() }));

  const fetch: Fetch = async (url, init) => {
    const seen = seeRequest(url, init);
    requests.push(seen);
    if (!url.startsWith(`${address}/`)) {
      throw new Error(`fake rest store: refused a request to ${url}`);
    }
    if (seen.headers.Authorization !== `Bearer ${key}`) {
      return answer(401, { error: "the store key is wrong" });
    }
    const path = url.slice(address.length).split("/").map(decodeURIComponent);
    if (path[1] === "limits") {
      return answer(200, { bytes: limit });
    }
    const call = { seen, kind: path[2], id: path[3], objects, limit, nextVersion };
    return path[3] === undefined ? onKind(call) : onObject(call);
  };

  const edit = (kind: string, id: string, body: string): void => {
    const object = objects.find((each) => each.kind === kind && each.id === id);
    if (object) {
      object.body = body;
      object.version = nextVersion();
    } else {
      objects.push({ kind, id, body, version: nextVersion() });
    }
  };

  return {
    fetch,
    requests,
    objects,
    edit,
    get written() {
      return written;
    },
  };
}

type Call = { seen: SeenRequest; kind: string; id?: string; objects: FakeObject[]; limit: number; nextVersion: () => string };

// GET lists, POST adds
function onKind(call: Call): Response {
  if (call.seen.method === "GET") {
    const listed = call.objects.filter((each) => each.kind === call.kind).map(({ id, version }) => ({ id, version, updated: "2026-11-26T00:00:00Z" }));
    return answer(200, listed);
  }
  const sent = JSON.parse(call.seen.body ?? "{}") as { id: string; body: string };
  if (tooLarge(sent.body, call.limit)) {
    return answer(413, { error: "too large" });
  }
  if (call.objects.some((each) => each.kind === call.kind && each.id === sent.id)) {
    return answer(409, { error: "already kept" });
  }
  const added = { kind: call.kind, id: sent.id, body: sent.body, version: call.nextVersion() };
  call.objects.push(added);
  return answer(201, { id: added.id, version: added.version });
}

// GET reads, PUT changes and DELETE removes, each at the version in If-Match
function onObject(call: Call): Response {
  const object = call.objects.find((each) => each.kind === call.kind && each.id === call.id);
  if (!object) {
    return answer(404, { error: "no such object" });
  }
  if (call.seen.method === "GET") {
    return answer(200, { id: object.id, version: object.version, body: object.body });
  }
  if (call.seen.headers["If-Match"] !== object.version) {
    return answer(409, { error: "changed since you read it" });
  }
  if (call.seen.method === "DELETE") {
    call.objects.splice(call.objects.indexOf(object), 1);
    return new Response(null, { status: 204 });
  }
  const sent = JSON.parse(call.seen.body ?? "{}") as { body: string };
  if (tooLarge(sent.body, call.limit)) {
    return answer(413, { error: "too large" });
  }
  object.body = sent.body;
  object.version = call.nextVersion();
  return answer(200, { id: object.id, version: object.version });
}

function tooLarge(body: string, limit: number): boolean {
  return new TextEncoder().encode(body).length > limit;
}

function seeRequest(url: string, init: RequestInit): SeenRequest {
  const headers: Record<string, string> = {};
  for (const [name, value] of Object.entries(init.headers ?? {})) {
    headers[name] = String(value);
  }
  const seen: SeenRequest = { method: init.method ?? "GET", url, headers };
  if (typeof init.body === "string") {
    seen.body = init.body;
  }
  return seen;
}

function answer(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
