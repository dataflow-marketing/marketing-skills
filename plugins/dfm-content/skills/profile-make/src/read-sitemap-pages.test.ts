import { describe, expect, it } from "vitest";
import { PAGE_LIMIT, readSitemapPages } from "./read-sitemap-pages.ts";

const ORIGIN = "https://coffee-shop.example";

function site(pages: Record<string, string>) {
  return async (url: string) => {
    const body = pages[url];
    return body === undefined ? new Response("not found", { status: 404 }) : new Response(body, { status: 200 });
  };
}

describe("readSitemapPages", () => {
  it("reads the pages and posts an index lists, as text with their titles", async () => {
    const send = site({
      [`${ORIGIN}/sitemap.xml`]: `<sitemapindex><sitemap><loc>${ORIGIN}/sitemap-pages.xml</loc></sitemap><sitemap><loc>${ORIGIN}/sitemap-posts.xml</loc></sitemap></sitemapindex>`,
      [`${ORIGIN}/sitemap-pages.xml`]: `<urlset><url><loc>${ORIGIN}/about/</loc></url></urlset>`,
      [`${ORIGIN}/sitemap-posts.xml`]: `<urlset><url><loc>${ORIGIN}/iced-coffee/</loc></url></urlset>`,
      [`${ORIGIN}/about/`]: "<title>About us</title><p>A takeaway coffee shop.</p>",
      [`${ORIGIN}/iced-coffee/`]: "<title>Iced coffee is back</title><p>From Monday.</p>",
    });
    const read = await readSitemapPages(ORIGIN, send);
    expect(read.ok && read.items.map((item) => [item.kind, item.title, item.text])).toEqual([
      ["page", "About us", "A takeaway coffee shop."],
      ["post", "Iced coffee is back", "From Monday."],
    ]);
  });

  it("reads no more than the limit and says how many were listed", async () => {
    const many = Array.from({ length: PAGE_LIMIT + 5 }, (_, index) => `${ORIGIN}/p${index}/`);
    const pages: Record<string, string> = {
      [`${ORIGIN}/sitemap.xml`]: `<urlset>${many.map((address) => `<url><loc>${address}</loc></url>`).join("")}</urlset>`,
    };
    for (const address of many) {
      pages[address] = "<p>words</p>";
    }
    const read = await readSitemapPages(ORIGIN, site(pages));
    expect(read.ok && read.items.length).toBe(PAGE_LIMIT);
    expect(read.ok && read.listed).toBe(PAGE_LIMIT + 5);
  });

  it("says when there is no sitemap either", async () => {
    const read = await readSitemapPages(ORIGIN, site({}));
    expect(!read.ok && read.problem).toMatch(/no https:\/\/coffee-shop.example\/sitemap.xml either/);
  });
});
