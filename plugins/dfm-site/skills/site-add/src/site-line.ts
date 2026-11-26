// Writes the settings line for a public site, in the shape of spec/settings.md. A public site has no key:
// site coffee-shop: public https://coffee-shop.example

import type { Site } from "@dataflow-marketing/core";

export const PUBLIC = "public";

export function siteLine(site: Site): string {
  return `site ${site.business}: ${PUBLIC} ${site.address}`;
}
