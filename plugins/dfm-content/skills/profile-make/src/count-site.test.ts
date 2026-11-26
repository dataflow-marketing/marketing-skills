import { describe, expect, it } from "vitest";
import { countSite, wordCount } from "./count-site.ts";

describe("countSite", () => {
  it("counts pages, posts and the words in each post", () => {
    const counts = countSite([
      { kind: "page", title: "About", url: "a", text: "We are a small shop." },
      { kind: "post", title: "One", url: "b", text: "one two three four" },
      { kind: "post", title: "Two", url: "c", text: "one two" },
    ]);
    expect(counts).toEqual({ pages: 1, posts: 2, wordsPerPost: { average: 3, fewest: 2, most: 4 } });
  });

  it("has no words per post when there are no posts", () => {
    expect(countSite([{ kind: "page", title: "About", url: "a", text: "Hi." }])).toEqual({ pages: 1, posts: 0 });
  });
});

describe("wordCount", () => {
  it("counts words, not marks on their own", () => {
    expect(wordCount("Iced coffee - back from Monday!")).toBe(5);
  });
});
