import { describe, expect, it } from "vitest";
import { describeResult } from "./describe-result.ts";

describe("describeResult", () => {
  it("names the files and gives the counted part to copy into the profile", () => {
    const text = describeResult({
      homeFile: "site/home.txt",
      pagesFile: "site/llms-full.txt",
      countedIn: "/llms-full.txt",
      counts: { pages: 1, posts: 2, wordsPerPost: { average: 15, fewest: 10, most: 20 } },
    }).text;
    expect(text).toContain("read the home page into site/home.txt");
    expect(text).toContain("=== counted ===\npages: 1, posts: 2 (in /llms-full.txt)");
  });

  it("says the pages came from the sitemap and how many were left unread", () => {
    const text = describeResult({
      homeFile: "site/home.txt",
      pagesFile: "site/pages.txt",
      countedIn: "the sitemap",
      counts: { pages: 40, posts: 10 },
      listed: 80,
    }).text;
    expect(text).toContain("read the pages the sitemap lists into site/pages.txt");
    expect(text).toContain("the sitemap lists 80 pages: the first 50 were read");
    expect(text).toContain("(in the sitemap)");
  });
});
