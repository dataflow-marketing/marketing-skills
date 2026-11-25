// Builds settings-show into its one committed file: dist/run.js.

import { fileURLToPath } from "node:url";
import { bundleScript } from "../../src/build/index.ts";
import { settingsShowBundle } from "./bundle.ts";

async function main(): Promise<void> {
  const skillFolder = fileURLToPath(new URL(".", import.meta.url));
  await bundleScript(settingsShowBundle(skillFolder));
  process.stdout.write("built example/settings-show/dist/run.js\n");
}

await main();
