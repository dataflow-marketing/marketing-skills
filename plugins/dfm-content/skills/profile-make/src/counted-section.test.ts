import { describe, expect, it } from "vitest";
import { countedSection } from "./counted-section.ts";

describe("countedSection", () => {
  it("is in the shape of spec/profile.md", () => {
    const counts = { pages: 3, posts: 4, wordsPerPost: { average: 40, fewest: 25, most: 60 } };
    expect(countedSection(counts)).toBe(
      "=== counted ===\npages: 3, posts: 4 (in /llms-full.txt)\nwords per post: about 40 on average, 25 to 60",
    );
  });

  it("leaves out words per post when there are no posts", () => {
    expect(countedSection({ pages: 2, posts: 0 })).toBe("=== counted ===\npages: 2, posts: 0 (in /llms-full.txt)");
  });

  it("says when the pages were counted in the sitemap", () => {
    expect(countedSection({ pages: 2, posts: 1 }, "the sitemap")).toBe("=== counted ===\npages: 2, posts: 1 (in the sitemap)");
  });
});
