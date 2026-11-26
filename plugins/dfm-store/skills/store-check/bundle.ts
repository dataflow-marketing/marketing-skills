// What store-check builds: used by the plugin's build and by the test that dist is current.

import type { ScriptBundle } from "@dataflow-marketing/core/build";

export function storeCheckBundle(pluginFolder: string): ScriptBundle {
  return { skillFolder: `${pluginFolder}skills/store-check/`, entry: "src/run.ts", outfile: "dist/run.js" };
}
