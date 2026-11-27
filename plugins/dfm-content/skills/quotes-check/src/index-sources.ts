// Makes the sources ready to search, once, before any mention is looked for:
// each source as one plain text with where each of its lines starts. Every number
// and amount of money in it is kept with the line it is first on; a date also
// keeps its year, month and day.

import { dateParts, isDate } from "./dates.ts";
import { currencyOf, findMoney } from "./find-money.ts";
import { findNumbers } from "./find-numbers.ts";
import { plain } from "./plain.ts";
import type { Source, Where } from "./types.ts";

export type LineStart = {
  offset: number;
  line: number;
};

export type SearchableSource = {
  name: string;
  text: string;
  lineStarts: LineStart[];
};

export type SourceIndex = {
  searchable: SearchableSource[];
  numbers: Map<string, Where>;
  money: Map<string, Where>;
};

export function indexSources(sources: readonly Source[]): SourceIndex {
  const index: SourceIndex = {
    searchable: [],
    numbers: new Map(),
    money: new Map(),
  };

  for (const source of sources) {
    index.searchable.push(searchable(source));
    addNumbersAndMoney(index, source);
  }

  return index;
}

// Lines are joined with one space so a quote that runs over a line break is still found.
function searchable(source: Source): SearchableSource {
  const lineStarts: LineStart[] = [];
  let text = "";

  source.text.split(/\r?\n/).forEach((original, index) => {
    const line = plain(original);
    if (line === "") {
      return;
    }
    if (text !== "") {
      text += " ";
    }
    lineStarts.push({ offset: text.length, line: index + 1 });
    text += line;
  });

  return { name: source.name, text, lineStarts };
}

function addNumbersAndMoney(index: SourceIndex, source: Source): void {
  source.text.split(/\r?\n/).forEach((line, lineIndex) => {
    const where = { source: source.name, line: lineIndex + 1 };

    for (const number of findNumbers(line)) {
      keepFirst(index.numbers, number.key, where);
      if (isDate(number.key)) {
        for (const part of dateParts(number.key)) {
          keepFirst(index.numbers, part, where);
        }
      }
    }
    for (const amount of findMoney(line)) {
      keepFirst(index.money, amount.key, where);
      keepFirst(index.money, currencyOf(amount.key), where);
    }
  });
}

function keepFirst(found: Map<string, Where>, key: string, where: Where): void {
  if (!found.has(key)) {
    found.set(key, where);
  }
}
