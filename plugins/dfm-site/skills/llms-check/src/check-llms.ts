// The check: is a site's /llms.txt on and what it holds; is there an /llms-full.txt with every page and post.

import { fetchText, type Fetch } from "./fetch-text.ts";
import { readLlmsFull, readLlmsTxt, type LlmsFull, type LlmsTxt } from "./read-llms.ts";

export type LlmsCheck = {
  origin: string;
  llmsTxt: { on: true; read: LlmsTxt } | { on: false; problem: string };
  llmsFull: { on: true; read: LlmsFull } | { on: false; problem: string };
};

export async function checkLlms(origin: string, send: Fetch): Promise<LlmsCheck> {
  const txt = await fetchText(`${origin}/llms.txt`, send);
  const full = await fetchText(`${origin}/llms-full.txt`, send);
  return {
    origin,
    llmsTxt: txt.ok && looksLikeText(txt.text) ? { on: true, read: readLlmsTxt(txt.text) } : { on: false, problem: txt.ok ? `${origin}/llms.txt is a web page, not the file` : txt.problem },
    llmsFull: full.ok && looksLikeText(full.text) ? { on: true, read: readLlmsFull(full.text) } : { on: false, problem: full.ok ? `${origin}/llms-full.txt is a web page, not the file` : full.problem },
  };
}

// some sites answer every address with a page (a "not found" page that says 200): that is not the file
function looksLikeText(text: string): boolean {
  return !/^\s*<(!doctype|html)/i.test(text);
}
