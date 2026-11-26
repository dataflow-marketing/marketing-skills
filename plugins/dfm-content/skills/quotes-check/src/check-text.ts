// The check: every quote, name, number and amount of money in a text is looked for in its sources.
// Plain code, never a model. Takes values and gives back the result: it runs in Node or a Worker.

import { compareWithSources } from "./compare-with-sources.ts";
import { contentLines } from "./content-lines.ts";
import { findMentions } from "./find-mentions.ts";
import { indexSources } from "./index-sources.ts";
import type { CheckLine, CheckResult, Source } from "./types.ts";

export function checkText(text: string, sources: readonly Source[]): CheckResult {
  const lines = contentLines(text);
  const mentions = findMentions(lines);
  const index = indexSources(sources);
  const checked = compareWithSources(mentions, index);

  return { lines: checked, problems: countProblems(checked) };
}

function countProblems(lines: readonly CheckLine[]): number {
  let problems = 0;
  for (const line of lines) {
    if (!line.found) {
      problems += 1;
    }
  }
  return problems;
}
