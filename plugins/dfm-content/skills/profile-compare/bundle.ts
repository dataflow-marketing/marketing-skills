// What profile-compare builds: used by the plugin's build and by the test that dist is current.

import type { ScriptBundle } from "@dataflow-marketing/core/build";

export function profileCompareBundle(pluginFolder: string): ScriptBundle {
  return {
    skillFolder: `${pluginFolder}skills/profile-compare/`,
    entry: "src/run.ts",
    outfile: "dist/run.js",
  };
}
