// Counts what a profile states as facts: pages, posts and words per post. Code only, never a model.

import type { SiteItem } from "./read-llms-full.ts";

export type SiteCounts = {
  pages: number;
  posts: number;
  wordsPerPost?: { average: number; fewest: number; most: number };
  // the first and last days posts say they were published, when they say so
  published?: { first: string; last: string };
};

export function countSite(items: readonly SiteItem[]): SiteCounts {
  const posts = items.filter((item) => item.kind === "post");
  const counts: SiteCounts = { pages: items.length - posts.length, posts: posts.length };
  if (posts.length > 0) {
    counts.wordsPerPost = wordsPerPost(posts.map((post) => wordCount(post.text)));
  }
  const days = posts.flatMap((post) => post.published ?? []).sort();
  if (days.length > 0) {
    counts.published = { first: days[0], last: days[days.length - 1] };
  }
  return counts;
}

function wordsPerPost(words: number[]): { average: number; fewest: number; most: number } {
  const total = words.reduce((sum, each) => sum + each, 0);
  return { average: Math.round(total / words.length), fewest: Math.min(...words), most: Math.max(...words) };
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter((word) => /\w/.test(word)).length;
}
