// object-remove: empties one object wherever settings keep it (a file is removed; a Ghost field is set to null),
// only if no one has changed it since it was read, always with a backup first (spec/store.md, rule 2).
//
// node dist/run.js --object <kind> --business <name> --settings <file>
//   [--preview | --go --version <version> | --read-back] [--run-log <file>] [--json]
// --preview (the default) reads the object and shows every line the remove takes out and its version; nothing
//   is removed.
// --go needs the version the preview showed. It reads the object again; if it has moved it stops. Otherwise it
//   copies the object into the backups folder, removes it, writes a run log line and reads it back.
// --read-back checks that the object is empty.
// Exit code: 0 done (or nothing to remove), 1 read back found it still there, 2 refused or failed.

import { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED, outputMode, writeMode } from "@dataflow-marketing/core";
import type { OutputMode, Settings } from "@dataflow-marketing/core";
import { appendRunLine, printOutput, readSettings, runLogPath } from "@dataflow-marketing/core/node";
import { NO_VERSION, backupName, findPlace, readFlags } from "@dataflow-marketing/store";
import type { Place } from "@dataflow-marketing/store";
import { backupsFolder, readObject, removeObject, writeBackup } from "@dataflow-marketing/store/node";
import type { ObjectRead } from "@dataflow-marketing/store/node";
import { decideRemove } from "./decide-remove.ts";
import { describeMoved, describeNothing, describePreview, describeRemoved, describeStillThere } from "./describe-remove.ts";
import type { Shown } from "./describe-remove.ts";

const SKILL = "dfm-store:object-remove";
const USAGE =
  "node dist/run.js --object <kind> --business <name> --settings <file> [--preview | --go --version <version> | --read-back] [--run-log <file>] [--json]";
const FLAGS = {
  valueFlags: ["--object", "--business", "--settings", "--version", "--run-log"],
  required: ["--object", "--business", "--settings"],
  usage: USAGE,
};

type Asked = { object: string; business: string; settings: string; version?: string; runLog?: string };

type Current = Extract<ObjectRead, { ok: true }>;

async function main(args: string[]): Promise<number> {
  const output = outputMode(args);

  const mode = writeMode(args);
  if (!mode.ok) {
    return failed([mode.problem]);
  }
  const flags = readFlags(args, FLAGS);
  if (!flags.ok) {
    return failed([flags.problem]);
  }
  const asked = askedFrom(flags.values);
  if (mode.mode === "go" && !asked.version) {
    return failed(["--go needs the version the preview showed: --go --version <version>."]);
  }

  const read = await readSettings(asked.settings);
  const place = findPlace(read, asked.object, asked.business);
  if (!place.ok) {
    return failed(place.problems);
  }
  const shown: Shown = { object: asked.object, business: asked.business, where: place.place.label };

  const current = await readObject(place.place);
  if (!current.ok) {
    return failed([current.problem]);
  }

  if (mode.mode === "read-back") {
    return readBack(shown, current, output);
  }
  if (mode.mode === "preview") {
    return preview(shown, current, output);
  }
  return remove(asked, read.settings, shown, place.place, current, output);
}

function askedFrom(values: Record<string, string>): Asked {
  return {
    object: values["--object"],
    business: values["--business"],
    settings: values["--settings"],
    version: values["--version"],
    runLog: values["--run-log"],
  };
}

// Read the object and show every line the remove would take out. Nothing is removed.
function preview(shown: Shown, current: Current, output: OutputMode): number {
  if (current.version === NO_VERSION) {
    printOutput(describeNothing(shown), output);
    return EXIT_DONE;
  }
  printOutput(describePreview(shown, current.text, current.version), output);
  return EXIT_DONE;
}

// After a yes: read again (done in main), back up, remove, read back.
async function remove(asked: Asked, settings: Settings, shown: Shown, place: Place, current: Current, output: OutputMode): Promise<number> {
  const decision = decideRemove({ seenVersion: asked.version ?? "", current });
  if (decision.kind === "nothing to remove") {
    printOutput(describeNothing(shown), output);
    return EXIT_DONE;
  }
  if (decision.kind === "moved") {
    printOutput(describeMoved(shown, decision.now, current.version), output);
    return EXIT_REFUSED_OR_FAILED;
  }

  const backup = await backUp(asked, settings, current.text);
  const removed = await removeObject(place, current.found);
  if (!removed.ok) {
    return failed([removed.problem, backupLine(backup)]);
  }

  const after = await readObject(place);
  const afterVersion = after.ok ? after.version : "unread";
  await appendRunLine(runLogPath(asked.settings, asked.runLog), {
    when: new Date(),
    skill: SKILL,
    what: `${asked.object} ${asked.business} removed`,
    where: place.label,
    before: `version ${current.version} backup ${backup}`,
    after: `version ${afterVersion}`,
  });

  if (!after.ok) {
    return failed([after.problem, backupLine(backup)]);
  }
  if (after.version !== NO_VERSION) {
    return failed(["The object is still there after the remove.", backupLine(backup)]);
  }
  printOutput(describeRemoved(shown, backup), output);
  return EXIT_DONE;
}

// Always a backup: only an object with something in it gets this far
async function backUp(asked: Asked, settings: Settings, text: string): Promise<string> {
  const folder = backupsFolder(asked.settings, settings.backups);
  const name = backupName(asked.object, asked.business, settings.timeZone ?? "UTC");
  return writeBackup(folder, name, text);
}

function backupLine(backup: string): string {
  return `The object as it was is in ${backup}.`;
}

function readBack(shown: Shown, current: Current, output: OutputMode): number {
  if (current.version === NO_VERSION) {
    printOutput(describeNothing(shown), output);
    return EXIT_DONE;
  }
  const lines = current.text.trimEnd().split("\n").length;
  printOutput(describeStillThere(shown, current.version, lines), output);
  return EXIT_PROBLEMS_FOUND;
}

function failed(problems: readonly string[]): number {
  process.stderr.write(`${problems.join("\n")}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

// Anything unexpected is said in one line and fails: only the error's message, never a stack or a value.
async function runSafely(args: string[]): Promise<number> {
  try {
    return await main(args);
  } catch (error) {
    const message = error instanceof Error ? error.message : "an unknown error";
    return failed([`Failed: ${message}`]);
  }
}

process.exitCode = await runSafely(process.argv.slice(2));
