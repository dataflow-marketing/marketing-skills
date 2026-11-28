// What llms-check builds: used by the plugin's build and by the test that dist is current.

import type { ScriptBundle } from "@dataflow-marketing/core/build";

export function llmsCheckBundle(pluginFolder: string): ScriptBundle {
  return {
    skillFolder: `${pluginFolder}skills/llms-check/`,
    entry: "src/run.ts",
    outfile: "dist/run.js",
  };
}
