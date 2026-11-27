// Reads the command line. Three jobs:
//   --read <folder> --day <date> --out <file> (--ledger <file> | --business <name> --site <address> [--own]) [--dates <file>]
//                                 adds a read (profile-make's folder) to a market ledger, into a new file
//   --summary <ledger> [--dates <file>]   writes the ticks and the summary again, after the model's lines
//   --gaps --ledger <ledger> --market <market ledger>   a business's ledger beside its own market ledger
// [--json] gives the same as data.

export type MarketArgs =
  | { job: "read"; folder: string; day: string; out: string; ledger?: string; business?: string; site?: string; own: boolean; dates?: string }
  | { job: "summary"; ledger: string; dates?: string }
  | { job: "gaps"; ledger: string; market: string };

export type ArgsResult = { ok: true; args: MarketArgs } | { ok: false; problem: string };

export const USAGE =
  "node dist/run.js --read <folder> --day <YYYY-MM-DD> --out <file> (--ledger <file> | --business <name> --site <address> [--own]) [--dates <file>] | --summary <ledger> [--dates <file>] | --gaps --ledger <ledger> --market <market ledger> [--json]";

const DAY = /^\d{4}-\d{2}-\d{2}$/;

export function readArgs(args: readonly string[]): ArgsResult {
  const rest = args.filter((arg) => arg !== "--json");
  if (rest.includes("--gaps")) {
    return gapsArgs(rest);
  }
  if (rest.includes("--summary")) {
    return summaryArgs(rest);
  }
  if (rest.includes("--read")) {
    return readJobArgs(rest);
  }
  return refused("Name a job: --read, --summary or --gaps.");
}

function readJobArgs(args: readonly string[]): ArgsResult {
  const folder = valueOf(args, "--read");
  const day = valueOf(args, "--day");
  const out = valueOf(args, "--out");
  const ledger = valueOf(args, "--ledger");
  const business = valueOf(args, "--business");
  const site = valueOf(args, "--site");
  if (!folder || !out || !day || !DAY.test(day)) {
    return refused("Name the read's folder, its day (YYYY-MM-DD) and a new file for the ledger.");
  }
  if (!ledger && !(business && site)) {
    return refused("Name the ledger to add the read to. For a first read, name the business and its site.");
  }
  return { ok: true, args: { job: "read", folder, day, out, ledger, business, site, own: args.includes("--own"), dates: valueOf(args, "--dates") } };
}

function summaryArgs(args: readonly string[]): ArgsResult {
  const ledger = valueOf(args, "--summary");
  return ledger ? { ok: true, args: { job: "summary", ledger, dates: valueOf(args, "--dates") } } : refused("Name the ledger to write the summary of.");
}

function gapsArgs(args: readonly string[]): ArgsResult {
  const ledger = valueOf(args, "--ledger");
  const market = valueOf(args, "--market");
  return ledger && market ? { ok: true, args: { job: "gaps", ledger, market } } : refused("Name the business's ledger and its own market ledger.");
}

function refused(problem: string): ArgsResult {
  return { ok: false, problem: `${problem} Use: ${USAGE}` };
}

function valueOf(args: readonly string[], flag: string): string | undefined {
  const at = args.indexOf(flag);
  const value = at >= 0 ? args[at + 1] : undefined;
  return value && !value.startsWith("--") ? value : undefined;
}
