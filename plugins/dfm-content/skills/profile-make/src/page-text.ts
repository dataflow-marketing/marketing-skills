// Turns a web page's HTML into its readable text, one block a line.
// Scripts, styles, the title, the page's head, its menus (nav) and its footer are left out; tags are taken away;
// entities are put back as their characters.

const LEFT_OUT = /<(script|style|head|title|noscript|svg|nav|footer)\b[\s\S]*?<\/\1>/gi;
const BLOCK_END = /<\/(p|div|h[1-6]|li|section|article|header|footer|blockquote)>|<br\s*\/?>/gi;
const ANY_TAG = /<[^>]+>/g;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
  "&nbsp;": " ",
  "&rarr;": "\u2192",
  "&larr;": "\u2190",
  "&hellip;": "\u2026",
  "&mdash;": "\u2014",
  "&ndash;": "\u2013",
  "&lsquo;": "\u2018",
  "&rsquo;": "\u2019",
  "&ldquo;": "\u201C",
  "&rdquo;": "\u201D",
};

export function pageText(html: string): string {
  const withoutHidden = html.replace(LEFT_OUT, " ");
  const withBreaks = withoutHidden.replace(BLOCK_END, "\n");
  const withoutTags = withBreaks.replace(ANY_TAG, " ");
  return linesOf(putBackEntities(withoutTags)).join("\n");
}

function putBackEntities(text: string): string {
  const named = text.replace(/&[a-z]+;|&#x27;|&#39;/gi, (entity) => ENTITIES[entity] ?? entity);
  return named.replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)));
}

// Each line tidied: spaces joined, empty lines dropped
function linesOf(text: string): string[] {
  const lines: string[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.replace(/\s+/g, " ").trim();
    if (line !== "") {
      lines.push(line);
    }
  }
  return lines;
}
