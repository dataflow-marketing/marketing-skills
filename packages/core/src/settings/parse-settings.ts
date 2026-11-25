// Turns the text of a settings file into a settings object.
// Pure: takes text, gives back the settings and any problems found.
// Lines that cannot be read are named as problems, never guessed at. A problem names the line and its kind, never
// the rest of the line: a key pasted into settings by mistake must not be printed back.

import {
  readBindingLine,
  readHouseRuleLine,
  readSiteLine,
  readStoreLine,
  readValueAfter,
} from "./read-line.ts";
import { checkSettings } from "./check-settings.ts";
import type { Settings, SettingsResult } from "./types.ts";

const SPEC_LINE = "spec 1";
const DEFAULT_WEEK_START = "Monday";

// The lines that may be given once only
const ONCE_ONLY = ["time zone", "week starts", "keys file"];

// The first words of each kind of line, to name a line that is not understood
const KINDS = ["time zone", "week starts", "keys file", "site", "store", "binding", "house rule"];

export function parseSettings(text: string): SettingsResult {
  const settings = emptySettings();
  const problems: string[] = [];
  const lines = text.split(/\r?\n/);

  const firstLine = lines[0]?.trim();
  if (firstLine !== SPEC_LINE) {
    problems.push(`line 1: expected "${SPEC_LINE}"`);
  }

  const given = new Set<string>();
  for (let index = 1; index < lines.length; index++) {
    const line = lines[index].trim();
    if (line === "") {
      continue;
    }
    const kind = addLine(settings, line);
    if (!kind) {
      problems.push(notUnderstood(index + 1, line));
      continue;
    }
    if (ONCE_ONLY.includes(kind) && given.has(kind)) {
      problems.push(`line ${index + 1}: ${kind} is given more than once`);
    }
    given.add(kind);
  }

  problems.push(...checkSettings(settings));
  return { settings, problems };
}

// Names the line and its kind only, never the rest of it
function notUnderstood(lineNumber: number, line: string): string {
  const kind = KINDS.find((first) => line.startsWith(first));
  if (kind) {
    return `line ${lineNumber}: a ${kind} line that is not understood`;
  }
  return `line ${lineNumber}: not understood`;
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

// Adds one line to the settings. Gives back its kind (undefined when the line is not understood).
function addLine(settings: Settings, line: string): string | undefined {
  const timeZone = readValueAfter("time zone:", line);
  if (timeZone) {
    settings.timeZone = timeZone;
    return "time zone";
  }

  const weekStarts = readValueAfter("week starts:", line);
  if (weekStarts) {
    settings.weekStarts = weekStarts;
    return "week starts";
  }

  const keysFile = readValueAfter("keys file:", line);
  if (keysFile) {
    settings.keysFile = keysFile;
    return "keys file";
  }

  const site = readSiteLine(line);
  if (site) {
    settings.sites.push(site);
    return "site";
  }

  const store = readStoreLine(line);
  if (store) {
    settings.stores.push(store);
    return "store";
  }

  const binding = readBindingLine(line);
  if (binding) {
    settings.bindings.push(binding);
    return "binding";
  }

  const houseRule = readHouseRuleLine(line);
  if (houseRule) {
    settings.houseRules.push(houseRule);
    return "house rule";
  }

  return undefined;
}
