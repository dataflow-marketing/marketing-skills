// The one way every skill script is bundled: one ES module file for Node,
// with the shared core and every package built in: a user needs only Node.
// Paths are relative to the skill folder: the output is the same on every machine.

import type { BuildOptions } from "esbuild";

export type ScriptBundle = {
  skillFolder: string;
  entry: string;
  outfile: string;
};

const BANNER = "// Built by pnpm build from its src folder. Do not edit: change the source and build again.";

export function bundleOptions(bundle: ScriptBundle): BuildOptions {
  return {
    absWorkingDir: bundle.skillFolder,
    entryPoints: [bundle.entry],
    outfile: bundle.outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node24",
    charset: "utf8",
    legalComments: "inline",
    banner: { js: BANNER },
    logLevel: "silent",
  };
}
