// Reads a site's /llms-full.txt into its pages and posts.
// Ghost writes "## Pages" and "## Posts", then each item as "### <title>" followed by a "URL: " line.
// A "## " heading inside an item's text is part of the text, not a new section.

export type SiteItem = {
  kind: "page" | "post";
  title: string;
  url: string;
  text: string;
};

export function readLlmsFull(text: string): SiteItem[] {
  const lines = text.split(/\r?\n/);
  const items: SiteItem[] = [];
  let kind: SiteItem["kind"] = "page";
  let current: SiteItem | undefined;

  lines.forEach((line, index) => {
    const section = sectionOf(line);
    if (section) {
      kind = section;
      current = undefined;
      return;
    }
    const startsItem = line.startsWith("### ") && (lines[index + 1] ?? "").startsWith("URL: ");
    if (startsItem) {
      current = { kind, title: line.slice(4).trim(), url: lines[index + 1].slice(5).trim(), text: "" };
      items.push(current);
      return;
    }
    if (current && !isItemDetail(line)) {
      current.text += `${line}\n`;
    }
  });

  return items;
}

function sectionOf(line: string): SiteItem["kind"] | undefined {
  if (line.trim() === "## Pages") {
    return "page";
  }
  if (line.trim() === "## Posts") {
    return "post";
  }
  return undefined;
}

// The URL and Last updated lines describe an item; they are not its words
function isItemDetail(line: string): boolean {
  return line.startsWith("URL: ") || line.startsWith("Last updated: ");
}
