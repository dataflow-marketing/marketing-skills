// Reads the settings file back after the write: the site must be there exactly as planned
// and every line of the file must still be understood.

import { parseSettings } from "@dataflow-marketing/core";
import type { Site } from "@dataflow-marketing/core";
import { siteLine } from "./site-line.ts";

export function checkReadBack(settingsText: string | undefined, site: Site): string[] {
  if (settingsText === undefined) {
    return ["The settings file is not there."];
  }

  const { settings, problems } = parseSettings(settingsText);
  const found: string[] = [];

  const expected = siteLine(site);
  const there = settings.sites.find((known) => siteLine(known) === expected);
  if (!there) {
    found.push(`The settings file does not have the line: ${expected}`);
  }
  for (const problem of problems) {
    found.push(`settings ${problem}`);
  }
  return found;
}
