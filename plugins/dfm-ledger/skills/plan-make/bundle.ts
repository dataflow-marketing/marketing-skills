// What plan-make builds: used by the plugin's build and by the test that dist is current.

import type { ScriptBundle } from "@dataflow-marketing/core/build";

export function planMakeBundle(pluginFolder: string): ScriptBundle {
  return {
    skillFolder: `${pluginFolder}skills/plan-make/`,
    entry: "src/run.ts",
    outfile: "dist/run.js",
  };
}
