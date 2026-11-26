// Builds every skill script in this plugin into its one committed dist file.

import { fileURLToPath } from "node:url";
import { bundleScript } from "@dataflow-marketing/core/build";
import { planCheckBundle } from "./skills/plan-check/bundle.ts";
import { askaiMakeBundle } from "./skills/askai-make/bundle.ts";
import { countsRecordBundle } from "./skills/counts-record/bundle.ts";
import { planMakeBundle } from "./skills/plan-make/bundle.ts";
import { summaryMakeBundle } from "./skills/summary-make/bundle.ts";

async function main(): Promise<void> {
  const pluginFolder = fileURLToPath(new URL(".", import.meta.url));
  await bundleScript(planCheckBundle(pluginFolder));
  process.stdout.write("built skills/plan-check/dist/run.js\n");
  await bundleScript(summaryMakeBundle(pluginFolder));
  process.stdout.write("built skills/summary-make/dist/run.js\n");
  await bundleScript(countsRecordBundle(pluginFolder));
  process.stdout.write("built skills/counts-record/dist/run.js\n");
  await bundleScript(planMakeBundle(pluginFolder));
  process.stdout.write("built skills/plan-make/dist/run.js\n");
  await bundleScript(askaiMakeBundle(pluginFolder));
  process.stdout.write("built skills/askai-make/dist/run.js\n");
}

await main();
