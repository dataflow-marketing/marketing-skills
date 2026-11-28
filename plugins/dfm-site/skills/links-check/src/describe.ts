// What the check found, in plain lines.

import type { SiteCheck } from "./check-site.ts";

export function describeCheck(check: SiteCheck): string {
  const lines = [`links-check: ${check.origin}`, `pages read: ${check.pagesRead}; links checked: ${check.linksChecked}`];
  if (check.pagesOverLimit > 0 || check.linksOverLimit > 0) {
    lines.push(`not read this time: ${check.pagesOverLimit} more pages, ${check.linksOverLimit} more links (over the limit)`);
  }
  for (const page of check.pagesNotRead) {
    lines.push(`page not read: ${page}`);
  }
  if (check.broken.length === 0) {
    lines.push("links that do not work: none");
  } else {
    lines.push(`links that do not work: ${check.broken.length}`);
    for (const link of check.broken) {
      lines.push(`  ${link.url}: ${link.problem}, on ${link.onPages.join(", ")}`);
    }
  }
  return lines.join("\n");
}
