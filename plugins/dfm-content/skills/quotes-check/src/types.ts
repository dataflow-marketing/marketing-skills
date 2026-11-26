// The shapes passed between the check's modules.

// A source the text is checked against: its name as given and its text.
export type Source = {
  name: string;
  text: string;
};

// What a mention is: a quote, a name, a number, an amount of money
// or a claim that code cannot prove (a quote mark with no pair).
export type MentionKind = "quote" | "name" | "number" | "money" | "claim";

// One thing found in the text that must be in the source.
// The key is what is looked for: the same key means the same mention.
export type Mention = {
  kind: MentionKind;
  written: string;
  key: string;
  textLine: number;
};

// Where a mention was found in the sources.
export type Where = {
  source: string;
  line: number;
};

// One line of the check report: a mention and whether it was found.
export type CheckLine = {
  kind: MentionKind;
  written: string;
  found: boolean;
  where?: Where;
};

export type CheckResult = {
  lines: CheckLine[];
  problems: number;
};
