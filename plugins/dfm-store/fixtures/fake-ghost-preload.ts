// Loaded with node --import before a skill's dist/run.js in the edge tests.
// It swaps the global fetch for the fake Ghost members API and the fake rest store: the real script runs end to
// end and nothing leaves the machine. A request goes to the fake rest store when it is for its address, otherwise
// to the fake Ghost.
//
// FAKE_GHOST_FOLDER: where the fakes keep their state (fake-ghost-members.json written by the test; also
// fake-rest-objects.json when the test writes one) and the requests they were given (fake-ghost-requests.jsonl).
// A later run sees what an earlier one wrote.
// FAKE_GHOST_OLD: "yes" to answer like a Ghost with no member custom fields.
// FAKE_REST_EDIT_ON_WRITE: text someone else saves into the rest object just before a skill's write reaches it.

import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fakeGhostMembers } from "../../../packages/store/fixtures/fake-ghost-members.ts";
import type { FakeMember } from "../../../packages/store/fixtures/fake-ghost-members.ts";
import { FAKE_REST_ADDRESS, fakeRestStore } from "../../../packages/store/fixtures/fake-rest-store.ts";
import type { FakeObject, SeenRequest } from "../../../packages/store/fixtures/fake-rest-store.ts";

const folder = process.env.FAKE_GHOST_FOLDER ?? "";
const membersFile = join(folder, "fake-ghost-members.json");
const restFile = join(folder, "fake-rest-objects.json");
const requestsFile = join(folder, "fake-ghost-requests.jsonl");
const editOnWrite = process.env.FAKE_REST_EDIT_ON_WRITE;

const saved = JSON.parse(readFileSync(membersFile, "utf8")) as { members: FakeMember[]; fields: string[] };
const ghost = fakeGhostMembers({ members: saved.members, fields: saved.fields, oldGhost: process.env.FAKE_GHOST_OLD === "yes" });

type SavedRest = { limit: number; written: number; objects: FakeObject[] };
const savedRest: SavedRest = existsSync(restFile) ? JSON.parse(readFileSync(restFile, "utf8")) : { limit: 1000, written: 0, objects: [] };
const rest = fakeRestStore({ limit: savedRest.limit, written: savedRest.written, objects: savedRest.objects });

globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
  const url = String(input);
  if (url.startsWith(`${FAKE_REST_ADDRESS}/`)) {
    return toRest(url, init ?? {});
  }
  try {
    return await ghost.fetch(url, init ?? {});
  } finally {
    keep(ghost.requests[ghost.requests.length - 1]);
    writeFileSync(membersFile, JSON.stringify({ members: ghost.members, fields: ghost.fields }));
  }
};

async function toRest(url: string, init: RequestInit): Promise<Response> {
  const writing = init.method === "PUT" || init.method === "POST";
  if (writing && editOnWrite !== undefined) {
    const [kind, id] = url.slice(`${FAKE_REST_ADDRESS}/objects/`.length).split("/");
    rest.edit(kind, id ?? JSON.parse(String(init.body)).id, editOnWrite);
  }
  try {
    return await rest.fetch(url, init);
  } finally {
    keep(rest.requests[rest.requests.length - 1]);
    writeFileSync(restFile, JSON.stringify({ limit: savedRest.limit, written: rest.written, objects: rest.objects }));
  }
}

function keep(request: SeenRequest | undefined): void {
  appendFileSync(requestsFile, `${JSON.stringify(request)}\n`);
}
