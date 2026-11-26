// Turns the text of a settings file into a settings object.
// Pure: takes text, gives back the settings and any problems found.
// Lines that cannot be read are named as problems, never guessed at. A problem names the line and its kind, never
// the rest of the line: a key pasted into settings by mistake must not be printed back.

import { addLine, LINE_KINDS } from "./add-line.ts";
import { checkSettings } from "./check-settings.ts";
import type { Settings, SettingsResult } from "./types.ts";

const SPEC_LINE = "spec 1";
const DEFAULT_WEEK_START = "Monday";

// The kinds of line that may be given once only
const ONCE_ONLY = ["time zone", "week starts", "keys file", "backups"];

type NumberedLine = {
  number: number;
  text: string;
};

export function parseSettings(text: string): SettingsResult {
  const lines = numberedLines(text);
  const settings = emptySettings();

  const specProblems = checkSpecLine(lines);
  const lineProblems = addEachLine(settings, lines);
  const repeatProblems = findRepeatedLines(lines);
  const settingsProblems = checkSettings(settings);

  return {
    settings,
    problems: [...specProblems, ...lineProblems, ...repeatProblems, ...settingsProblems],
  };
}

// Every line with its number in the file, blank lines left out
function numberedLines(text: string): NumberedLine[] {
  const lines = text.split(/\r?\n/).map((line, index) => ({ number: index + 1, text: line.trim() }));
  return lines.filter((line) => line.text !== "");
}

function emptySettings(): Settings {
  return {
    spec: SPEC_LINE,
    weekStarts: DEFAULT_WEEK_START,
    sites: [],
    stores: [],
    bindings: [],
    houseRules: [],
  };
}

// The first line of the file must be "spec 1"
function checkSpecLine(lines: NumberedLine[]): string[] {
  const first = lines[0];
  if (first?.number === 1 && first.text === SPEC_LINE) {
    return [];
  }
  return [`line 1: expected "${SPEC_LINE}"`];
}

// Adds every line after the spec line; names each line that is not understood
function addEachLine(settings: Settings, lines: NumberedLine[]): string[] {
  const problems: string[] = [];
  for (const line of linesAfterSpec(lines)) {
    const kind = addLine(settings, line.text);
    if (kind === undefined) {
      problems.push(notUnderstood(line));
    }
  }
  return problems;
}

// Names each once only line given a second time
function findRepeatedLines(lines: NumberedLine[]): string[] {
  const problems: string[] = [];
  const given = new Set<string>();
  for (const line of linesAfterSpec(lines)) {
    const kind = kindOf(line.text);
    if (kind === undefined || !ONCE_ONLY.includes(kind)) {
      continue;
    }
    if (given.has(kind)) {
      problems.push(`line ${line.number}: ${kind} is given more than once`);
    }
    given.add(kind);
  }
  return problems;
}

// Line 1 is the spec line, whatever it holds
function linesAfterSpec(lines: NumberedLine[]): NumberedLine[] {
  return lines.filter((line) => line.number > 1);
}

// The kind of a line, found by adding it to throwaway settings
function kindOf(text: string): string | undefined {
  return addLine(emptySettings(), text);
}

// Names the line and its kind only, never the rest of it
function notUnderstood(line: NumberedLine): string {
  const kind = LINE_KINDS.find((each) => line.text.startsWith(each.name));
  if (kind) {
    return `line ${line.number}: a ${kind.name} line that is not understood`;
  }
  return `line ${line.number}: not understood`;
}
