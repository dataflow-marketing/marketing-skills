// Names the spec 1 word on a line this reader cannot read, when the word is one spec/ledger.md marks
// new or to settle and dfm does not read yet. Such a line is set aside, not named as unreadable.
// Only the line's first words are looked at: the syntax after them is not settled; none is assumed.
// A line the grammar reads is never asked about here: these words never change what is read.

import type { PartName } from "./ledger-shape.ts";

type SpecWord = { word: string; starts: RegExp };

const GRAPH_WORDS: SpecWord[] = [
  { word: "business", starts: /^business\s/ },
  { word: "needs", starts: /^group\s[^:]*\sneeds:/ },
  { word: "moving between groups", starts: /^\[[^\]]+\].*(\u2192|->)/ },
  { word: "offer", starts: /^offer\s/ },
  { word: "channel", starts: /^channel\s/ },
  { word: "rule", starts: /^rule\s/ },
  { word: "limit", starts: /^limit\s/ },
  { word: "campaign", starts: /^campaign\s/ },
];

const PLAN_WORDS: SpecWord[] = [
  { word: "want for a group", starts: /^want\s.*\[[^\]]+\]/ },
  { word: "ask", starts: /^ask\s/ },
  { word: "on", starts: /^on\s\d{4}-\d{2}-\d{2}/ },
  { word: "every day", starts: /^every day\b/ },
  { word: "every month", starts: /^every month\b/ },
  { word: "series", starts: /^\d{4}-\d{2}-\d{2}\s[^:]+:\s*\S/ },
];

const DONE_WORDS: SpecWord[] = [];

const WORDS: Record<PartName, SpecWord[]> = {
  graph: GRAPH_WORDS,
  plan: PLAN_WORDS,
  done: DONE_WORDS,
  summary: [],
};

export function notReadYetWord(part: PartName, text: string): string | undefined {
  const trimmed = text.trim();
  for (const specWord of WORDS[part]) {
    if (specWord.starts.test(trimmed)) {
      return specWord.word;
    }
  }
  return undefined;
}
