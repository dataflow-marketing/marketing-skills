// What weeks-archive builds: used by the plugin's build and by the test that dist is current.

import type { ScriptBundle } from "@dataflow-marketing/core/build";

export function weeksArchiveBundle(pluginFolder: string): ScriptBundle {
  return {
    skillFolder: `${pluginFolder}skills/weeks-archive/`,
    entry: "src/run.ts",
    outfile: "dist/run.js",
  };
}
