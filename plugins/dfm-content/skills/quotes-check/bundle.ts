// What quotes-check builds: used by the plugin's build and by the test that dist is current.

import type { ScriptBundle } from "@dataflow-marketing/core/build";

export function quotesCheckBundle(pluginFolder: string): ScriptBundle {
  return {
    skillFolder: `${pluginFolder}skills/quotes-check/`,
    entry: "src/run.ts",
    outfile: "dist/run.js",
  };
}
