// Reads settings back after the write: every planned line is there and every line of the file is still understood.

import { parseSettings } from "@dataflow-marketing/core";

export function checkReadBack(settingsText: string | undefined, lines: string[]): string[] {
  if (settingsText === undefined) {
    return ["The settings file is not there."];
  }
  const found = settingsText.split("\n").map((line) => line.trim());
  const missing = lines.filter((line) => !found.includes(line)).map((line) => `The settings file does not have the line: ${line}`);
  const problems = parseSettings(settingsText).problems.map((problem) => `settings ${problem}`);
  return [...missing, ...problems];
}
