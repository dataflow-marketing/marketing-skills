// What an /llms.txt holds (llmstxt.org): a "# " title, a "> " summary, "## " sections and Markdown links.
// And what an /llms-full.txt holds: its pages and posts, each a "### " item (as Ghost writes it).

export type LlmsTxt = { title?: string; summary?: string; sections: string[]; links: number; words: number };
export type LlmsFull = { items: number; words: number };

const LINK = /\[[^\]]*\]\([^)]+\)/g;

export function readLlmsTxt(text: string): LlmsTxt {
  const lines = text.split(/\r?\n/);
  const title = lines.find((line) => /^# /.test(line))?.slice(2).trim();
  const summary = lines.find((line) => /^> /.test(line))?.slice(2).trim();
  const sections = lines.filter((line) => /^## /.test(line)).map((line) => line.slice(3).trim());
  const read: LlmsTxt = { sections, links: (text.match(LINK) ?? []).length, words: wordsIn(text) };
  if (title) {
    read.title = title;
  }
  if (summary) {
    read.summary = summary;
  }
  return read;
}

export function readLlmsFull(text: string): LlmsFull {
  return { items: text.split(/\r?\n/).filter((line) => /^### /.test(line)).length, words: wordsIn(text) };
}

function wordsIn(text: string): number {
  return text.split(/\s+/).filter((word) => /\w/.test(word)).length;
}
