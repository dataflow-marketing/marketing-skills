// Look-alike punctuation, as people and AI chats paste it, made the plain kind the format reads (spec/ledger.md,
// Plain ASCII). Only these change: everything else in a ledger is kept exactly as written.
//
//   curly quotes and apostrophes   become " and '
//   odd spaces (no break, thin)    become an ordinary space
//   a byte order mark at the start is dropped
//
// The arrow and the minus sign are read by the grammar itself.

const CURLY_DOUBLE = /[\u201C\u201D\u201E\u201F]/g;
const CURLY_SINGLE = /[\u2018\u2019\u201A\u201B]/g;
const ODD_SPACES = /[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g;
const BYTE_ORDER_MARK = /^\uFEFF/;

export function tidyPasted(text: string): string {
  return text
    .replace(BYTE_ORDER_MARK, "")
    .replace(CURLY_DOUBLE, '"')
    .replace(CURLY_SINGLE, "'")
    .replace(ODD_SPACES, " ");
}
