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

const COMMA_RULE = "comma before a joining word";
const JOINING_START = /^(?:and|but|so|or)\b/i;

const RULES: Rule[] = [
  { name: "em dash", pattern: /\u2014/g },
  { name: COMMA_RULE, pattern: /,\s+(?:and|but|so|or)\b/gi },
  // anything outside plain ASCII: emojis, symbols such as the copyright sign, accents (an em dash has its own rule)
  { name: "not plain ASCII", pattern: /[^\x00-\x7F\u2014]/gu },
];

const EXCERPT_SIDE = 30;

export function findBreaks(text: string): WritingBreak[] {
  const lines = text.split("\n");
  return [...breaksInEachLine(lines), ...commasAcrossLines(lines)].sort((a, b) => a.line - b.line);
}

function breaksInEachLine(lines: string[]): WritingBreak[] {
  const breaks: WritingBreak[] = [];
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

// A line ending in a comma whose next line starts with a joining word (comment marks set aside)
function commasAcrossLines(lines: string[]): WritingBreak[] {
  const breaks: WritingBreak[] = [];
  for (let index = 0; index < lines.length - 1; index++) {
    const endsInComma = lines[index].trimEnd().endsWith(",");
    const nextStartsJoining = JOINING_START.test(withoutCommentMark(lines[index + 1]));
    if (endsInComma && nextStartsJoining) {
      breaks.push({
        line: index + 1,
        rule: COMMA_RULE,
        excerpt: excerptAround(lines[index], lines[index].length),
      });
    }
  }
  return breaks;
}

// "// and so on" and " * and so on" read as "and so on"
function withoutCommentMark(lineText: string): string {
  return lineText.trimStart().replace(/^(?:\/\/|#+|\*|>|-)\s*/, "");
}

function excerptAround(lineText: string, position: number): string {
  const start = Math.max(0, position - EXCERPT_SIDE);
  const end = Math.min(lineText.length, position + EXCERPT_SIDE);
  return lineText.slice(start, end).trim();
}
