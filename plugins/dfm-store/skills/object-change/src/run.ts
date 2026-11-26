// object-change: changes one object wherever settings keep it, only if no one else has changed it since it was
// read (spec/store.md, every write).
//
// node dist/run.js --object <kind> --business <name> --settings <file> --from <file>
//   [--preview | --go --version <version> | --read-back] [--run-log <file>] [--json]
// --preview (the default) reads the object and shows what would change and its version; nothing is written.
// --go needs the version the preview showed. It reads the object again; if it has moved it stops. Otherwise it
//   copies the object into the backups folder, writes, writes a run log line and reads it back.
// --read-back checks that the object is what --from holds.
// Exit code: 0 done, 1 read back found a difference, 2 refused or failed.

import {
  EXIT_DONE,
  EXIT_PROBLEMS_FOUND,
  EXIT_REFUSED_OR_FAILED,
  outputMode,
  writeMode,
} from "@dataflow-marketing/core";
import type { OutputMode, Settings } from "@dataflow-marketing/core";
import { appendRunLine, printOutput, readSettings, readText, runLogPath } from "@dataflow-marketing/core/node";
import { backupName, decideWrite, findPlace, readBackProblems, readFlags, sameText, versionOf } from "@dataflow-marketing/store";
import type { Place } from "@dataflow-marketing/store";
import { backupsFolder, readObject, writeBackup, writeObject } from "@dataflow-marketing/store/node";
import type { ObjectRead } from "@dataflow-marketing/store/node";
import { describeDiffers, describeMoved, describeNothing, describePreview, describeTooLarge, describeWritten } from "./describe-change.ts";
import type { Shown } from "./describe-change.ts";

const SKILL = "dfm-store:object-change";
const USAGE =
  "node dist/run.js --object <kind> --business <name> --settings <file> --from <file> [--preview | --go --version <version> | --read-back] [--run-log <file>] [--json]";
const FLAGS = {
  valueFlags: ["--object", "--business", "--settings", "--from", "--version", "--run-log"],
  required: ["--object", "--business", "--settings", "--from"],
  usage: USAGE,
};

type Asked = { object: string; business: string; settings: string; from: string; version?: string; runLog?: string };

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

  const proposed = await readText(asked.from);
  if (proposed === undefined) {
    return failed([`${asked.from} is not there.`]);
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
    return readBack(shown, current, proposed, output);
  }
  if (mode.mode === "preview") {
    return preview(shown, place.place, current, proposed, output);
  }
  return change(asked, read.settings, shown, place.place, current, proposed, output);
}

function askedFrom(values: Record<string, string>): Asked {
  return {
    object: values["--object"],
    business: values["--business"],
    settings: values["--settings"],
    from: values["--from"],
    version: values["--version"],
    runLog: values["--run-log"],
  };
}

// Steps 1 and 3: read the object and show what would change. Nothing is written.
function preview(shown: Shown, place: Place, current: Extract<ObjectRead, { ok: true }>, proposed: string, output: OutputMode): number {
  const decision = decideWrite({ seenVersion: current.version, current, proposed, connector: place.connector });
  if (decision.kind === "too large") {
    return failed([describeTooLarge(shown, decision.bytes, decision.limit)]);
  }
  if (decision.kind === "nothing to change") {
    printOutput(describeNothing(shown, current.version), output);
    return EXIT_DONE;
  }
  printOutput(describePreview(shown, current.text, proposed, current.version), output);
  return EXIT_DONE;
}

// Steps 4 to 6, after a yes: read again (done in main), back up, write, read back.
async function change(
  asked: Asked,
  settings: Settings,
  shown: Shown,
  place: Place,
  current: Extract<ObjectRead, { ok: true }>,
  proposed: string,
  output: OutputMode,
): Promise<number> {
  const decision = decideWrite({ seenVersion: asked.version ?? "", current, proposed, connector: place.connector });
  if (decision.kind === "moved") {
    printOutput(describeMoved(shown, decision.now, proposed, current.version), output);
    return EXIT_REFUSED_OR_FAILED;
  }
  if (decision.kind === "too large") {
    return failed([describeTooLarge(shown, decision.bytes, decision.limit)]);
  }
  if (decision.kind === "nothing to change") {
    printOutput(describeNothing(shown, current.version), output);
    return EXIT_DONE;
  }

  const backup = await backUp(asked, settings, current.text);
  const written = await writeObject(place, current.found, proposed);
  if (!written.ok) {
    return failed([written.problem, ...backupLine(backup)]);
  }

  const after = await readObject(place);
  const kept = after.ok ? after.text : undefined;
  const newVersion = await versionOf(kept);
  await appendRunLine(runLogPath(asked.settings, asked.runLog), {
    when: new Date(),
    skill: SKILL,
    what: `${asked.object} ${asked.business} changed`,
    where: place.label,
    before: `version ${current.version}${backup ? ` backup ${backup}` : ""}`,
    after: `version ${newVersion}`,
  });

  const problems = readBackProblems(proposed, kept);
  if (problems.length > 0) {
    return failed([...problems, ...backupLine(backup)]);
  }
  printOutput(describeWritten(shown, newVersion, backup), output);
  return EXIT_DONE;
}

// An empty object has nothing to back up
async function backUp(asked: Asked, settings: Settings, text: string): Promise<string | undefined> {
  if (text === "") {
    return undefined;
  }
  const folder = backupsFolder(asked.settings, settings.backups);
  const name = backupName(asked.object, asked.business, settings.timeZone ?? "UTC");
  return writeBackup(folder, name, text);
}

function backupLine(backup: string | undefined): string[] {
  return backup ? [`The object as it was is in ${backup}.`] : [];
}

function readBack(shown: Shown, current: Extract<ObjectRead, { ok: true }>, proposed: string, output: OutputMode): number {
  if (sameText(current.text, proposed)) {
    printOutput(describeNothing(shown, current.version), output);
    return EXIT_DONE;
  }
  printOutput(describeDiffers(shown, current.text, proposed, current.version), output);
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
