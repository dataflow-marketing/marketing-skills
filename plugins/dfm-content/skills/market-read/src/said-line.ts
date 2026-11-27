// A post as the ledger's said line (spec/ledger.md, Done), keyed by the Monday of the week it was published:
// <Monday> said on site on <day>: "<title>" <link> [everyone] summary: "<its first sentence>"

import { firstSentence } from "./first-sentence.ts";
import { mondayOf } from "./mondays.ts";
import { postTitle } from "./post-title.ts";
import type { Post } from "./read-posts.ts";

export type Said = { monday: string; day: string; title: string; url: string; line: string };

export function saidFor(post: Post & { day: string }): Said {
  const { title, siteName } = postTitle(post.title, post.text);
  const skip = siteName ? [title, siteName] : [title];
  const summary = firstSentence(post.text, skip);
  const monday = mondayOf(post.day);
  return {
    monday,
    day: post.day,
    title,
    url: post.url,
    line: `${monday} said on site on ${post.day}: "${title}" ${post.url} [everyone] summary: "${summary}"`,
  };
}
