// The links on one page: every <a href>, made whole against the page's address. Not a link to check: mailto:, tel:,
// javascript: and a jump within the page (#...). A link's #part is dropped: the page is what is checked.

const HREF = /<a\b[^>]*?\bhref\s*=\s*["']([^"']+)["']/gi;
const NOT_A_PAGE = /^(mailto:|tel:|javascript:|#)/i;

export function pageLinks(html: string, pageAddress: string): string[] {
  const links = new Set<string>();
  for (const match of html.matchAll(HREF)) {
    const href = unescapeHtml(match[1].trim());
    if (href === "" || NOT_A_PAGE.test(href)) {
      continue;
    }
    try {
      const url = new URL(href, pageAddress);
      if (url.protocol === "http:" || url.protocol === "https:") {
        url.hash = "";
        links.add(url.href);
      }
    } catch {
      // an href that is not an address is not a link a visitor can follow either: left out
    }
  }
  return [...links];
}

function unescapeHtml(text: string): string {
  return text.replace(/&amp;/g, "&");
}
