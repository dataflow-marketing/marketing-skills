// Finds every break of the writing rules in a text.
// Pure: takes text, gives back each break with its line number.

export type WritingBreak = {
  line: number;
  rule: string;
  excerpt: string;
};

type Rule = {
  name: string;
  pattern: RegExp;
};

const RULES: Rule[] = [
  { name: "em dash", pattern: /\u2014/g },
  { name: "comma before a joining word", pattern: /,\s+(?:and|but|so|or)\b/gi },
  { name: "emoji", pattern: /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}]/gu },
];

const EXCERPT_SIDE = 30;

export function findBreaks(text: string): WritingBreak[] {
  const breaks: WritingBreak[] = [];
  const lines = text.split("\n");

  lines.forEach((lineText, index) => {
    for (const rule of RULES) {
      for (const match of lineText.matchAll(rule.pattern)) {
        breaks.push({
          line: index + 1,
          rule: rule.name,
          excerpt: excerptAround(lineText, match.index ?? 0),
        });
      }
    }
  });

  return breaks;
}

function excerptAround(lineText: string, position: number): string {
  const start = Math.max(0, position - EXCERPT_SIDE);
  const end = Math.min(lineText.length, position + EXCERPT_SIDE);
  return lineText.slice(start, end).trim();
}
