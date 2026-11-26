// Loaded with node --import before post-draft's dist/run.js in the edge tests.
// It swaps the global fetch for the fake Ghost: the real script runs end to end
// and nothing leaves the machine.
//
// FAKE_GHOST_FOLDER: where the fake Ghost keeps its posts and the requests it was given.
//   A --read-back run then sees the post an earlier --go made.
// FAKE_GHOST_ANSWER_AS: "published" to make it answer that every post is published.

import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fakeGhost } from "./fake-ghost.ts";
import type { StoredPost } from "./fake-ghost.ts";

const folder = process.env.FAKE_GHOST_FOLDER ?? "";
const postsFile = join(folder, "fake-ghost-posts.json");
const requestsFile = join(folder, "fake-ghost-requests.jsonl");

const ghost = fakeGhost(process.env.FAKE_GHOST_ANSWER_AS);
loadPosts();

globalThis.fetch = async (input: string | URL | Request, init?: RequestInit) => {
  try {
    return await ghost.fetch(String(input), init ?? {});
  } finally {
    saveLastRequest();
    savePosts();
  }
};

function saveLastRequest(): void {
  const last = ghost.requests[ghost.requests.length - 1];
  appendFileSync(requestsFile, `${JSON.stringify(last)}\n`);
}

function loadPosts(): void {
  if (!existsSync(postsFile)) {
    return;
  }
  const saved = JSON.parse(readFileSync(postsFile, "utf8")) as StoredPost[];
  for (const post of saved) {
    ghost.posts.set(post.id, post);
  }
}

function savePosts(): void {
  writeFileSync(postsFile, JSON.stringify([...ghost.posts.values()]));
}
