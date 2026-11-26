// Reads one post back from Ghost by its id.

import { ACCEPT_VERSION, postUrl } from "./admin-api.ts";
import { postFromResponse } from "./post-from-response.ts";
import type { Fetch, GhostPostResult } from "./types.ts";

export async function readPost(address: string, id: string, token: string, send: Fetch): Promise<GhostPostResult> {
  const url = postUrl(address, id);

  let response: Response;
  try {
    response = await send(url, {
      method: "GET",
      headers: { "Accept-Version": ACCEPT_VERSION, Authorization: `Ghost ${token}` },
    });
  } catch {
    return { ok: false, problem: `Could not reach Ghost at ${url}` };
  }

  return postFromResponse(response);
}
