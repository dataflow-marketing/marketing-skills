// Builds the one request post-draft sends: create a post from the words file.
// It never names a status. Ghost makes every new post a draft unless told otherwise:
// leaving status out is what keeps it a draft.

import type { Site } from "@dataflow-marketing/core";
import { ACCEPT_VERSION, postsUrl } from "./admin-api.ts";
import { bodyHtml } from "./body-html.ts";
import { slugFromLink } from "./slug-from-link.ts";
import type { DraftRequest, ExpectedPost, Words } from "./types.ts";

type NewPost = {
  title: string;
  html: string;
  custom_excerpt?: string;
  tags?: { name: string }[];
  slug?: string;
};

export function draftRequest(words: Words, site: Site): DraftRequest {
  const post = newPost(words, site);
  return {
    method: "POST",
    url: postsUrl(site.address),
    headers: {
      "Content-Type": "application/json",
      "Accept-Version": ACCEPT_VERSION,
    },
    body: JSON.stringify({ posts: [post] }, null, 2),
  };
}

export function expectedPost(words: Words, site: Site): ExpectedPost {
  const expected: ExpectedPost = { title: words.title ?? "" };
  const slug = slugFromLink(words.link, site.address);
  if (slug) {
    expected.slug = slug;
  }
  return expected;
}

function newPost(words: Words, site: Site): NewPost {
  const post: NewPost = {
    title: words.title ?? "",
    html: bodyHtml(words.paragraphs),
  };
  if (words.excerpt) {
    post.custom_excerpt = words.excerpt;
  }
  if (words.tags.length > 0) {
    post.tags = words.tags.map((name) => ({ name }));
  }
  const slug = slugFromLink(words.link, site.address);
  if (slug) {
    post.slug = slug;
  }
  return post;
}
