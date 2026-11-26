// Reads the command line: the ledger, the settings and what the person told for one week.
// --ledger <file> --settings <file> [--week <Monday>] [--count <fact=n>]... [--total <fact=n>]... [--done <step>]...
// [--not-done <step>]... [--preview | --go | --read-back] [--run-log <file>] [--json]
// The week is this week in the settings' time zone unless one is named.

import { isModeFlag } from "@dataflow-marketing/core";

export type CountsArgs = {
  ledger: string;
  settings: string;
  week?: string;
  counts: string[];
  totals: string[];
  done: string[];
  notDone: string[];
  runLog?: string;
};

export type ArgsResult = { ok: true; args: CountsArgs } | { ok: false; problem: string };

export const USAGE =
  "node dist/run.js --ledger <file> --settings <file> [--week <Monday>] [--count <fact=n>]... [--total <fact=n>]... [--done <step>]... [--not-done <step>]... [--preview | --go | --read-back] [--run-log <file>] [--json]";

const SINGLE = ["--ledger", "--settings", "--week", "--run-log"];
const REPEATED: Record<string, "counts" | "totals" | "done" | "notDone"> = {
  "--count": "counts",
  "--total": "totals",
  "--done": "done",
  "--not-done": "notDone",
};
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function readArgs(args: readonly string[]): ArgsResult {
  const single: Record<string, string> = {};
  const repeated = { counts: [] as string[], totals: [] as string[], done: [] as string[], notDone: [] as string[] };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    if (arg === "--json" || isModeFlag(arg)) {
      continue;
    }
    const hasValue = value !== undefined && !value.startsWith("--");
    if (SINGLE.includes(arg) && hasValue) {
      single[arg] = value;
      index += 1;
      continue;
    }
    if (REPEATED[arg] && hasValue) {
      repeated[REPEATED[arg]].push(value);
      index += 1;
      continue;
    }
    return { ok: false, problem: `Not understood: ${arg}. Use: ${USAGE}` };
  }

  if (!single["--ledger"] || !single["--settings"]) {
    return { ok: false, problem: `Name the ledger and the settings. Use: ${USAGE}` };
  }
  if (single["--week"] && !DATE.test(single["--week"])) {
    return { ok: false, problem: "--week must be a date such as 2026-11-30" };
  }
  const read: CountsArgs = { ledger: single["--ledger"], settings: single["--settings"], ...repeated };
  if (single["--week"]) {
    read.week = single["--week"];
  }
  if (single["--run-log"]) {
    read.runLog = single["--run-log"];
  }
  return { ok: true, args: read };
}
