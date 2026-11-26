// The coffee shop's website as profile-make reads it: its home page and its /llms-full.txt, in Ghost's shape.
// Made up for the examples and tests: the coffee shop and its website are not real.

export const COFFEE_SHOP_ADDRESS = "https://coffee-shop.example";

export const COFFEE_SHOP_HOME_HTML = `<!doctype html>
<html><head><title>The coffee shop</title><script>track()</script></head>
<body>
<h1>The coffee shop</h1>
<p>Good coffee on your way to work.</p>
<p>Ask about our stamp card: the tenth coffee is on us.</p>
</body></html>
`;

export const COFFEE_SHOP_LLMS_FULL = `# The coffee shop
> Good coffee on your way to work.
Public Ghost content for AI and LLM tooling.
## Pages
### About us
URL: https://coffee-shop.example/about/
Last updated: 2026-11-20T01:00:00.000Z
We are a takeaway coffee shop by the station.

## Our hours
Open from seven, closed by three.
## Posts
### Iced coffee is back
URL: https://coffee-shop.example/iced-coffee/
Last updated: 2026-11-24T01:00:00.000Z
The first hot morning always brings the same question at the counter. Iced coffee is back from Monday.
### Stamp card
URL: https://coffee-shop.example/stamp-card/
Last updated: 2026-11-10T01:00:00.000Z
Ask for a stamp card. The tenth coffee is on us.
`;

// The same site as its sitemap lists it, for a site with no /llms-full.txt
export const COFFEE_SHOP_PAGES: Record<string, string> = {
  [`${COFFEE_SHOP_ADDRESS}/sitemap.xml`]: `<sitemapindex><sitemap><loc>${COFFEE_SHOP_ADDRESS}/sitemap-pages.xml</loc></sitemap><sitemap><loc>${COFFEE_SHOP_ADDRESS}/sitemap-posts.xml</loc></sitemap></sitemapindex>`,
  [`${COFFEE_SHOP_ADDRESS}/sitemap-pages.xml`]: `<urlset><url><loc>${COFFEE_SHOP_ADDRESS}/about/</loc></url></urlset>`,
  [`${COFFEE_SHOP_ADDRESS}/sitemap-posts.xml`]: `<urlset><url><loc>${COFFEE_SHOP_ADDRESS}/iced-coffee/</loc></url><url><loc>${COFFEE_SHOP_ADDRESS}/stamp-card/</loc></url></urlset>`,
  [`${COFFEE_SHOP_ADDRESS}/about/`]: "<title>About us</title><p>We are a takeaway coffee shop by the station.</p>",
  [`${COFFEE_SHOP_ADDRESS}/iced-coffee/`]: "<title>Iced coffee is back</title><p>Iced coffee is back from Monday.</p>",
  [`${COFFEE_SHOP_ADDRESS}/stamp-card/`]: "<title>Stamp card</title><p>The tenth coffee is on us.</p>",
};
