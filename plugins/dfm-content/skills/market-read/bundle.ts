// What market-read builds: used by the plugin's build and by the test that dist is current.

import type { ScriptBundle } from "@dataflow-marketing/core/build";

export function marketReadBundle(pluginFolder: string): ScriptBundle {
  return {
    skillFolder: `${pluginFolder}skills/market-read/`,
    entry: "src/run.ts",
    outfile: "dist/run.js",
  };
}
