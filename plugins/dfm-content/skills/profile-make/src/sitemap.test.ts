import { describe, expect, it } from "vitest";
import { pagesAndPostsSitemaps, readSitemap } from "./sitemap.ts";

const ORIGIN = "https://coffee-shop.example";

describe("readSitemap", () => {
  it("reads an index of sitemaps", () => {
    const xml = `<sitemapindex><sitemap><loc>${ORIGIN}/sitemap-pages.xml</loc></sitemap><sitemap><loc>${ORIGIN}/sitemap-tags.xml</loc></sitemap></sitemapindex>`;
    expect(readSitemap(xml, ORIGIN)).toEqual({
      isIndex: true,
      addresses: [`${ORIGIN}/sitemap-pages.xml`, `${ORIGIN}/sitemap-tags.xml`],
    });
  });

  it("reads the pages of a sitemap and leaves out other sites", () => {
    const xml = `<urlset><url><loc>${ORIGIN}/about/</loc></url><url><loc>https://elsewhere.example/</loc></url></urlset>`;
    expect(readSitemap(xml, ORIGIN)).toEqual({ isIndex: false, addresses: [`${ORIGIN}/about/`] });
  });
});

describe("pagesAndPostsSitemaps", () => {
  it("keeps the pages and posts sitemaps of an index and says which is which", () => {
    const chosen = pagesAndPostsSitemaps([
      `${ORIGIN}/sitemap-pages.xml`,
      `${ORIGIN}/sitemap-posts.xml`,
      `${ORIGIN}/sitemap-tags.xml`,
    ]);
    expect(chosen).toEqual([
      { address: `${ORIGIN}/sitemap-pages.xml`, kind: "page" },
      { address: `${ORIGIN}/sitemap-posts.xml`, kind: "post" },
    ]);
  });

  it("reads every sitemap when none is named for pages or posts", () => {
    expect(pagesAndPostsSitemaps([`${ORIGIN}/sitemap-1.xml`])).toEqual([{ address: `${ORIGIN}/sitemap-1.xml`, kind: "page" }]);
  });
});
