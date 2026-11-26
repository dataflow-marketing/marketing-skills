// Reads the command line: the ledger to write the summary into and the settings with the business's time zone.
// --ledger <file> --settings <file> [--today <date>] [--preview | --go | --read-back] [--run-log <file>] [--json]
// --today is for a summary as of another day; it is today in the settings' time zone otherwise.

import { isModeFlag } from "@dataflow-marketing/core";

export type SummaryArgs = {
  ledger: string;
  settings: string;
  today?: string;
  runLog?: string;
};

export type ArgsResult = { ok: true; args: SummaryArgs } | { ok: false; problem: string };

export const USAGE =
  "node dist/run.js --ledger <file> --settings <file> [--today <date>] [--preview | --go | --read-back] [--run-log <file>] [--json]";

const VALUE_FLAGS = ["--ledger", "--settings", "--today", "--run-log"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

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

  const ledger = values["--ledger"];
  const settings = values["--settings"];
  if (!ledger || !settings) {
    return { ok: false, problem: `Name the ledger and the settings. Use: ${USAGE}` };
  }
  if (values["--today"] && !DATE.test(values["--today"])) {
    return { ok: false, problem: "--today must be a date such as 2026-12-02" };
  }
  const read: SummaryArgs = { ledger, settings };
  if (values["--today"]) {
    read.today = values["--today"];
  }
  if (values["--run-log"]) {
    read.runLog = values["--run-log"];
  }
  return { ok: true, args: read };
}
