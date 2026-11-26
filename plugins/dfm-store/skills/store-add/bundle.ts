// What store-add builds: used by the plugin's build and by the test that dist is current.

import type { ScriptBundle } from "@dataflow-marketing/core/build";

export function storeAddBundle(pluginFolder: string): ScriptBundle {
  return { skillFolder: `${pluginFolder}skills/store-add/`, entry: "src/run.ts", outfile: "dist/run.js" };
}
