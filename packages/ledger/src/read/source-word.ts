// Every graph and plan line ends with where it came from (spec/ledger.md, Where a number came from):
// "(stated)", "(observed)" or "(inferred)". The word is taken off before the line is read; a line with none,
// as older ledgers have, came from the person: stated.

export type SourceWord = "stated" | "observed" | "inferred";

const AT_THE_END = /\s*\((stated|observed|inferred)\)\s*$/;

export function splitSource(text: string): { text: string; source: SourceWord; written: boolean } {
  const found = AT_THE_END.exec(text);
  if (!found) {
    return { text, source: "stated", written: false };
  }
  return { text: text.slice(0, found.index), source: found[1] as SourceWord, written: true };
}
