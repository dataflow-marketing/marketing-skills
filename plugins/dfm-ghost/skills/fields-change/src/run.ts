// fields-change: changes one custom field for one member on a Ghost site, such as their answer to an account question.
// A preview first; then, on a yes, a write only if no one changed the field since (its version), with a backup before
// and a read back after. A field that holds a store object (a ledger) is refused: dfm-store:object-change changes it.
//
// node dist/run.js --site <name> --email <member> --field <key> --value "<text or a | b>" --settings <file>
//   [--preview | --go --version <v> | --read-back] [--run-log <file>] [--json]
// Exit code: 0 done, 1 problems found (a read back that differs), 2 refused or failed.

import { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED, outputMode, writeMode } from "@dataflow-marketing/core";
import type { OutputMode, WriteMode } from "@dataflow-marketing/core";
import { appendRunLine, printOutput, readSettings, runLogPath } from "@dataflow-marketing/core/node";
import { backupName, writeFieldValue } from "@dataflow-marketing/store";
import { backupsFolder, writeBackup } from "@dataflow-marketing/store/node";
import { describePreview, sameValue, shown } from "./describe.ts";
import { findGhostSite } from "./find-ghost-site.ts";
import { holdsAnObject } from "./held-field.ts";
import { readToken } from "./node/read-token.ts";
import { planFieldChange, versionOfValue, type FieldPlan } from "./plan-field-change.ts";
import { readArgs, type FieldsChangeArgs } from "./read-args.ts";

const SKILL = "dfm-ghost:fields-change";
const send = (url: string, init: RequestInit) => fetch(url, init);

async function main(args: string[]): Promise<number> {
  const output = outputMode(args);
  const mode = writeMode(args);
  if (!mode.ok) {
    return failed(mode.problem);
  }
  const asked = readArgs(args, mode.mode);
  if (!asked.ok) {
    return failed(asked.problem);
  }

  const settings = await readSettings(asked.args.settings);
  const ghost = findGhostSite(settings, asked.args.site);
  if (!ghost.ok) {
    return failed(ghost.problems.join("\n"));
  }
  const bound = holdsAnObject(settings.settings.bindings, asked.args.field);
  if (bound) {
    return failed(`${asked.args.field} holds the ${bound.object} of ${bound.business}: change it with dfm-store:object-change, never here.`);
  }
  const token = await readToken(ghost.found);
  if (!token.ok) {
    return failed(token.problem);
  }

  const address = ghost.found.site.address;
  const planned = await planFieldChange({ address, token: token.token, email: asked.args.email, field: asked.args.field, value: asked.args.value }, send);
  if (!planned.ok) {
    return failed(planned.problem);
  }
  return run(mode.mode, planned.plan, asked.args, { address, token: token.token, settings: settings.settings, output });
}

type Context = { address: string; token: string; settings: { timeZone?: string; backups?: string }; output: OutputMode };

async function run(mode: WriteMode, plan: FieldPlan, asked: FieldsChangeArgs, context: Context): Promise<number> {
  if (mode === "read-back") {
    const holds = sameValue(plan.now, plan.next);
    printOutput({ text: `read back: ${asked.field} holds ${shown(plan.now)}: ${holds ? "as asked" : `not ${shown(plan.next)}`}`, data: { now: plan.now, asked: plan.next } }, context.output);
    return holds ? EXIT_DONE : EXIT_PROBLEMS_FOUND;
  }
  if (mode === "preview" || sameValue(plan.now, plan.next)) {
    printOutput({ text: describePreview(asked.site, asked.email, plan.field, plan.now, plan.next, plan.version), data: plan }, context.output);
    return EXIT_DONE;
  }
  return go(plan, asked, context);
}

// on a yes: the version must still be the preview's; a backup first; then the one field; then read back
async function go(plan: FieldPlan, asked: FieldsChangeArgs, context: Context): Promise<number> {
  if (plan.version !== asked.version) {
    return failed(`${asked.field} changed since the preview (it now holds ${shown(plan.now)}). Nothing was written: preview it again.`);
  }
  const folder = backupsFolder(asked.settings, context.settings.backups);
  const name = backupName(`field-${asked.field}`, plan.memberId, context.settings.timeZone ?? "UTC");
  const backup = await writeBackup(folder, name, `${JSON.stringify({ site: asked.site, member: plan.memberId, field: asked.field, value: plan.now })}\n`);

  const written = await writeFieldValue(context.address, plan.memberId, asked.field, plan.next, context.token, send);
  if (!written.ok) {
    return failed(`${written.problem} The backup is ${backup}.`);
  }
  await appendRunLine(runLogPath(asked.settings, asked.runLog), {
    when: new Date(),
    skill: SKILL,
    what: "member field changed",
    where: `ghost ${asked.site} member ${plan.memberId} field ${asked.field}`,
    before: shown(plan.now),
    after: shown(written.saved),
  });
  const holds = sameValue(written.saved, plan.next);
  const lines = [`changed: ${asked.field} for ${asked.email}`, `was: ${shown(plan.now)}`, `now: ${shown(written.saved)}`, `backup: ${backup}`];
  if (!holds) {
    lines.push(`read back differs: Ghost saved ${shown(written.saved)}, not ${shown(plan.next)}. The backup holds what it was.`);
  }
  printOutput({ text: lines.join("\n"), data: { saved: written.saved, backup, version: await versionOfValue(written.saved) } }, context.output);
  return holds ? EXIT_DONE : EXIT_PROBLEMS_FOUND;
}

function failed(problem: string): number {
  process.stderr.write(`${problem}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

process.exitCode = await main(process.argv.slice(2));
