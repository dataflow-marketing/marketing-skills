// What site-add builds: used by the plugin's build and by the test that dist is current.

import type { ScriptBundle } from "@dataflow-marketing/core/build";

export function siteAddBundle(pluginFolder: string): ScriptBundle {
  return {
    skillFolder: `${pluginFolder}skills/site-add/`,
    entry: "src/run.ts",
    outfile: "dist/run.js",
  };
}
