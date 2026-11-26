// Looks for one mention in the sources and gives back where it is. Nothing means it is not there.
// Quotes and names are found as plain words; numbers and money by their keys.
// A claim is never found: a person reads it.

import { findWhole } from "./find-whole.ts";
import type { SearchableSource, SourceIndex } from "./index-sources.ts";
import type { Mention, Where } from "./types.ts";

export function findInSource(mention: Mention, index: SourceIndex): Where | undefined {
  if (mention.kind === "quote" || mention.kind === "name") {
    return findWords(mention.key, index.searchable);
  }
  if (mention.kind === "number") {
    return index.numbers.get(mention.key);
  }
  if (mention.kind === "money") {
    return index.money.get(mention.key);
  }
  return undefined;
}

function findWords(words: string, sources: readonly SearchableSource[]): Where | undefined {
  for (const source of sources) {
    const at = findWhole(source.text, words);
    if (at >= 0) {
      return { source: source.name, line: lineAt(source, at) };
    }
  }
  return undefined;
}

function lineAt(source: SearchableSource, offset: number): number {
  let line = 0;
  for (const start of source.lineStarts) {
    if (start.offset > offset) {
      break;
    }
    line = start.line;
  }
  return line;
}
