// Reads the command line: the ledger, the settings and the file holding the Change: lines (an AI chat's response,
// pasted in as it came).
// --ledger <file> --settings <file> --changes <file> [--preview | --go | --read-back] [--run-log <file>] [--json]

import { isModeFlag } from "@dataflow-marketing/core";

export type ChangeArgs = { ledger: string; settings: string; changes: string; runLog?: string };

export type ArgsResult = { ok: true; args: ChangeArgs } | { ok: false; problem: string };

export const USAGE = "node dist/run.js --ledger <file> --settings <file> --changes <file> [--preview | --go | --read-back] [--run-log <file>] [--json]";

const VALUE_FLAGS = ["--ledger", "--settings", "--changes", "--run-log"];

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
  const { "--ledger": ledger, "--settings": settings, "--changes": changes } = values;
  if (!ledger || !settings || !changes) {
    return { ok: false, problem: `Name the ledger, the settings and the file with the Change: lines. Use: ${USAGE}` };
  }
  const read: ChangeArgs = { ledger, settings, changes };
  if (values["--run-log"]) {
    read.runLog = values["--run-log"];
  }
  return { ok: true, args: read };
}
