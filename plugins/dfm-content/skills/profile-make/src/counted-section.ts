// The counted part of a profile (spec/profile.md), written by code. The model is given it as facts it keeps as is.

import type { SiteCounts } from "./count-site.ts";

// Where the pages were counted: the site's /llms-full.txt or the pages its sitemap lists
export type CountedIn = "/llms-full.txt" | "the sitemap";

export function countedSection(counts: SiteCounts, countedIn: CountedIn = "/llms-full.txt"): string {
  const lines = ["=== counted ===", `pages: ${counts.pages}, posts: ${counts.posts} (in ${countedIn})`];
  if (counts.wordsPerPost) {
    const { average, fewest, most } = counts.wordsPerPost;
    lines.push(`words per post: about ${average} on average, ${fewest} to ${most}`);
  }
  if (counts.published) {
    lines.push(`posts published: ${counts.published.first} to ${counts.published.last}`);
  }
  return lines.join("\n");
}
