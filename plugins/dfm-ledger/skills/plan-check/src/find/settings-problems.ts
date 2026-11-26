// What in the settings would stop a skill (spec/settings.md): anything core's settings reader names, such as a line
// that cannot be read or a missing time zone.

import { parseSettings } from "@dataflow-marketing/core";
import type { Problem } from "../problem.ts";

export function settingsProblems(settingsText: string): Problem[] {
  return parseSettings(settingsText).problems.map((problem) => ({ kind: "settings", about: problem, lines: [] }));
}
