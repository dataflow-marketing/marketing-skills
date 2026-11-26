// Builds every skill script in this plugin into its one committed dist file.

import { fileURLToPath } from "node:url";
import { bundleScript } from "@dataflow-marketing/core/build";
import { siteAddBundle } from "./skills/site-add/bundle.ts";

async function main(): Promise<void> {
  const pluginFolder = fileURLToPath(new URL(".", import.meta.url));
  await bundleScript(siteAddBundle(pluginFolder));
  process.stdout.write("built skills/site-add/dist/run.js\n");
}

await main();
