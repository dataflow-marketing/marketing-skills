// Reads the command line: --address <https://...> [--max-pages <n>] [--json]

export type LinksArgs = { address: string; maxPages: number };
export type ArgsResult = { ok: true; args: LinksArgs } | { ok: false; problem: string };

export const USAGE = "node dist/run.js --address <https://...> [--max-pages <n>] [--json]";
const DEFAULT_MAX_PAGES = 50;

export function readArgs(args: readonly string[]): ArgsResult {
  const address = valueOf(args, "--address");
  if (!address) {
    return { ok: false, problem: `Name the site with --address. Use: ${USAGE}` };
  }
  const max = valueOf(args, "--max-pages");
  const maxPages = max === undefined ? DEFAULT_MAX_PAGES : Number(max);
  if (!Number.isInteger(maxPages) || maxPages < 1) {
    return { ok: false, problem: `--max-pages is a whole number of pages, 1 or more. Use: ${USAGE}` };
  }
  return { ok: true, args: { address, maxPages } };
}

function valueOf(args: readonly string[], flag: string): string | undefined {
  const at = args.indexOf(flag);
  const value = at >= 0 ? args[at + 1] : undefined;
  return value && !value.startsWith("--") ? value : undefined;
}
