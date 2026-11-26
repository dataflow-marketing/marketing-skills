// Builds every skill script in this plugin into its one committed dist file.

import { fileURLToPath } from "node:url";
import { bundleScript } from "@dataflow-marketing/core/build";
import { objectChangeBundle } from "./skills/object-change/bundle.ts";
import { objectAddBundle } from "./skills/object-add/bundle.ts";
import { objectReadBundle } from "./skills/object-read/bundle.ts";
import { objectRemoveBundle } from "./skills/object-remove/bundle.ts";
import { objectsReadBundle } from "./skills/objects-read/bundle.ts";
import { storeAddBundle } from "./skills/store-add/bundle.ts";
import { storeCheckBundle } from "./skills/store-check/bundle.ts";

async function main(): Promise<void> {
  const pluginFolder = fileURLToPath(new URL(".", import.meta.url));

  await bundleScript(storeAddBundle(pluginFolder));
  process.stdout.write("built skills/store-add/dist/run.js\n");

  await bundleScript(storeCheckBundle(pluginFolder));
  process.stdout.write("built skills/store-check/dist/run.js\n");

  await bundleScript(objectReadBundle(pluginFolder));
  process.stdout.write("built skills/object-read/dist/run.js\n");

  await bundleScript(objectChangeBundle(pluginFolder));
  process.stdout.write("built skills/object-change/dist/run.js\n");

  await bundleScript(objectsReadBundle(pluginFolder));
  process.stdout.write("built skills/objects-read/dist/run.js\n");

  await bundleScript(objectAddBundle(pluginFolder));
  process.stdout.write("built skills/object-add/dist/run.js\n");

  await bundleScript(objectRemoveBundle(pluginFolder));
  process.stdout.write("built skills/object-remove/dist/run.js\n");
}

await main();
