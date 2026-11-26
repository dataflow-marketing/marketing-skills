// What counts-record builds: used by the plugin's build and by the test that dist is current.

import type { ScriptBundle } from "@dataflow-marketing/core/build";

export function countsRecordBundle(pluginFolder: string): ScriptBundle {
  return {
    skillFolder: `${pluginFolder}skills/counts-record/`,
    entry: "src/run.ts",
    outfile: "dist/run.js",
  };
}
