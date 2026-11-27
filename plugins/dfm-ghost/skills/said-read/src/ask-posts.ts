// Asks a Ghost site's Admin API, read only, for the posts that may have gone out in a week: every post published from
// 90 days before the week (a post can be emailed long after the date it carries) to the day after it, with its
// email, tags and words. Web standard fetch only: it runs in a Worker too.

import type { Post } from "./said-lines.ts";

export const ACCEPT_VERSION = "v5.0";

export type Asked = { address: string; token: string; from: string; to: string };

export type PostsAnswer = { ok: true; posts: Post[] } | { ok: false; problem: string };

export async function askPosts(asked: Asked): Promise<PostsAnswer> {
  const since = dateOf(Date.parse(asked.from) - 90 * 86_400_000);
  const until = dateOf(Date.parse(asked.to) + 86_400_000);
  const filter = encodeURIComponent(`published_at:>='${since}'+published_at:<'${until}'`);
  const path = `/posts/?limit=all&filter=${filter}&include=email,tags&formats=plaintext`;
  const url = `${asked.address}/ghost/api/admin${path}`;

  let reply: Response;
  try {
    reply = await fetch(url, { headers: { Authorization: `Ghost ${asked.token}`, "Accept-Version": ACCEPT_VERSION } });
  } catch {
    return { ok: false, problem: `Could not reach Ghost at ${asked.address}` };
  }
  if (!reply.ok) {
    return { ok: false, problem: `Ghost at ${asked.address} said ${reply.status} to /posts/` };
  }
  const body = (await reply.json()) as { posts?: Post[] };
  return { ok: true, posts: body.posts ?? [] };
}

function dateOf(moment: number): string {
  return new Date(moment).toISOString().slice(0, 10);
}
