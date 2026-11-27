// The pages read from a sitemap, written as one text in the shape of /llms-full.txt: the same reading, counting
// and checking then work on it: "## Pages" and "## Posts", then each as "### <title>" and "URL: <address>".

import type { SiteItem } from "./read-llms-full.ts";

export function pagesText(items: readonly SiteItem[]): string {
  const sections: string[] = [];
  for (const [kind, heading] of [["page", "## Pages"], ["post", "## Posts"]] as const) {
    const ofKind = items.filter((item) => item.kind === kind);
    if (ofKind.length > 0) {
      sections.push(heading, ...ofKind.map(itemText));
    }
  }
  return `${sections.join("\n")}\n`;
}

// a post that says when it was published keeps that day on its own line, as /llms-full.txt keeps "Last updated:"
export function itemText(item: SiteItem): string {
  const published = item.published ? `Published: ${item.published}\n` : "";
  return `### ${item.title}\nURL: ${item.url}\n${published}${item.text.trim()}`;
}
