// Reads a sitemap: the addresses it lists and whether it is an index of other sitemaps.
// From an index only the sitemaps of pages and posts are read (Ghost and WordPress name them so); when none is
// named that way, every one is read. An address on another site is left out.

export type Sitemap = { isIndex: boolean; addresses: string[] };

export function readSitemap(xml: string, origin: string): Sitemap {
  const isIndex = /<sitemapindex[\s>]/i.test(xml);
  const addresses = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((match) => unescapeXml(match[1]));
  return { isIndex, addresses: addresses.filter((address) => onSite(address, origin)) };
}

// The sitemaps of an index worth reading, with what each holds
export function pagesAndPostsSitemaps(addresses: readonly string[]): { address: string; kind: "page" | "post" }[] {
  const named = addresses.filter((address) => kindOfSitemap(address) !== undefined);
  const chosen = named.length > 0 ? named : addresses;
  return chosen.map((address) => ({ address, kind: kindOfSitemap(address) ?? "page" }));
}

function kindOfSitemap(address: string): "page" | "post" | undefined {
  const name = address.toLowerCase().split("/").pop() ?? "";
  if (name.includes("post")) {
    return "post";
  }
  if (name.includes("page")) {
    return "page";
  }
  return undefined;
}

function onSite(address: string, origin: string): boolean {
  try {
    return new URL(address).origin === origin;
  } catch {
    return false;
  }
}

function unescapeXml(text: string): string {
  return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
