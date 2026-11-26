// object-add: adds one object where its binding says, only when that place is empty (the version none).
// Something already there is object-change's job: object-add refuses and writes nothing.
//
// node dist/run.js --object <kind> --business <name> --settings <file> --from <file>
//   [--preview | --go --version none | --read-back] [--run-log <file>] [--json]
// --preview (the default) reads the place and shows every line the add would put in; nothing is written.
// --go needs --version none, the version the preview showed, as every write does. It reads the place again; if anything is there now it stops. Otherwise it writes, writes a run log line and
//   reads it back. An empty place has nothing to back up.
// --read-back checks that the object is what --from holds.
// Exit code: 0 done, 1 read back found a difference, 2 refused or failed.

import { EXIT_DONE, EXIT_PROBLEMS_FOUND, EXIT_REFUSED_OR_FAILED, outputMode, writeMode } from "@dataflow-marketing/core";
import type { OutputMode } from "@dataflow-marketing/core";
import { appendRunLine, printOutput, readSettings, readText, runLogPath } from "@dataflow-marketing/core/node";
import { NO_VERSION, findPlace, readBackProblems, readFlags, sameText, versionOf } from "@dataflow-marketing/store";
import type { Place } from "@dataflow-marketing/store";
import { readObject, writeObject } from "@dataflow-marketing/store/node";
import type { ObjectRead } from "@dataflow-marketing/store/node";
import { decideAdd } from "./decide-add.ts";
import {
  describeAdded,
  describeAlreadyThere,
  describeDiffers,
  describeNothingToAdd,
  describePreview,
  describeReadBackSame,
  describeTooLarge,
} from "./describe-add.ts";
import type { Shown } from "./describe-add.ts";

const SKILL = "dfm-store:object-add";
const USAGE =
  "node dist/run.js --object <kind> --business <name> --settings <file> --from <file> [--preview | --go --version none | --read-back] [--run-log <file>] [--json]";
const FLAGS = {
  valueFlags: ["--object", "--business", "--settings", "--from", "--version", "--run-log"],
  required: ["--object", "--business", "--settings", "--from"],
  usage: USAGE,
};

type Asked = { object: string; business: string; settings: string; from: string; runLog?: string };

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
  if (mode.mode === "go" && flags.values["--version"] !== NO_VERSION) {
    return failed([`--go needs the version the preview showed: --go --version ${NO_VERSION}.`]);
  }

  const proposed = await readText(asked.from);
  if (proposed === undefined) {
    return failed([`${asked.from} is not there.`]);
  }

  const place = findPlace(await readSettings(asked.settings), asked.object, asked.business);
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
  const refusal = refusalFor(asked, shown, place.place, current, proposed);
  if (refusal !== undefined) {
    return failed([refusal]);
  }
  if (mode.mode === "preview") {
    printOutput(describePreview(shown, proposed), output);
    return EXIT_DONE;
  }
  return add(asked, shown, place.place, current, proposed, output);
}

function askedFrom(values: Record<string, string>): Asked {
  return {
    object: values["--object"],
    business: values["--business"],
    settings: values["--settings"],
    from: values["--from"],
    runLog: values["--run-log"],
  };
}

// Why the add may not go ahead, at the preview and again just before the write; undefined when it may
function refusalFor(asked: Asked, shown: Shown, place: Place, current: Current, proposed: string): string | undefined {
  const decision = decideAdd({ current, proposed, limit: current.limit });
  if (decision.kind === "already there") {
    return describeAlreadyThere(shown, decision.version, decision.lines);
  }
  if (decision.kind === "nothing to add") {
    return describeNothingToAdd(shown, asked.from);
  }
  if (decision.kind === "too large") {
    return describeTooLarge(shown, decision.bytes, decision.limit);
  }
  return undefined;
}

// After a yes: the place was read again in main and is still empty. Write, log, read back.
async function add(asked: Asked, shown: Shown, place: Place, current: Current, proposed: string, output: OutputMode): Promise<number> {
  const written = await writeObject(place, current.found, proposed);
  if (!written.ok) {
    return failed([written.problem]);
  }

  const after = await readObject(place);
  const kept = after.ok ? after.text : undefined;
  const newVersion = await versionOf(kept);
  await appendRunLine(runLogPath(asked.settings, asked.runLog), {
    when: new Date(),
    skill: SKILL,
    what: `${asked.object} ${asked.business} added`,
    where: place.label,
    before: `version ${NO_VERSION}`,
    after: `version ${newVersion}`,
  });

  const problems = readBackProblems(proposed, kept);
  if (problems.length > 0) {
    return failed(problems);
  }
  printOutput(describeAdded(shown, newVersion), output);
  return EXIT_DONE;
}

function readBack(shown: Shown, current: Current, proposed: string, output: OutputMode): number {
  if (sameText(current.text, proposed)) {
    printOutput(describeReadBackSame(shown, current.version), output);
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
