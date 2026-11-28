// Node edge: reads the site's key from the keys file and makes the Ghost Admin token.
// The key goes from the file into the token and nowhere else: it is never
// returned, printed, logged or put in an error message.

import { adminToken } from "@dataflow-marketing/core";
import { readKey } from "@dataflow-marketing/core/node";
import type { GhostSite } from "../find-ghost-site.ts";

export type TokenResult = { ok: true; token: string } | { ok: false; problem: string };

export async function readToken(found: GhostSite): Promise<TokenResult> {
  try {
    const key = await readKey(found.keysFile, found.site.keyName);
    return { ok: true, token: await adminToken(key) };
  } catch (error) {
    return { ok: false, problem: safeMessage(error, found) };
  }
}

// The errors core throws name the variable, never the key. Anything else
// (a keys file that cannot be read) is said in words written here.
function safeMessage(error: unknown, found: GhostSite): string {
  if (error instanceof Error && (error.name === "MissingKeyError" || error.name === "MalformedAdminKeyError")) {
    return error.message;
  }
  return `Cannot read ${found.site.keyName} from the keys file ${found.keysFile}.`;
}
