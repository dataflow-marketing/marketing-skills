// Says what profile-make read and counted: text for a person and the same as data for --json.

import type { ScriptResult } from "@dataflow-marketing/core";
import type { SiteCounts } from "./count-site.ts";
import type { CountedIn } from "./counted-section.ts";
import { countedSection } from "./counted-section.ts";
import type { Changes } from "./changed-pages.ts";

export type ReadSite = {
  homeFile: string;
  pagesFile: string;
  countedFile: string;
  fingerprintsFile: string;
  changedFile?: string;
  changes?: Changes;
  countedIn: CountedIn;
  counts: SiteCounts;
  listed?: number;
};

export function describeResult(read: ReadSite): ScriptResult {
  const lines = [`read the home page into ${read.homeFile}`, `read ${pagesRead(read)} into ${read.pagesFile}`];
  if (read.listed !== undefined && read.listed > read.counts.pages + read.counts.posts) {
    lines.push(`the sitemap lists ${read.listed} pages: the first ${read.counts.pages + read.counts.posts} were read`);
  }
  lines.push(`kept the counts in ${read.countedFile}, for the profile's check`);
  if (read.changes && read.changedFile) {
    const { added, changed, removed, same } = read.changes;
    lines.push(`since the last read: ${added.length} new, ${changed.length} changed, ${removed.length} gone, ${same} the same; the new and changed pages are in ${read.changedFile}`);
  }
  lines.push("", "for the profile, word for word:", countedSection(read.counts, read.countedIn));
  return { text: lines.join("\n"), data: read };
}

function pagesRead(read: ReadSite): string {
  if (read.countedIn === "the sitemap") {
    return "the pages the sitemap lists";
  }
  return "/llms-full.txt";
}
