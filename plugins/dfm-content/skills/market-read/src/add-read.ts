// Adds one read to a market ledger's done part: its read line and counts, then a said line for every post
// with a day that no earlier read found (a post is said once). The model's lines (the graph, the plan and
// what changed) are its own job; the ticks and summary are written by refresh.

import { readDone } from "./done-lines.ts";
import { joinParts, splitParts } from "./ledger-parts.ts";
import { mondayOf } from "./mondays.ts";
import type { ReadCounts } from "./read-counts.ts";
import type { Post } from "./read-posts.ts";
import { saidFor } from "./said-line.ts";

export type ReadFound = { day: string; counts: ReadCounts; posts: Post[] };

export type AddedRead = { text: string; newPosts: number; undated: number };

export function addRead(ledgerText: string, read: ReadFound): AddedRead {
  const parts = splitParts(ledgerText);
  const known = new Set(readDone(parts.done).said.map((said) => said.url));
  const monday = mondayOf(read.day);

  const dated = read.posts.filter((post): post is Post & { day: string } => post.day !== undefined);
  const fresh = dated.filter((post) => !known.has(post.url)).map(saidFor).sort((a, b) => a.day.localeCompare(b.day));

  const lines = [
    `${monday} read on ${read.day}`,
    `${monday} fact total pages: ${read.counts.pages}`,
    `${monday} fact total posts: ${read.counts.posts}`,
    ...fresh.map((said) => said.line),
  ];
  const done = parts.done.length > 0 ? [...parts.done, "", ...lines] : lines;

  return { text: joinParts({ ...parts, done }), newPosts: fresh.length, undated: read.posts.length - dated.length };
}
