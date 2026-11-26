// Sends requests to the Worker under test, the way a skill's rest connector would.

import { exports } from "cloudflare:workers";
import { STORE_KEY } from "./coffee-shop.ts";

type Send = {
  method?: string;
  key?: string | null;
  ifMatch?: string;
  json?: unknown;
};

export async function send(path: string, options: Send = {}): Promise<Response> {
  const headers = new Headers();
  const key = options.key === undefined ? STORE_KEY : options.key;
  if (key !== null) {
    headers.set("Authorization", `Bearer ${key}`);
  }
  if (options.ifMatch !== undefined) {
    headers.set("If-Match", options.ifMatch);
  }
  let body: string | undefined;
  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.json);
  }
  const request = new Request(`https://store.example${path}`, {
    method: options.method ?? "GET",
    headers,
    body,
  });
  return exports.default.fetch(request);
}
