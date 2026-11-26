// What object-read builds: used by the plugin's build and by the test that dist is current.

import type { ScriptBundle } from "@dataflow-marketing/core/build";

export function objectReadBundle(pluginFolder: string): ScriptBundle {
  return { skillFolder: `${pluginFolder}skills/object-read/`, entry: "src/run.ts", outfile: "dist/run.js" };
}
