// Shows exactly what --go would send: the method, the address, every header
// and the body, byte for byte. The token is not made for a preview: the
// Authorization line names the variable the key is read from, never the key.

import type { ScriptResult, Site } from "@dataflow-marketing/core";
import type { DraftRequest } from "./types.ts";

export function describePreview(request: DraftRequest, site: Site): ScriptResult {
  const authorization = `Ghost (a 5 minute token made at send time from the key in ${site.keyName})`;
  const lines: string[] = [];

  lines.push("preview: nothing sent");
  lines.push(`site: ${site.business} ${site.address}`);
  lines.push(`would send: ${request.method} ${request.url}`);
  for (const [name, value] of Object.entries(request.headers)) {
    lines.push(`${name}: ${value}`);
  }
  lines.push(`Authorization: ${authorization}`);
  lines.push("status: not sent; Ghost makes a new post a draft");
  lines.push("");
  lines.push(request.body);

  const data = {
    mode: "preview",
    site: site.business,
    method: request.method,
    url: request.url,
    headers: { ...request.headers, Authorization: authorization },
    body: JSON.parse(request.body) as unknown,
  };
  return { text: lines.join("\n"), data };
}
