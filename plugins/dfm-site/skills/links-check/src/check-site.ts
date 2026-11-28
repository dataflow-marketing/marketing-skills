// The check: every link on the pages read, each checked once, one at a time with a pause between: a site is
// asked politely. Says which links do not work and on which pages they are.

import { checkLink, type LinkResult } from "./check-link.ts";
import { fetchText, type Fetch } from "./fetch-text.ts";
import { pageLinks } from "./page-links.ts";
import { pageList } from "./page-list.ts";

export type Limits = { maxPages: number; maxLinks: number; pauseMs: number };
export type Broken = LinkResult & { onPages: string[] };

export type SiteCheck = {
  origin: string;
  pagesRead: number;
  pagesNotRead: string[];
  pagesOverLimit: number;
  linksChecked: number;
  linksOverLimit: number;
  broken: Broken[];
};

export async function checkSite(origin: string, send: Fetch, wait: (ms: number) => Promise<void>, limits: Limits): Promise<SiteCheck> {
  const { pages, more } = await pageList(origin, send, limits.maxPages);
  const onPages = new Map<string, string[]>();
  const pagesNotRead: string[] = [];

  for (const page of pages) {
    const read = await fetchText(page, send);
    if (!read.ok) {
      pagesNotRead.push(page);
      continue;
    }
    for (const link of pageLinks(read.text, page)) {
      onPages.set(link, [...(onPages.get(link) ?? []), page]);
    }
    await wait(limits.pauseMs);
  }

  const links = [...onPages.keys()];
  const toCheck = links.slice(0, limits.maxLinks);
  const broken: Broken[] = [];
  for (const link of toCheck) {
    const result = await checkLink(link, send);
    if (!result.works) {
      broken.push({ ...result, onPages: onPages.get(link) ?? [] });
    }
    await wait(limits.pauseMs);
  }

  return {
    origin,
    pagesRead: pages.length - pagesNotRead.length,
    pagesNotRead,
    pagesOverLimit: more,
    linksChecked: toCheck.length,
    linksOverLimit: links.length - toCheck.length,
    broken,
  };
}
