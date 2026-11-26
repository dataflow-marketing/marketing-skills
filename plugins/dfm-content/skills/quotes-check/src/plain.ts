// Makes text plain for matching, the same way on both sides of a match:
// straight quote marks, no Markdown links or bold, one space between words, lower case.

export function plain(text: string): string {
  let result = text;
  result = result.replace(/[\u2018\u2019]/g, "'");
  result = result.replace(/[\u201C\u201D]/g, '"');
  result = result.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  result = result.replace(/\*\*|__/g, "");
  result = result.replace(/\s+/g, " ");
  return result.trim().toLowerCase();
}
