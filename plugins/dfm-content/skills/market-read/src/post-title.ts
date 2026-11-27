// A post's own title, as the page shows it. A title read from a sitemap is the browser tab's, often
// "<title> | <site name>": the part before " | " is the post's own when the page shows it as a line of its own.

export type PostTitle = { title: string; siteName?: string };

export function postTitle(tabTitle: string, text: string): PostTitle {
  const lines = text.split("\n").map((line) => line.trim());
  const cut = tabTitle.lastIndexOf(" | ");
  if (cut < 0) {
    return { title: tabTitle };
  }
  const own = tabTitle.slice(0, cut);
  if (!lines.includes(own)) {
    return { title: tabTitle };
  }
  return { title: own, siteName: tabTitle.slice(cut + 3) };
}
