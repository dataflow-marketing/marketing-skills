// Turns the body's paragraphs into HTML: one <p> a paragraph,
// a line break inside a paragraph kept as <br>. The words are escaped, never changed.

export function bodyHtml(paragraphs: readonly string[]): string {
  const blocks: string[] = [];
  for (const paragraph of paragraphs) {
    const lines = paragraph.split(/\r?\n/).map((line) => escapeHtml(line.trim()));
    blocks.push(`<p>${lines.join("<br>")}</p>`);
  }
  return blocks.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
