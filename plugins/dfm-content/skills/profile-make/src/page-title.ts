// The title of a web page, from its <title>; the address when it has none.

export function pageTitle(html: string, address: string): string {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const title = match?.[1].replace(/\s+/g, " ").trim();
  return title ? title.replace(/&amp;/g, "&") : address;
}
