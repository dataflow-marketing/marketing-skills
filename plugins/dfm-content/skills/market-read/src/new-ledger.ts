// A market ledger before its first read: whose it is and where it is read. What the business is, in a line,
// is left for the model to write from the site: never guessed from its name.

export function newLedger(business: string, site: string, own: boolean): string {
  const graph = [
    `business ${business}:`,
    `site ${site} (sitemap)`,
    ...(own ? ["own"] : []),
    "fact pages: the site's sitemap (observed)",
    "fact posts: the site's sitemap (observed)",
  ];
  return ["spec 1", "=== graph ===", ...graph, "", "=== plan ===", "", "=== done ===", "", "=== summary ===", ""].join("\n");
}
