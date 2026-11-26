// askai-make: the copy of a business's plan (and profile) for any AI chat, with its instructions inside
// (spec/ask-ai.md). Reads only: it prints the copy (with --out it writes a new file, never over one).
//
// node dist/run.js --ledger <file> --settings <file> --who <name> --send-to <address> [--profile <file>]
//   [--instructions <file>] [--out <file>] [--json]
// The default instructions are spec/ask-ai-instructions.txt; --instructions swaps in a template of the person's own.
// Exit code: 0 done, 2 refused or failed.

import { EXIT_DONE, EXIT_REFUSED_OR_FAILED, nowIn, outputMode, parseSettings } from "@dataflow-marketing/core";
import { printOutput, readText, writeText } from "@dataflow-marketing/core/node";
import { readLedger } from "@dataflow-marketing/ledger/read";
import { makeCopy } from "./make-copy.ts";
import { readArgs } from "./read-args.ts";

async function main(args: string[]): Promise<number> {
  const output = outputMode(args);
  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }
  const settings = parseSettings((await readText(asked.args.settings)) ?? "");
  const timeZone = settings.settings.timeZone;
  if (settings.problems.length > 0 || !timeZone) {
    return failed(`Fix the settings first: ${settings.problems.join("; ") || "they cannot be read"}`);
  }
  const ledgerText = await readText(asked.args.ledger);
  if (ledgerText === undefined) {
    return failed(`Cannot read the ledger: ${asked.args.ledger}`);
  }
  if (readLedger(ledgerText).unreadable.length > 0) {
    return failed("The ledger has lines that cannot be read: run dfm-ledger:plan-check and fix them first.");
  }
  const profileText = asked.args.profile === undefined ? undefined : await readText(asked.args.profile);
  if (asked.args.profile !== undefined && profileText === undefined) {
    return failed(`Cannot read the profile: ${asked.args.profile}`);
  }

  const instructions = asked.args.instructions === undefined ? undefined : await readText(asked.args.instructions);
  if (asked.args.instructions !== undefined && instructions === undefined) {
    return failed(`Cannot read the instructions: ${asked.args.instructions}`);
  }

  const copy = makeCopy({ instructions, who: asked.args.who, sendTo: asked.args.sendTo, ledgerText, profileText, today: nowIn(timeZone).today });
  if (asked.args.out === undefined) {
    printOutput({ text: copy, data: { copy } }, output);
    return EXIT_DONE;
  }
  if ((await readText(asked.args.out)) !== undefined) {
    return failed(`${asked.args.out} is already there: name a new file for the copy.`);
  }
  await writeText(asked.args.out, copy);
  printOutput({ text: `wrote the copy to ${asked.args.out}: paste all of it into any AI chat`, data: { out: asked.args.out } }, output);
  return EXIT_DONE;
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
