// A site's address, as a check reads it: https; a site on this computer (http://localhost) is read the same way.
// Gives back its origin ("https://coffee-shop.example") or a problem to show.

import { isLocalAddress } from "@dataflow-marketing/core";

export type SiteAddress = { ok: true; origin: string } | { ok: false; problem: string };

export function siteAddress(written: string): SiteAddress {
  let url: URL;
  try {
    url = new URL(written);
  } catch {
    return { ok: false, problem: `${written} is not a web address` };
  }
  if (url.protocol !== "https:" && !isLocalAddress(url)) {
    return { ok: false, problem: `${written} is not https://: a site is read over https (on this computer: http://localhost)` };
  }
  return { ok: true, origin: url.origin };
}
