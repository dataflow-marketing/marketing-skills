// Reads the command line.
// --words <file> --report <file> --site <name> --settings <file>
// [--preview | --go | --read-back --id <post id>] [--run-log <file>] [--json]
// The report is needed to preview or write; the post id is needed to read back.

import { isModeFlag } from "@dataflow-marketing/core";
import type { WriteMode } from "@dataflow-marketing/core";

export type PostDraftArgs = {
  words: string;
  report?: string;
  site: string;
  settings: string;
  id?: string;
  runLog?: string;
};

export type ArgsResult = { ok: true; args: PostDraftArgs } | { ok: false; problem: string };

export const USAGE =
  "node dist/run.js --words <file> --report <file> --site <name> --settings <file> [--preview | --go | --read-back --id <post id>] [--run-log <file>] [--json]";

const VALUE_FLAGS = ["--words", "--report", "--site", "--settings", "--id", "--run-log"];

export function readArgs(args: readonly string[], mode: WriteMode): ArgsResult {
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

  const words = values["--words"];
  const site = values["--site"];
  const settings = values["--settings"];
  if (!words || !site || !settings) {
    return { ok: false, problem: `Name the words file, the site and the settings file. Use: ${USAGE}` };
  }
  if (mode !== "read-back" && !values["--report"]) {
    return { ok: false, problem: `Name the quotes-check report for the words file with --report. Use: ${USAGE}` };
  }
  if (mode === "read-back" && !values["--id"]) {
    return { ok: false, problem: `Name the post to read back with --id, as --go printed it. Use: ${USAGE}` };
  }

  return { ok: true, args: withOptional({ words, site, settings }, values) };
}

function withOptional(read: PostDraftArgs, values: Record<string, string>): PostDraftArgs {
  if (values["--report"]) {
    read.report = values["--report"];
  }
  if (values["--id"]) {
    read.id = values["--id"];
  }
  if (values["--run-log"]) {
    read.runLog = values["--run-log"];
  }
  return read;
}

function isValue(value: string | undefined): value is string {
  return value !== undefined && !value.startsWith("--");
}
