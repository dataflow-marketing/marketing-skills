// Builds every skill script in this plugin into its one committed dist file.

import { fileURLToPath } from "node:url";
import { bundleScript } from "@dataflow-marketing/core/build";
import { visitsReadBundle } from "./skills/visits-read/bundle.ts";

async function main(): Promise<void> {
  const pluginFolder = fileURLToPath(new URL(".", import.meta.url));
  await bundleScript(visitsReadBundle(pluginFolder));
  process.stdout.write("built skills/visits-read/dist/run.js\n");
}

await main();
