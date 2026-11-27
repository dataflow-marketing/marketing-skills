// The fallback when a site has no /llms-full.txt: the pages and posts its sitemap lists, read one by one as text,
// up to a limit. Only the site's own public pages: the same reading as the home page, never a platform's API.

import type { Fetch } from "./fetch-text.ts";
import { fetchText } from "./fetch-text.ts";
import { pageText } from "./page-text.ts";
import { pageTitle } from "./page-title.ts";
import { publishedDate } from "./published-date.ts";
import type { SiteItem } from "./read-llms-full.ts";
import { pagesAndPostsSitemaps, readSitemap } from "./sitemap.ts";

export const PAGE_LIMIT = 50;

export type SitemapPages = { ok: true; items: SiteItem[]; listed: number } | { ok: false; problem: string };

type Listed = { address: string; kind: SiteItem["kind"] };

export async function readSitemapPages(origin: string, send: Fetch): Promise<SitemapPages> {
  const listed = await listedPages(origin, send);
  if (!listed.ok) {
    return listed;
  }
  const items: SiteItem[] = [];
  for (const page of listed.pages.slice(0, PAGE_LIMIT)) {
    const fetched = await fetchText(page.address, send);
    if (fetched.ok) {
      items.push(itemOf(page, fetched.text));
    }
  }
  return { ok: true, items, listed: listed.pages.length };
}

// a page with a published day is a post, even in a plain sitemap that does not say which pages are posts
function itemOf(page: Listed, html: string): SiteItem {
  const published = publishedDate(html);
  const item: SiteItem = { kind: published ? "post" : page.kind, title: pageTitle(html, page.address), url: page.address, text: pageText(html) };
  if (published) {
    item.published = published;
  }
  return item;
}

// Every page the sitemap lists, following an index one level down
async function listedPages(origin: string, send: Fetch): Promise<{ ok: true; pages: Listed[] } | { ok: false; problem: string }> {
  const top = await fetchText(`${origin}/sitemap.xml`, send);
  if (!top.ok) {
    return { ok: false, problem: `There is no ${origin}/sitemap.xml either (${top.problem}).` };
  }
  const sitemap = readSitemap(top.text, origin);
  if (!sitemap.isIndex) {
    return { ok: true, pages: sitemap.addresses.map((address) => ({ address, kind: "page" as const })) };
  }

  const pages: Listed[] = [];
  for (const child of pagesAndPostsSitemaps(sitemap.addresses)) {
    const fetched = await fetchText(child.address, send);
    if (fetched.ok) {
      const addresses = readSitemap(fetched.text, origin).addresses;
      pages.push(...addresses.map((address) => ({ address, kind: child.kind })));
    }
  }
  return { ok: true, pages };
}
