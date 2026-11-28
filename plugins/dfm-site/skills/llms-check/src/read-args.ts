// Reads the command line: --address <https://...> [--json]

export type ArgsResult = { ok: true; address: string } | { ok: false; problem: string };

export const USAGE = "node dist/run.js --address <https://...> [--json]";

export function readArgs(args: readonly string[]): ArgsResult {
  const at = args.indexOf("--address");
  const address = at >= 0 ? args[at + 1] : undefined;
  if (!address || address.startsWith("--")) {
    return { ok: false, problem: `Name the site with --address. Use: ${USAGE}` };
  }
  return { ok: true, address };
}
