// Turns the text of a keys file into names and values.
// The keys file is a plain .env file: one NAME=value a line.
// Blank lines and lines starting with # are skipped.
// A value may be wrapped in single or double quotes. A note after a value (" # ...") is not part of it.

export type Keys = Record<string, string>;

const KEY_LINE = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/;

export function parseKeysFile(text: string): Keys {
  const keys: Keys = {};
  const lines = text.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) {
      continue;
    }
    const match = KEY_LINE.exec(line);
    if (!match) {
      continue;
    }
    keys[match[1]] = valueOf(match[2].trim());
  }

  return keys;
}

// A quoted value is what is inside its quotes; an unquoted value ends at a " #" note
function valueOf(text: string): string {
  const quote = text[0];
  if (quote === '"' || quote === "'") {
    const closing = text.indexOf(quote, 1);
    if (closing > 0) {
      return text.slice(1, closing);
    }
  }
  const note = text.indexOf(" #");
  if (note >= 0) {
    return text.slice(0, note).trim();
  }
  return text;
}
