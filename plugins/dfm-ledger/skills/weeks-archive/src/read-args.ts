// Reads the command line: the ledger, its history, the settings and, rarely, other rules.
// --ledger <file> --history <file> --settings <file> [--today <date>] [--keep <weeks>] [--limit <bytes>]
// [--at <percent>] [--preview | --go | --read-back] [--run-log <file>] [--json]
// The history file may not exist yet: it is made on --go.

import { isModeFlag } from "@dataflow-marketing/core";
import { DEFAULT_RULES } from "./plan-archive.ts";
import type { ArchiveRules } from "./plan-archive.ts";

export type ArchiveArgs = {
  ledger: string;
  history: string;
  settings: string;
  today?: string;
  runLog?: string;
  rules: ArchiveRules;
};

export type ArgsResult = { ok: true; args: ArchiveArgs } | { ok: false; problem: string };

export const USAGE =
  "node dist/run.js --ledger <file> --history <file> --settings <file> [--today <date>] [--keep <weeks>] [--limit <bytes>] [--at <percent>] [--preview | --go | --read-back] [--run-log <file>] [--json]";

const VALUE_FLAGS = ["--ledger", "--history", "--settings", "--today", "--keep", "--limit", "--at", "--run-log"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const WHOLE = /^\d+$/;

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

  if (!values["--ledger"] || !values["--history"] || !values["--settings"]) {
    return { ok: false, problem: `Name the ledger, its history and the settings. Use: ${USAGE}` };
  }
  if (values["--today"] && !DATE.test(values["--today"])) {
    return { ok: false, problem: `A date is written as 2026-11-30: ${values["--today"]}` };
  }
  for (const flag of ["--keep", "--limit", "--at"]) {
    if (values[flag] && !WHOLE.test(values[flag])) {
      return { ok: false, problem: `${flag} takes a whole number: ${values[flag]}` };
    }
  }

  const asked: ArchiveArgs = {
    ledger: values["--ledger"],
    history: values["--history"],
    settings: values["--settings"],
    rules: {
      keepWeeks: Number(values["--keep"] ?? DEFAULT_RULES.keepWeeks),
      limit: Number(values["--limit"] ?? DEFAULT_RULES.limit),
      atPercent: Number(values["--at"] ?? DEFAULT_RULES.atPercent),
    },
  };
  if (values["--today"]) {
    asked.today = values["--today"];
  }
  if (values["--run-log"]) {
    asked.runLog = values["--run-log"];
  }
  return { ok: true, args: asked };
}
