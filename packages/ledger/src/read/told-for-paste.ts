// `told` is the spec 1 word for the earlier `paste`: someone tells us the number.
// A fact's source is read with the spec 1 word: everything after the reader sees one word.
// Only the whole first word changes: `paste (stated)` becomes `told (stated)`; `ghost paste` stays.

const PASTE = /^paste(?=[\s(]|$)/;

export function toldForPaste(source: string): string {
  return source.replace(PASTE, "told");
}
