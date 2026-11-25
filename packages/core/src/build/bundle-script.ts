// Node edge: builds a skill script into its one dist file.

import { build } from "esbuild";
import { bundleOptions } from "./bundle-options.ts";
import type { ScriptBundle } from "./bundle-options.ts";

export async function bundleScript(bundle: ScriptBundle): Promise<void> {
  await build(bundleOptions(bundle));
}
