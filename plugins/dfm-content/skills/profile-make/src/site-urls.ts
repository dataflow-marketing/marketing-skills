// The two addresses profile-make reads, from the site's own address: its home page and its /llms-full.txt.
// Only an https:// address is read.

export type SiteUrls = { ok: true; home: string; llmsFull: string } | { ok: false; problem: string };

export function siteUrls(address: string): SiteUrls {
  let url: URL;
  try {
    url = new URL(address);
  } catch {
    return { ok: false, problem: `Not a web address: ${address}` };
  }
  if (url.protocol !== "https:") {
    return { ok: false, problem: "The address must start with https://" };
  }
  const home = `${url.origin}/`;
  return { ok: true, home, llmsFull: `${url.origin}/llms-full.txt` };
}
