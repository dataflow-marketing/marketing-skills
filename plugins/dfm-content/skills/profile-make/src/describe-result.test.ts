import { describe, expect, it } from "vitest";
import { describeResult } from "./describe-result.ts";

describe("describeResult", () => {
  it("names the files and gives the counted part to copy into the profile", () => {
    const text = describeResult({
      homeFile: "site/home.txt",
      pagesFile: "site/llms-full.txt",
      countedFile: "site/counted.txt",
      fingerprintsFile: "site/fingerprints.txt",
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
      countedFile: "site/counted.txt",
      fingerprintsFile: "site/fingerprints.txt",
      countedIn: "the sitemap",
      counts: { pages: 40, posts: 10 },
      listed: 80,
    }).text;
    expect(text).toContain("read the pages the sitemap lists into site/pages.txt");
    expect(text).toContain("the sitemap lists 80 pages: the first 50 were read");
    expect(text).toContain("(in the sitemap)");
  });

  it("says what changed since the last read", () => {
    const text = describeResult({
      homeFile: "m2/home.txt",
      pagesFile: "m2/pages.txt",
      countedFile: "m2/counted.txt",
      fingerprintsFile: "m2/fingerprints.txt",
      changedFile: "m2/changed.txt",
      changes: { added: [], changed: [], removed: [], same: 4 },
      countedIn: "the sitemap",
      counts: { pages: 4, posts: 0 },
    }).text;
    expect(text).toContain("since the last read: 0 new, 0 changed, 0 gone, 4 the same; the new and changed pages are in m2/changed.txt");
  });
});
