// Checks the post as Ghost has it now. The status must be draft: anything else
// means a post went out that no person published: a failure, never a note.
// The title and slug must be what was sent.

import type { ExpectedPost, GhostPost } from "./types.ts";

export type ReadBackCheck = {
  isDraft: boolean;
  problems: string[];
};

export function checkReadBack(post: GhostPost, expected: ExpectedPost): ReadBackCheck {
  const problems: string[] = [];
  const isDraft = post.status === "draft";

  if (!isDraft) {
    problems.push(`FAILED: Ghost says the post is ${post.status}, not a draft. Open it in Ghost now and set it back to draft.`);
  }
  if (post.title !== expected.title) {
    problems.push(`The title on Ghost is "${post.title}", not "${expected.title}".`);
  }
  if (post.slug === "") {
    problems.push("The post on Ghost has no slug.");
  }
  if (expected.slug && post.slug !== expected.slug) {
    problems.push(`The slug on Ghost is ${post.slug}, not ${expected.slug}: another post may have it already.`);
  }

  return { isDraft, problems };
}
