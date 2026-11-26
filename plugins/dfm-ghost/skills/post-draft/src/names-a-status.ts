// The last guard before sending: does the request body name a status for any post?
// A body that cannot be read is treated as naming one: when in doubt, nothing is sent.

export function namesAStatus(body: string): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return true;
  }

  const posts = postsIn(parsed);
  if (!posts) {
    return true;
  }
  for (const post of posts) {
    if (typeof post !== "object" || post === null || "status" in post) {
      return true;
    }
  }
  return false;
}

function postsIn(parsed: unknown): unknown[] | undefined {
  if (typeof parsed !== "object" || parsed === null || !("posts" in parsed)) {
    return undefined;
  }
  const posts = (parsed as { posts: unknown }).posts;
  if (!Array.isArray(posts)) {
    return undefined;
  }
  return posts;
}
