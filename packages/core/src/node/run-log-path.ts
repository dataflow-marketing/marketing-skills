// Node edge: where the run log is kept.
// A path given on the command line wins. Otherwise the run log is
// run-log.txt in the same folder as the settings file: one person's
// settings and the record of what was written on their behalf stay together.

import { dirname, join } from "node:path";
import { expandHome } from "./expand-home.ts";

export const RUN_LOG_FILE = "run-log.txt";

export function runLogPath(settingsPath: string, given?: string): string {
  if (given) {
    return expandHome(given);
  }
  return join(dirname(expandHome(settingsPath)), RUN_LOG_FILE);
}
