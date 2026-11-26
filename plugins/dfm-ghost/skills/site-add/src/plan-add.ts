// Works out what adding the site would change in the settings file, before anything is written.
// A new file starts with "spec 1" and its time zone, which must be given: settings without one stop every skill.
// Settings must name a keys file: post-draft reads the site's key from it. When they do not, its path must be given.
// Settings that already have problems are refused until they are fixed: bad settings stop a skill.
// A site already there with the same line is left alone.
// A Ghost site of the same name with a different line is refused: changing a site is not adding one.

import { parseSettings } from "@dataflow-marketing/core";
import type { Settings, Site } from "@dataflow-marketing/core";
import { siteLine } from "./site-line.ts";

export type AddPlan =
  | { kind: "add"; lines: string[]; append: string; newFile: boolean }
  | { kind: "already there"; line: string }
  | { kind: "refused"; problem: string };

// What the person gave on the command line, needed only when settings do not have it yet
export type Given = {
  timeZone?: string;
  keysFile?: string;
};

const SPEC_LINE = "spec 1";

const ASK_TIME_ZONE =
  "There is no settings file yet. Starting one needs its time zone: add --time-zone, such as --time-zone Australia/Melbourne.";
const ASK_KEYS_FILE =
  "Settings name no keys file yet: the file the site's key goes in. Add --keys-file, such as --keys-file ~/.config/dfm/.env.";

// settingsText is undefined when the settings file does not exist yet.
export function planAdd(settingsText: string | undefined, site: Site, given: Given = {}): AddPlan {
  if (settingsText === undefined) {
    return planNewFile(site, given);
  }
  return planExistingFile(settingsText, site, given);
}

// A new file: spec 1, the time zone, the keys file, then the site. It must read with no problems.
function planNewFile(site: Site, given: Given): AddPlan {
  if (!given.timeZone) {
    return refused(ASK_TIME_ZONE);
  }
  if (!given.keysFile) {
    return refused(ASK_KEYS_FILE);
  }

  const line = siteLine(site);
  const keysFileLine = keysFileLineFor(given.keysFile);
  const append = `${SPEC_LINE}\ntime zone: ${given.timeZone}\n${keysFileLine}\n${line}\n`;
  const { problems } = parseSettings(append);
  if (problems.length > 0) {
    return refused(problems.join("; "));
  }
  return { kind: "add", lines: [keysFileLine, line], append, newFile: true };
}

function planExistingFile(settingsText: string, site: Site, given: Given): AddPlan {
  if (!settingsText.startsWith(SPEC_LINE)) {
    return refused(`The settings file does not start with "${SPEC_LINE}". It may not be a settings file.`);
  }
  const { settings, problems } = parseSettings(settingsText);
  if (problems.length > 0) {
    return refused(`Fix the settings file first: ${problems.join("; ")}`);
  }

  const line = siteLine(site);
  const sameName = settings.sites.find((known) => known.business === site.business && known.platform === site.platform);
  if (sameName && siteLine(sameName) !== line) {
    return refused(
      `Settings already have a different Ghost site called ${site.business}: ${siteLine(sameName)}. Change it by hand if it is wrong.`,
    );
  }

  const keysFileLine = missingKeysFileLine(settings, given);
  if (keysFileLine === ASK_KEYS_FILE) {
    return refused(ASK_KEYS_FILE);
  }
  if (sameName && keysFileLine === undefined) {
    return { kind: "already there", line };
  }

  const lines = [keysFileLine, sameName ? undefined : line].filter((each): each is string => each !== undefined);
  return { kind: "add", lines, append: appendAfter(settingsText, lines), newFile: false };
}

// The keys file line settings still need: undefined when they have one, ASK_KEYS_FILE when none was given
function missingKeysFileLine(settings: Settings, given: Given): string | undefined {
  if (settings.keysFile) {
    return undefined;
  }
  if (!given.keysFile) {
    return ASK_KEYS_FILE;
  }
  return keysFileLineFor(given.keysFile);
}

function keysFileLineFor(path: string): string {
  return `keys file: ${path}`;
}

// The new lines go on lines of their own, after whatever the file ends with.
function appendAfter(settingsText: string, lines: string[]): string {
  const added = lines.map((each) => `${each}\n`).join("");
  if (settingsText.endsWith("\n")) {
    return added;
  }
  return `\n${added}`;
}

function refused(problem: string): AddPlan {
  return { kind: "refused", problem };
}
