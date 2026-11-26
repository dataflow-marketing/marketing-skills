// Builds every skill script in this plugin into its one committed dist file.

import { fileURLToPath } from "node:url";
import { bundleScript } from "@dataflow-marketing/core/build";
import { profileMakeBundle } from "./skills/profile-make/bundle.ts";
import { quotesCheckBundle } from "./skills/quotes-check/bundle.ts";

async function main(): Promise<void> {
  const pluginFolder = fileURLToPath(new URL(".", import.meta.url));
  await bundleScript(quotesCheckBundle(pluginFolder));
  process.stdout.write("built skills/quotes-check/dist/run.js\n");
  await bundleScript(profileMakeBundle(pluginFolder));
  process.stdout.write("built skills/profile-make/dist/run.js\n");
}

await main();
