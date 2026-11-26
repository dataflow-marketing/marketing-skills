// Reads the command line: the site's name, its address, the name of the variable
// that holds its key and the settings file to add it to.
// --name <name> --address <https://...> --key-name <NAME> --settings <file> [--time-zone <zone>]
// [--preview | --go | --read-back] [--run-log <file>] [--json]
// --time-zone is needed only when there is no settings file yet.

import { isModeFlag } from "@dataflow-marketing/core";

export type SiteAddArgs = {
  name: string;
  address: string;
  keyName: string;
  settings: string;
  timeZone?: string;
  runLog?: string;
};

export type ArgsResult = { ok: true; args: SiteAddArgs } | { ok: false; problem: string };

export const USAGE =
  "node dist/run.js --name <name> --address <https://...> --key-name <NAME> --settings <file> [--time-zone <zone>] [--preview | --go | --read-back] [--run-log <file>] [--json]";

const VALUE_FLAGS = ["--name", "--address", "--key-name", "--settings", "--time-zone", "--run-log"];

export function readArgs(args: readonly string[]): ArgsResult {
  const values: Record<string, string> = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];

    if (arg === "--json" || isModeFlag(arg)) {
      continue;
    }
    if (VALUE_FLAGS.includes(arg) && isValue(value)) {
      values[arg] = value;
      index += 1;
      continue;
    }
    return { ok: false, problem: `Not understood: ${arg}. Use: ${USAGE}` };
  }

  const name = values["--name"];
  const address = values["--address"];
  const keyName = values["--key-name"];
  const settings = values["--settings"];
  if (!name || !address || !keyName || !settings) {
    return { ok: false, problem: `Name the site, its address, its key's variable and the settings file. Use: ${USAGE}` };
  }

  const read: SiteAddArgs = { name, address, keyName, settings };
  if (values["--time-zone"]) {
    read.timeZone = values["--time-zone"];
  }
  if (values["--run-log"]) {
    read.runLog = values["--run-log"];
  }
  return { ok: true, args: read };
}

function isValue(value: string | undefined): value is string {
  return value !== undefined && !value.startsWith("--");
}
