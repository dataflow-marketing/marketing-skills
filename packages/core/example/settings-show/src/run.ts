// settings-show: prints the sites, stores and bindings in a settings file.
// Not a skill. It is the example that proves the build: a script made from
// core modules, bundled into one committed file (dist/run.js) that needs only Node.
//
// node dist/run.js <settings file> [--json]

import { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED, outputMode } from "../../../src/index.ts";
import { printOutput, readSettings } from "../../../src/node/index.ts";
import { describeSettings } from "./describe-settings.ts";
import { settingsPathFrom } from "./settings-path-from.ts";

async function main(args: string[]): Promise<number> {
  const mode = outputMode(args);

  const settingsPath = settingsPathFrom(args);
  if (!settingsPath) {
    process.stderr.write("Name a settings file: node dist/run.js <settings file> [--json]\n");
    return EXIT_REFUSED_OR_FAILED;
  }

  const result = await readSettingsOrSay(settingsPath);
  if (!result) {
    return EXIT_REFUSED_OR_FAILED;
  }
  printOutput(describeSettings(result), mode);

  if (result.problems.length > 0) {
    return EXIT_PROBLEMS_FOUND;
  }
  return EXIT_DONE;
}

// A settings file that cannot be read is a failure (exit 2), named by its path
async function readSettingsOrSay(path: string) {
  try {
    return await readSettings(path);
  } catch {
    process.stderr.write(`Could not read the settings file: ${path}\n`);
    return undefined;
  }
}

process.exitCode = await main(process.argv.slice(2));
