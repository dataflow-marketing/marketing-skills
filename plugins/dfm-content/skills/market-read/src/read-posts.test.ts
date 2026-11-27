import { describe, expect, it } from "vitest";
import { readPosts } from "./read-posts.ts";

const PAGES = `## Pages
### Questions | Wattle Street Espresso
URL: http://localhost:4104/questions/
Do you have plant milks?
## Posts
### December's guest coffee | Wattle Street Espresso
URL: http://localhost:4104/news/decembers-guest-coffee/
Published: 2026-12-01
Wattle Street Espresso
December's guest coffee
This month's guest is a natural Ethiopia: blueberry and honey.
### An undated note | Wattle Street Espresso
URL: http://localhost:4104/news/note/
No day on this one.
`;

describe("readPosts", () => {
  it("reads only the posts, each with its day when it says one", () => {
    const posts = readPosts(PAGES);
    expect(posts.map((post) => [post.title, post.day])).toEqual([
      ["December's guest coffee | Wattle Street Espresso", "2026-12-01"],
      ["An undated note | Wattle Street Espresso", undefined],
    ]);
    expect(posts[0].text).toContain("blueberry and honey");
    expect(posts[0].text).not.toContain("Published:");
  });
});
