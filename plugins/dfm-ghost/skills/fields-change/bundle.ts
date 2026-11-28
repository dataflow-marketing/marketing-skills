// What fields-change builds: used by the plugin's build and by the test that dist is current.

import type { ScriptBundle } from "@dataflow-marketing/core/build";

export function fieldsChangeBundle(pluginFolder: string): ScriptBundle {
  return {
    skillFolder: `${pluginFolder}skills/fields-change/`,
    entry: "src/run.ts",
    outfile: "dist/run.js",
  };
}
