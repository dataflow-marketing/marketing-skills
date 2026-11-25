// What settings-show builds: used by build.ts and by the test that dist is current.

import type { ScriptBundle } from "../../src/build/index.ts";

export function settingsShowBundle(skillFolder: string): ScriptBundle {
  return {
    skillFolder,
    entry: "src/run.ts",
    outfile: "dist/run.js",
  };
}
