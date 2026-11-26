// profile-make's script: reads a site's home page and its pages (its /llms-full.txt; with --from-sitemap the
// pages its sitemap lists), keeps them as files for the profile and its check, then counts pages, posts and words
// per post. The fourteen parts of the profile are written by Claude from these files (SKILL.md); the counts are
// code, never a model.
//
// node dist/run.js --address <https://...> [--folder <folder>] [--from-sitemap] [--json]
// Exit code: 0 done, 2 refused or failed (such as a site with no /llms-full.txt and no --from-sitemap).

import { EXIT_DONE, EXIT_REFUSED_OR_FAILED, outputMode } from "@dataflow-marketing/core";
import { printOutput } from "@dataflow-marketing/core/node";
import { countSite } from "./count-site.ts";
import type { CountedIn } from "./counted-section.ts";
import { describeResult } from "./describe-result.ts";
import { fetchText } from "./fetch-text.ts";
import { noLlmsFull } from "./no-llms-full.ts";
import { writeSiteFiles } from "./node/write-site-files.ts";
import { pageText } from "./page-text.ts";
import { pagesText } from "./pages-text.ts";
import { readArgs } from "./read-args.ts";
import type { SiteItem } from "./read-llms-full.ts";
import { readLlmsFull } from "./read-llms-full.ts";
import { readSitemapPages } from "./read-sitemap-pages.ts";
import { siteUrls } from "./site-urls.ts";

type Pages = { text: string; fileName: string; countedIn: CountedIn; items: SiteItem[]; listed?: number };

async function main(args: string[]): Promise<number> {
  const output = outputMode(args);

  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }
  const urls = siteUrls(asked.args.address);
  if (!urls.ok) {
    return failed(urls.problem);
  }

  const pages = await readPages(urls.llmsFull, new URL(urls.home).origin, asked.args.fromSitemap);
  if (!pages.ok) {
    return failed(pages.problem);
  }
  const home = await fetchText(urls.home, fetch);
  if (!home.ok) {
    return failed(home.problem);
  }

  const written = await writeSiteFiles(asked.args.folder, pageText(home.text), pages.read.text, pages.read.fileName);
  if (!written.ok) {
    return failed(written.problem);
  }

  const counts = countSite(pages.read.items);
  printOutput(describeResult({ ...written.files, countedIn: pages.read.countedIn, counts, listed: pages.read.listed }), output);
  return EXIT_DONE;
}

// The site's pages: its /llms-full.txt; the sitemap's pages when the person said yes to that
async function readPages(llmsFullUrl: string, origin: string, fromSitemap: boolean): Promise<{ ok: true; read: Pages } | { ok: false; problem: string }> {
  if (fromSitemap) {
    const read = await readSitemapPages(origin, fetch);
    if (!read.ok) {
      return read;
    }
    const text = pagesText(read.items);
    return { ok: true, read: { text, fileName: "pages.txt", countedIn: "the sitemap", items: read.items, listed: read.listed } };
  }

  const llmsFull = await fetchText(llmsFullUrl, fetch);
  if (!llmsFull.ok) {
    return { ok: false, problem: noLlmsFull(llmsFullUrl, llmsFull.problem) };
  }
  const items = readLlmsFull(llmsFull.text);
  return { ok: true, read: { text: llmsFull.text, fileName: "llms-full.txt", countedIn: "/llms-full.txt", items } };
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
