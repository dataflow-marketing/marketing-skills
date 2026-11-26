// Writes the settings line for a Ghost site, in the shape of spec/settings.md:
// site coffee-shop: ghost https://coffee-shop.example key in COFFEE_SHOP_GHOST_ADMIN_KEY

import type { Site } from "@dataflow-marketing/core";

export function siteLine(site: Site): string {
  return `site ${site.business}: ${site.platform} ${site.address} key in ${site.keyName}`;
}
