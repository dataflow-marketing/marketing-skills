// Works out what adding the site would change in the settings file, before anything is written.
// A new file starts with "spec 1" and its time zone, which must be given: settings without one stop every skill.
// Settings that already have problems are refused until they are fixed: bad settings stop a skill.
// A site already there with the same line is left alone.
// A Ghost site of the same name with a different line is refused: changing a site is not adding one.

import { parseSettings } from "@dataflow-marketing/core";
import type { Site } from "@dataflow-marketing/core";
import { siteLine } from "./site-line.ts";

export type AddPlan =
  | { kind: "add"; line: string; append: string; newFile: boolean }
  | { kind: "already there"; line: string }
  | { kind: "refused"; problem: string };

const SPEC_LINE = "spec 1";

// settingsText is undefined when the settings file does not exist yet; timeZone is needed only then.
export function planAdd(settingsText: string | undefined, site: Site, timeZone?: string): AddPlan {
  const line = siteLine(site);

  if (settingsText === undefined) {
    return planNewFile(line, timeZone);
  }

  if (!settingsText.startsWith(SPEC_LINE)) {
    return { kind: "refused", problem: `The settings file does not start with "${SPEC_LINE}". It may not be a settings file.` };
  }
  const { settings, problems } = parseSettings(settingsText);
  if (problems.length > 0) {
    return { kind: "refused", problem: `Fix the settings file first: ${problems.join("; ")}` };
  }

  const sameName = settings.sites.find((known) => known.business === site.business && known.platform === site.platform);
  if (sameName && siteLine(sameName) === line) {
    return { kind: "already there", line };
  }
  if (sameName) {
    return {
      kind: "refused",
      problem: `Settings already have a different Ghost site called ${site.business}: ${siteLine(sameName)}. Change it by hand if it is wrong.`,
    };
  }

  return { kind: "add", line, append: appendAfter(settingsText, line), newFile: false };
}

// A new file: spec 1, the time zone it was given, then the site. It must read with no problems.
function planNewFile(line: string, timeZone: string | undefined): AddPlan {
  if (!timeZone) {
    return {
      kind: "refused",
      problem: "There is no settings file yet. Starting one needs its time zone: add --time-zone, such as --time-zone Australia/Melbourne.",
    };
  }
  const append = `${SPEC_LINE}\ntime zone: ${timeZone}\n${line}\n`;
  const { problems } = parseSettings(append);
  if (problems.length > 0) {
    return { kind: "refused", problem: problems.join("; ") };
  }
  return { kind: "add", line, append, newFile: true };
}

// The line goes on a line of its own, after whatever the file ends with.
function appendAfter(settingsText: string, line: string): string {
  if (settingsText.endsWith("\n")) {
    return `${line}\n`;
  }
  return `\n${line}\n`;
}
