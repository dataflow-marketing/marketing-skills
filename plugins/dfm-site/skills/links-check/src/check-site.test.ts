import { describe, expect, it } from "vitest";
import { checkSite } from "./check-site.ts";
import { describeCheck } from "./describe.ts";
import { pageLinks } from "./page-links.ts";

const SITE = "https://coffee-shop.example";
const pages: Record<string, { status: number; text: string }> = {
  [`${SITE}/sitemap.xml`]: { status: 200, text: `<urlset><url><loc>${SITE}/about/</loc></url></urlset>` },
  [`${SITE}/`]: { status: 200, text: `<a href="/about/">About</a> <a href="https://bakery.example/cakes">Cakes</a> <a href="mailto:hi@x.example">Mail</a> <a href="#top">Top</a>` },
  [`${SITE}/about/`]: { status: 200, text: `<a href="/">Home</a> <a href="/old-menu/">Menu</a>` },
  "https://bakery.example/cakes": { status: 405, text: "" },
};
const send = async (url: string, init: RequestInit) => {
  if (url === "https://bakery.example/cakes" && init.method === "GET") {
    return new Response("cakes", { status: 200 });
  }
  const page = pages[url] ?? { status: 404, text: "not found" };
  return new Response(page.text, { status: page.status });
};
const noWait = async () => {};

describe("checkSite", () => {
  it("names each link that does not work and the pages it is on", async () => {
    const check = await checkSite(SITE, send, noWait, { maxPages: 50, maxLinks: 300, pauseMs: 0 });
    expect(describeCheck(check)).toBe(
      [
        "links-check: https://coffee-shop.example",
        "pages read: 2; links checked: 4",
        "links that do not work: 1",
        "  https://coffee-shop.example/old-menu/: answered 404, on https://coffee-shop.example/about/",
      ].join("\n"),
    );
  });

  it("keeps to its limits and says what it left out", async () => {
    const check = await checkSite(SITE, send, noWait, { maxPages: 1, maxLinks: 1, pauseMs: 0 });
    expect([check.pagesRead, check.pagesOverLimit, check.linksChecked, check.linksOverLimit]).toEqual([1, 1, 1, 1]);
  });
});

describe("pageLinks", () => {
  it("makes links whole, drops #parts and leaves out what a visitor cannot follow", () => {
    expect(pageLinks(`<a href="/a/#x">A</a><a href='b'>B</a><a href="tel:123">T</a><a href="javascript:go()">J</a>`, "https://x.example/menu/")).toEqual([
      "https://x.example/a/",
      "https://x.example/menu/b",
    ]);
  });
});
