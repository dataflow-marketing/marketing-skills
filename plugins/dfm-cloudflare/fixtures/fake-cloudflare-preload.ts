// Loaded with node --import before a skill's dist/run.js in the edge tests. It swaps the global fetch for a fake
// Cloudflare GraphQL API: the real script runs end to end and nothing leaves the machine.
//
// FAKE_CLOUDFLARE_FOLDER holds fake-cloudflare-answer.json (what the fake answers, written by the test) and
// fake-cloudflare-requests.jsonl (each request it was given: a test reads what was asked).

import { appendFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const folder = process.env.FAKE_CLOUDFLARE_FOLDER ?? "";
const answer = JSON.parse(readFileSync(join(folder, "fake-cloudflare-answer.json"), "utf8")) as { status: number; body: unknown };

globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
  const headers = (init?.headers ?? {}) as Record<string, string>;
  const seen = { url: String(input), authorization: headers.Authorization, body: JSON.parse(String(init?.body ?? "{}")) };
  appendFileSync(join(folder, "fake-cloudflare-requests.jsonl"), `${JSON.stringify(seen)}\n`);
  return new Response(JSON.stringify(answer.body), { status: answer.status });
};
