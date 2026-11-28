// The pages to read for links: the home page, then the pages and posts the site's sitemap lists, up to a limit.

import { fetchText, type Fetch } from "./fetch-text.ts";
import { pagesAndPostsSitemaps, readSitemap } from "./sitemap.ts";

export async function pageList(origin: string, send: Fetch, maxPages: number): Promise<{ pages: string[]; more: number }> {
  const pages = [`${origin}/`];
  const map = await fetchText(`${origin}/sitemap.xml`, send);
  if (map.ok) {
    const sitemap = readSitemap(map.text, origin);
    const listed = sitemap.isIndex ? await fromIndex(sitemap.addresses, origin, send) : sitemap.addresses;
    for (const page of listed) {
      if (!pages.includes(page)) {
        pages.push(page);
      }
    }
  }
  return { pages: pages.slice(0, maxPages), more: Math.max(0, pages.length - maxPages) };
}

async function fromIndex(sitemaps: readonly string[], origin: string, send: Fetch): Promise<string[]> {
  const pages: string[] = [];
  for (const { address } of pagesAndPostsSitemaps(sitemaps)) {
    const map = await fetchText(address, send);
    if (map.ok) {
      pages.push(...readSitemap(map.text, origin).addresses);
    }
  }
  return pages;
}
