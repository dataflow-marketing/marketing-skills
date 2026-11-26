// Reads the command line: the ledger to start and the settings with the business's time zone.
// --ledger <file> --settings <file> [--followers <n>] [--preview | --go] [--run-log <file>] [--json]

import { isModeFlag } from "@dataflow-marketing/core";

export type MakeArgs = { ledger: string; settings: string; followers?: number; runLog?: string };

export type ArgsResult = { ok: true; args: MakeArgs } | { ok: false; problem: string };

export const USAGE = "node dist/run.js --ledger <file> --settings <file> [--followers <n>] [--preview | --go] [--run-log <file>] [--json]";

const VALUE_FLAGS = ["--ledger", "--settings", "--followers", "--run-log"];

export function readArgs(args: readonly string[]): ArgsResult {
  const values: Record<string, string> = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    if (arg === "--json" || isModeFlag(arg)) {
      continue;
    }
    if (VALUE_FLAGS.includes(arg) && value !== undefined && !value.startsWith("--")) {
      values[arg] = value;
      index += 1;
      continue;
    }
    return { ok: false, problem: `Not understood: ${arg}. Use: ${USAGE}` };
  }
  if (!values["--ledger"] || !values["--settings"]) {
    return { ok: false, problem: `Name the ledger to start and the settings. Use: ${USAGE}` };
  }
  const read: MakeArgs = { ledger: values["--ledger"], settings: values["--settings"] };
  if (values["--followers"] !== undefined) {
    const followers = Number(values["--followers"].replace(/,/g, ""));
    if (!Number.isInteger(followers) || followers < 0) {
      return { ok: false, problem: "--followers must be a whole number, such as 120" };
    }
    read.followers = followers;
  }
  if (values["--run-log"]) {
    read.runLog = values["--run-log"];
  }
  return { ok: true, args: read };
}
