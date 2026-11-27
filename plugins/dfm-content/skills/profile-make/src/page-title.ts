// The title of a web page, from its <title>, with its entities put back (&#x27; becomes '); the address when it has
// none.

import { putBackEntities } from "./page-text.ts";

export function pageTitle(html: string, address: string): string {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const title = match?.[1].replace(/\s+/g, " ").trim();
  return title ? putBackEntities(title) : address;
}
