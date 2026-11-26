// Says what --go did or what --read-back found: text for a person and the same as data for --json.
// It ends by saying a person publishes: no skill does.

import type { ScriptResult, Site } from "@dataflow-marketing/core";
import { editorUrl } from "./admin-api.ts";
import type { ReadBackCheck } from "./check-read-back.ts";
import type { GhostPost } from "./types.ts";

export function describeResult(site: Site, post: GhostPost, check: ReadBackCheck, created: boolean): ScriptResult {
  const lines: string[] = [];

  if (created) {
    lines.push(`created on ${site.business}: id ${post.id} (status was not sent)`);
  }
  lines.push(`read back: status ${post.status}, title "${post.title}", slug ${post.slug}`);
  if (check.problems.length === 0) {
    lines.push("read back: passed");
  } else {
    lines.push(`read back: ${check.problems.length} problems`);
    lines.push(...check.problems);
  }
  lines.push(`open it in Ghost: ${editorUrl(site.address, post.id)}`);
  lines.push("a person reads it and publishes it: no skill does");

  const data = { site: site.business, created, post, isDraft: check.isDraft, problems: check.problems };
  return { text: lines.join("\n"), data };
}
