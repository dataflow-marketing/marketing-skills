// Works out what adding the public site would change in the settings file, before anything is written.
// A new file starts with "spec 1" and its time zone, which must be given: settings without one stop every skill.
// Settings that already have problems are refused until they are fixed: bad settings stop a skill.
// A site already there with the same line is left alone; a site of the same name on any platform is refused:
// changing a site is not adding one. A public site needs no keys file.

import { parseSettings } from "@dataflow-marketing/core";
import type { Site } from "@dataflow-marketing/core";
import { siteLine } from "./site-line.ts";

export type AddPlan =
  | { kind: "add"; lines: string[]; append: string; newFile: boolean }
  | { kind: "already there"; line: string }
  | { kind: "refused"; problem: string };

const SPEC_LINE = "spec 1";

const ASK_TIME_ZONE =
  "There is no settings file yet. Starting one needs its time zone: add --time-zone, such as --time-zone Australia/Melbourne.";

// settingsText is undefined when the settings file does not exist yet; timeZone is needed only then.
export function planAdd(settingsText: string | undefined, site: Site, timeZone?: string): AddPlan {
  if (settingsText === undefined) {
    return planNewFile(site, timeZone);
  }
  return planExistingFile(settingsText, site);
}

function planNewFile(site: Site, timeZone: string | undefined): AddPlan {
  if (!timeZone) {
    return refused(ASK_TIME_ZONE);
  }
  const line = siteLine(site);
  const append = `${SPEC_LINE}\ntime zone: ${timeZone}\n${line}\n`;
  const { problems } = parseSettings(append);
  if (problems.length > 0) {
    return refused(problems.join("; "));
  }
  return { kind: "add", lines: [line], append, newFile: true };
}

function planExistingFile(settingsText: string, site: Site): AddPlan {
  if (!settingsText.startsWith(SPEC_LINE)) {
    return refused(`The settings file does not start with "${SPEC_LINE}". It may not be a settings file.`);
  }
  const { settings, problems } = parseSettings(settingsText);
  if (problems.length > 0) {
    return refused(`Fix the settings file first: ${problems.join("; ")}`);
  }

  const line = siteLine(site);
  const sameName = settings.sites.find((known) => known.business === site.business);
  if (sameName && sameName.platform === site.platform && sameName.address === site.address) {
    return { kind: "already there", line };
  }
  if (sameName) {
    return refused(`Settings already have a site called ${site.business} on ${sameName.platform}. Change it by hand if it is wrong.`);
  }

  return { kind: "add", lines: [line], append: appendAfter(settingsText, line), newFile: false };
}

// The line goes on a line of its own, after whatever the file ends with.
function appendAfter(settingsText: string, line: string): string {
  if (settingsText.endsWith("\n")) {
    return `${line}\n`;
  }
  return `\n${line}\n`;
}

function refused(problem: string): AddPlan {
  return { kind: "refused", problem };
}
