// Reads the command line:
//   --site <name> --email <member> --field <key> --value <text or "a | b"> --settings <file>
//   [--preview | --go --version <v> | --read-back] [--run-log <file>] [--json]

import type { WriteMode } from "@dataflow-marketing/core";

export type FieldsChangeArgs = { site: string; email: string; field: string; value: string; settings: string; version?: string; runLog?: string };
export type ArgsResult = { ok: true; args: FieldsChangeArgs } | { ok: false; problem: string };

export const USAGE = 'node dist/run.js --site <name> --email <member> --field <key> --value "<text or a | b>" --settings <file> [--preview | --go --version <v> | --read-back] [--json]';

export function readArgs(args: readonly string[], mode: WriteMode): ArgsResult {
  const site = valueOf(args, "--site");
  const email = valueOf(args, "--email");
  const field = valueOf(args, "--field");
  const settings = valueOf(args, "--settings");
  const at = args.indexOf("--value");
  const value = at >= 0 ? args[at + 1] : undefined;
  if (!site || !email || !field || !settings || value === undefined) {
    return { ok: false, problem: `Name the site, the member's email, the field, the value and the settings. Use: ${USAGE}` };
  }
  const version = valueOf(args, "--version");
  if (mode === "go" && !version) {
    return { ok: false, problem: "--go needs the --version the preview printed: the field is changed only if no one changed it since." };
  }
  return { ok: true, args: { site, email, field, value, settings, version, runLog: valueOf(args, "--run-log") } };
}

function valueOf(args: readonly string[], flag: string): string | undefined {
  const at = args.indexOf(flag);
  const value = at >= 0 ? args[at + 1] : undefined;
  return value && !value.startsWith("--") ? value : undefined;
}
