// What a business said in a week, from its Ghost posts: one said line per post, saying how it went out (by email,
// on the website or both), on which day in the business's time zone, who it was for and a summary in their words.
//   2026-11-23 said by email and on the website on 2026-11-24: "Title" https://... [Parents, Teachers] summary: "..."
// A post counts in the week it was emailed or published, whatever date it carries. Drafts and scheduled posts never.

import { theirWords } from "./their-words.ts";

export type Post = {
  title: string;
  url: string;
  status: string;
  published_at?: string | null;
  custom_excerpt?: string | null;
  plaintext?: string | null;
  tags?: { slug: string }[];
  email?: { email_count?: number; created_at?: string } | null;
};

// a group that names who a post is for, by the tag the post carries
export type TagGroup = { name: string; tag: string };

export type Week = { week: string; from: string; to: string };

export function saidLines(posts: readonly Post[], groups: readonly TagGroup[], week: Week, timeZone: string): string[] {
  return posts.flatMap((post) => {
    const emailed = Boolean(post.email?.email_count) && inWeek(post.email?.created_at, week);
    const published = post.status === "published" && inWeek(post.published_at, week);
    if (!emailed && !published) {
      return [];
    }
    const how = howItWentOut(emailed, published);
    const on = dayIn(String(emailed ? post.email?.created_at : post.published_at), timeZone);
    const forWho = whoFor(post, groups);
    return [`${week.week} said ${how} on ${on}: "${post.title}" ${post.url} [${forWho.join(", ")}] summary: "${theirWords(post)}"`];
  });
}

function howItWentOut(emailed: boolean, published: boolean): string {
  if (emailed && published) {
    return "by email and on the website";
  }
  return emailed ? "by email" : "on the website";
}

// each group whose tag the post carries, in the order the ledger declares them; otherwise everyone
function whoFor(post: Post, groups: readonly TagGroup[]): string[] {
  const slugs = (post.tags ?? []).map((tag) => tag.slug);
  const named = groups.filter((group) => slugs.includes(group.tag)).map((group) => group.name);
  return named.length > 0 ? named : ["everyone"];
}

function inWeek(moment: string | null | undefined, week: Week): boolean {
  if (!moment) {
    return false;
  }
  const at = Date.parse(moment);
  return at >= Date.parse(week.from) && at < Date.parse(week.to);
}

// the day a moment falls on in the business's time zone, such as 2026-11-24
export function dayIn(moment: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(moment));
}
