// Gives back the lines of a text that hold its words, blanking the lines that are format.
// Blanked lines stay as empty strings: line numbers still match the file.
//
// Format, not words:
// the "spec 1" first line, section markers such as "=== body ===" and,
// in a words file, the fields above the body that are not writing (kind, state, channel, link, from).

const SPEC_LINE = /^spec \d+$/;
const SECTION_MARKER = /^=== .+ ===$/;
const BODY_MARKER = "=== body ===";
const FIELDS_NOT_WORDS = ["kind", "state", "channel", "link", "from"];

export function contentLines(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const bodyAt = lines.findIndex((line) => line.trim() === BODY_MARKER);

  return lines.map((line, index) => {
    if (isFormatLine(line, index, bodyAt)) {
      return "";
    }
    return line;
  });
}

function isFormatLine(line: string, index: number, bodyAt: number): boolean {
  const trimmed = line.trim();
  if (index === 0 && SPEC_LINE.test(trimmed)) {
    return true;
  }
  if (SECTION_MARKER.test(trimmed)) {
    return true;
  }
  const inWordsHeader = bodyAt >= 0 && index < bodyAt;
  if (inWordsHeader && isFieldNotWords(trimmed)) {
    return true;
  }
  return false;
}

function isFieldNotWords(line: string): boolean {
  for (const field of FIELDS_NOT_WORDS) {
    if (line.startsWith(`${field}:`)) {
      return true;
    }
  }
  return false;
}
