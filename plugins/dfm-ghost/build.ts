// Builds every skill script in this plugin into its one committed dist file.

import { fileURLToPath } from "node:url";
import { bundleScript } from "@dataflow-marketing/core/build";
import { numbersReadBundle } from "./skills/numbers-read/bundle.ts";
import { postDraftBundle } from "./skills/post-draft/bundle.ts";
import { siteAddBundle } from "./skills/site-add/bundle.ts";

async function main(): Promise<void> {
  const pluginFolder = fileURLToPath(new URL(".", import.meta.url));

  await bundleScript(siteAddBundle(pluginFolder));
  process.stdout.write("built skills/site-add/dist/run.js\n");

  await bundleScript(postDraftBundle(pluginFolder));
  process.stdout.write("built skills/post-draft/dist/run.js\n");

  await bundleScript(numbersReadBundle(pluginFolder));
  process.stdout.write("built skills/numbers-read/dist/run.js\n");
}

await main();
