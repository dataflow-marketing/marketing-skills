// Sends the draft request to Ghost, exactly as the preview showed it,
// with the token added as the Authorization header.
// Refuses to send a body that names a status.

import { postFromResponse } from "./post-from-response.ts";
import { namesAStatus } from "./names-a-status.ts";
import type { DraftRequest, Fetch, GhostPostResult } from "./types.ts";

export async function sendDraft(request: DraftRequest, token: string, send: Fetch): Promise<GhostPostResult> {
  if (namesAStatus(request.body)) {
    return { ok: false, problem: "Refused: the request names a status. A skill never sets one: Ghost makes a new post a draft." };
  }

  let response: Response;
  try {
    response = await send(request.url, {
      method: request.method,
      headers: { ...request.headers, Authorization: `Ghost ${token}` },
      body: request.body,
    });
  } catch {
    return { ok: false, problem: `Could not reach Ghost at ${request.url}` };
  }

  return postFromResponse(response);
}
