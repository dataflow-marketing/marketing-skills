// What said-read builds: used by the plugin's build and by the test that dist is current.

import type { ScriptBundle } from "@dataflow-marketing/core/build";

export function saidReadBundle(pluginFolder: string): ScriptBundle {
  return {
    skillFolder: `${pluginFolder}skills/said-read/`,
    entry: "src/run.ts",
    outfile: "dist/run.js",
  };
}
