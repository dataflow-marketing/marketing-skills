// A fake Ghost Admin API for tests: a fetch that answers like Ghost for the
// coffee shop and refuses any other address. Nothing leaves the machine.
//
// It keeps the posts it is sent and every request it is given.
// A new post is a draft unless the request names a status, as on a real Ghost.
// answerAs "published" makes it answer that every post is published: the failure
// post-draft must catch.

import type { Fetch } from "../skills/post-draft/src/types.ts";

export type SeenRequest = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
};

export type StoredPost = {
  id: string;
  status: string;
  title: string;
  slug: string;
};

export type FakeGhost = {
  fetch: Fetch;
  requests: SeenRequest[];
  posts: Map<string, StoredPost>;
};

const API = "https://coffee-shop.example/ghost/api/admin/posts/";

// Ghost wants "Ghost " and a token in the three parts of a JWT.
const TOKEN_HEADER = /^Ghost [^.\s]+\.[^.\s]+\.[^.\s]+$/;

export function fakeGhost(answerAs?: string): FakeGhost {
  const requests: SeenRequest[] = [];
  const posts = new Map<string, StoredPost>();

  const fetch: Fetch = async (url, init) => {
    const seen = seeRequest(url, init);
    requests.push(seen);
    if (!url.startsWith(API)) {
      throw new Error(`fake Ghost: refused a request to ${url}`);
    }
    if (!TOKEN_HEADER.test(seen.headers.Authorization ?? "")) {
      return answer(401, { errors: [{ message: "Authorization failed" }] });
    }
    if (seen.method === "POST") {
      return createPost(seen, posts, answerAs);
    }
    return readPost(url, posts, answerAs);
  };

  return { fetch, requests, posts };
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

function createPost(seen: SeenRequest, posts: Map<string, StoredPost>, answerAs?: string): Response {
  const sent = JSON.parse(seen.body ?? "{}").posts[0];
  const id = `post${posts.size + 1}`;
  const post: StoredPost = {
    id,
    status: answerAs ?? sent.status ?? "draft",
    title: sent.title,
    slug: sent.slug ?? slugOf(sent.title),
  };
  posts.set(id, post);
  return answer(201, { posts: [post] });
}

function readPost(url: string, posts: Map<string, StoredPost>, answerAs?: string): Response {
  const id = url.slice(API.length).replace(/\/$/, "");
  const post = posts.get(id);
  if (!post) {
    return answer(404, { errors: [{ message: "Post not found." }] });
  }
  return answer(200, { posts: [{ ...post, status: answerAs ?? post.status }] });
}

function slugOf(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function answer(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
