// Loaded with node --import before numbers-read's dist/run.js in the edge tests. It swaps the global fetch for a
// fake Ghost Admin API that answers the members and posts numbers-read asks for: nothing leaves the machine.
//
// FAKE_NUMBERS_FOLDER holds fake-ghost-numbers.json (the members and posts, written by the test) and
// fake-ghost-numbers-requests.jsonl (each request it was given: a test reads what was asked).

import { appendFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const folder = process.env.FAKE_NUMBERS_FOLDER ?? "";
const saved = JSON.parse(readFileSync(join(folder, "fake-ghost-numbers.json"), "utf8")) as { status?: number; members: unknown[]; posts: unknown[] };

globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
  const url = String(input);
  const headers = (init?.headers ?? {}) as Record<string, string>;
  appendFileSync(join(folder, "fake-ghost-numbers-requests.jsonl"), `${JSON.stringify({ url, authorization: headers.Authorization })}\n`);
  if (saved.status && saved.status !== 200) {
    return new Response("{}", { status: saved.status });
  }
  if (url.includes("/members/")) {
    return Response.json({ members: saved.members, meta: { pagination: { next: null } } });
  }
  return Response.json({ posts: saved.posts });
};
