// Reads Ghost's answer about one post: its id, status, title and slug.
// An error answer gives Ghost's own message, never the request or its token.

import type { GhostPostResult } from "./types.ts";

type GhostAnswer = {
  posts?: { id?: unknown; status?: unknown; title?: unknown; slug?: unknown }[];
  errors?: { message?: unknown }[];
};

export async function postFromResponse(response: Response): Promise<GhostPostResult> {
  const answer = await readAnswer(response);

  if (!response.ok) {
    return { ok: false, problem: `Ghost answered ${response.status}: ${errorMessage(answer)}` };
  }

  const post = answer?.posts?.[0];
  if (!post || !isText(post.id) || !isText(post.status) || !isText(post.title) || !isText(post.slug)) {
    return { ok: false, problem: "Ghost's answer has no post with an id, status, title and slug." };
  }
  return { ok: true, post: { id: post.id, status: post.status, title: post.title, slug: post.slug } };
}

async function readAnswer(response: Response): Promise<GhostAnswer | undefined> {
  try {
    return (await response.json()) as GhostAnswer;
  } catch {
    return undefined;
  }
}

function errorMessage(answer: GhostAnswer | undefined): string {
  const message = answer?.errors?.[0]?.message;
  if (isText(message)) {
    return message;
  }
  return "no message";
}

function isText(value: unknown): value is string {
  return typeof value === "string";
}
