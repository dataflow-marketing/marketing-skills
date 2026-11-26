// What summary-make builds: used by the plugin's build and by the test that dist is current.

import type { ScriptBundle } from "@dataflow-marketing/core/build";

export function summaryMakeBundle(pluginFolder: string): ScriptBundle {
  return {
    skillFolder: `${pluginFolder}skills/summary-make/`,
    entry: "src/run.ts",
    outfile: "dist/run.js",
  };
}
