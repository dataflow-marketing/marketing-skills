// What object-remove builds: used by the plugin's build and by the test that dist is current.

import type { ScriptBundle } from "@dataflow-marketing/core/build";

export function objectRemoveBundle(pluginFolder: string): ScriptBundle {
  return { skillFolder: `${pluginFolder}skills/object-remove/`, entry: "src/run.ts", outfile: "dist/run.js" };
}
