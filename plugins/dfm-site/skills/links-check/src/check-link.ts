// Whether one link works for a visitor: asked with HEAD (light), then with GET when a site does not answer HEAD.
// Redirects are followed. A link works when it ends in an answer below 400.

import type { Fetch } from "./fetch-text.ts";

export type LinkResult = { url: string; works: boolean; status?: number; problem?: string };

// answers some sites give to HEAD alone: asked again with GET
const TRY_GET_AFTER = new Set([403, 405, 501]);

export async function checkLink(url: string, send: Fetch): Promise<LinkResult> {
  const head = await ask(url, "HEAD", send);
  if (head.status !== undefined && !TRY_GET_AFTER.has(head.status)) {
    return head;
  }
  return ask(url, "GET", send);
}

async function ask(url: string, method: "HEAD" | "GET", send: Fetch): Promise<LinkResult> {
  try {
    const response = await send(url, { method, redirect: "follow" });
    return response.status < 400 ? { url, works: true, status: response.status } : { url, works: false, status: response.status, problem: `answered ${response.status}` };
  } catch {
    return { url, works: false, problem: "could not be reached" };
  }
}
