// What the check found, in plain lines.

import type { LlmsCheck } from "./check-llms.ts";

export function describeCheck(check: LlmsCheck): string {
  const lines = [`llms-check: ${check.origin}`];
  if (check.llmsTxt.on) {
    const read = check.llmsTxt.read;
    lines.push(`/llms.txt: on, ${read.words} words, ${read.links} links`);
    lines.push(`  title: ${read.title ?? "none (it should start with a # title)"}`);
    lines.push(`  summary: ${read.summary ?? "none (a > line under the title says what the site is)"}`);
    lines.push(`  sections: ${read.sections.length > 0 ? read.sections.join(", ") : "none"}`);
  } else {
    lines.push(`/llms.txt: not on (${check.llmsTxt.problem})`);
  }
  if (check.llmsFull.on) {
    lines.push(`/llms-full.txt: on, ${check.llmsFull.read.items} pages and posts, ${check.llmsFull.read.words} words`);
  } else {
    lines.push(`/llms-full.txt: not on (${check.llmsFull.problem})`);
  }
  return lines.join("\n");
}
