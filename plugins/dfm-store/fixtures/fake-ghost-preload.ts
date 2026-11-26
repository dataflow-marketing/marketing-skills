// Loaded with node --import before a skill's dist/run.js in the edge tests.
// It swaps the global fetch for the fake Ghost members API: the real script runs end to end and nothing leaves
// the machine.
//
// FAKE_GHOST_FOLDER: where the fake keeps its members (fake-ghost-members.json, written by the test) and the
// requests it was given (fake-ghost-requests.jsonl). A later run sees what an earlier one wrote.
// FAKE_GHOST_OLD: "yes" to answer like a Ghost with no member custom fields.

import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fakeGhostMembers } from "../../../packages/store/fixtures/fake-ghost-members.ts";
import type { FakeMember } from "../../../packages/store/fixtures/fake-ghost-members.ts";

const folder = process.env.FAKE_GHOST_FOLDER ?? "";
const membersFile = join(folder, "fake-ghost-members.json");
const requestsFile = join(folder, "fake-ghost-requests.jsonl");

const saved = JSON.parse(readFileSync(membersFile, "utf8")) as { members: FakeMember[]; fields: string[] };
const ghost = fakeGhostMembers({ members: saved.members, fields: saved.fields, oldGhost: process.env.FAKE_GHOST_OLD === "yes" });

globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
  try {
    return await ghost.fetch(String(input), init ?? {});
  } finally {
    appendFileSync(requestsFile, `${JSON.stringify(ghost.requests[ghost.requests.length - 1])}\n`);
    writeFileSync(membersFile, JSON.stringify({ members: ghost.members, fields: ghost.fields }));
  }
};
