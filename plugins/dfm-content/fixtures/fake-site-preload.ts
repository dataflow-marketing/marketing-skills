// Loaded with node --import before profile-make's dist/run.js in its end to end test.
// It swaps the global fetch for the coffee shop's made up site: nothing leaves the machine.
// FAKE_SITE=no-llms-full makes /llms-full.txt answer 404; the sitemap still lists the pages.

import { COFFEE_SHOP_HOME_HTML, COFFEE_SHOP_LLMS_FULL, COFFEE_SHOP_PAGES } from "./coffee-shop-site.ts";

const withoutLlmsFull = process.env.FAKE_SITE === "no-llms-full";

globalThis.fetch = async (input: string | URL | Request): Promise<Response> => {
  const url = String(input instanceof Request ? input.url : input);
  if (url.endsWith("/llms-full.txt")) {
    if (withoutLlmsFull) {
      return new Response("not found", { status: 404 });
    }
    return new Response(COFFEE_SHOP_LLMS_FULL, { status: 200 });
  }
  const page = COFFEE_SHOP_PAGES[url];
  if (page !== undefined) {
    return new Response(page, { status: 200 });
  }
  return new Response(COFFEE_SHOP_HOME_HTML, { status: 200 });
};
