// post-draft: puts a checked words file on Ghost as a draft and reads it back.
// It never sends a status: Ghost makes a new post a draft. A person publishes.
//
// node dist/run.js --words <file> --report <file> --site <name> --settings <file>
//   [--preview | --go | --read-back --id <post id>] [--run-log <file>] [--json]
// --preview (the default) shows exactly what would be sent and sends nothing.
// --go sends it, writes a run log line and reads the post back.
// --read-back reads a post back again.
// Exit code: 0 done, 1 problems found, 2 refused or failed (a post that is not a draft is a failure).

import {
  EXIT_DONE,
  EXIT_PROBLEMS_FOUND,
  EXIT_REFUSED_OR_FAILED,
  outputMode,
  writeMode,
} from "@dataflow-marketing/core";
import type { OutputMode } from "@dataflow-marketing/core";
import { appendRunLine, printOutput, readSettings, runLogPath } from "@dataflow-marketing/core/node";
import { checkReadBack } from "./check-read-back.ts";
import { describePreview } from "./describe-preview.ts";
import { describeResult } from "./describe-result.ts";
import { draftRequest, expectedPost } from "./draft-request.ts";
import { findGhostSite } from "./find-ghost-site.ts";
import type { GhostSite } from "./find-ghost-site.ts";
import { readInputs } from "./node/read-inputs.ts";
import type { Inputs } from "./node/read-inputs.ts";
import { readToken } from "./node/read-token.ts";
import { readArgs } from "./read-args.ts";
import type { PostDraftArgs } from "./read-args.ts";
import { readPost } from "./read-post.ts";
import { readReport } from "./read-report.ts";
import { readWords } from "./read-words.ts";
import { readyToDraft } from "./ready-to-draft.ts";
import { reportPassed } from "./report-passed.ts";
import { sendDraft } from "./send-draft.ts";
import type { DraftRequest, ExpectedPost, Words } from "./types.ts";

const SKILL = "dfm-ghost:post-draft";

async function main(args: string[]): Promise<number> {
  const output = outputMode(args);

  const mode = writeMode(args);
  if (!mode.ok) {
    return failed([mode.problem]);
  }

  const asked = readArgs(args, mode.mode);
  if (!asked.ok) {
    return failed([asked.problem]);
  }

  const read = await readInputs(asked.args.words, asked.args.report);
  if (!read.ok) {
    return failed([read.problem]);
  }

  const words = readWords(read.inputs.wordsText);
  if (!words.ok) {
    return failed(words.problems.map((problem) => `words file ${problem}`));
  }

  if (mode.mode !== "read-back") {
    const refusals = checkBeforeSending(words.words, read.inputs, asked.args.words);
    if (refusals.length > 0) {
      return failed(refusals);
    }
  }

  const settings = await readSettings(asked.args.settings);
  const ghost = findGhostSite(settings, asked.args.site);
  if (!ghost.ok) {
    return failed(ghost.problems);
  }

  const request = draftRequest(words.words, ghost.found.site);
  const expected = expectedPost(words.words, ghost.found.site);

  if (mode.mode === "preview") {
    printOutput(describePreview(request, ghost.found.site), output);
    return EXIT_DONE;
  }

  const token = await readToken(ghost.found);
  if (!token.ok) {
    return failed([token.problem]);
  }

  if (mode.mode === "read-back") {
    return readBack(ghost.found, asked.args.id ?? "", expected, token.token, output);
  }
  return sendAndReadBack(asked.args, ghost.found, request, expected, token.token, output);
}

// The words must be ready and a passing quotes-check report must be for them.
function checkBeforeSending(words: Words, inputs: Inputs, wordsPath: string): string[] {
  const notReady = readyToDraft(words);
  const report = readReport(inputs.reportText ?? "");
  const notChecked = reportPassed(report, { wordsPath, from: words.from, reportIsNewer: inputs.reportIsNewer });
  return [...notReady, ...notChecked];
}

async function sendAndReadBack(
  asked: PostDraftArgs,
  ghost: GhostSite,
  request: DraftRequest,
  expected: ExpectedPost,
  token: string,
  output: OutputMode,
): Promise<number> {
  const created = await sendDraft(request, token, fetch);
  if (!created.ok) {
    return failed([created.problem]);
  }

  await appendRunLine(runLogPath(asked.settings, asked.runLog), {
    when: new Date(),
    skill: SKILL,
    what: "post draft",
    where: `ghost ${ghost.site.business} ${ghost.site.address}`,
    before: "",
    after: `${created.post.status} "${created.post.title}" id ${created.post.id} slug ${created.post.slug}`,
  });

  const slug = expected.slug ?? created.post.slug;
  const readBackCode = await readBack(ghost, created.post.id, { ...expected, slug }, token, output, true);
  if (readBackCode !== EXIT_DONE) {
    return EXIT_REFUSED_OR_FAILED;
  }
  return EXIT_DONE;
}

async function readBack(
  ghost: GhostSite,
  id: string,
  expected: ExpectedPost,
  token: string,
  output: OutputMode,
  created = false,
): Promise<number> {
  const post = await readPost(ghost.site.address, id, token, fetch);
  if (!post.ok) {
    return failed([post.problem]);
  }

  const check = checkReadBack(post.post, expected);
  printOutput(describeResult(ghost.site, post.post, check, created), output);

  if (!check.isDraft) {
    return failed(check.problems);
  }
  if (check.problems.length > 0) {
    return EXIT_PROBLEMS_FOUND;
  }
  return EXIT_DONE;
}

function failed(problems: readonly string[]): number {
  process.stderr.write(`${problems.join("\n")}\n`);
  return EXIT_REFUSED_OR_FAILED;
}

// Anything unexpected, such as a settings file that is not there, is said in one line
// and fails: only the error's message is printed, never a stack or a value.
async function runSafely(args: string[]): Promise<number> {
  try {
    return await main(args);
  } catch (error) {
    const message = error instanceof Error ? error.message : "an unknown error";
    return failed([`Failed: ${message}`]);
  }
}

process.exitCode = await runSafely(process.argv.slice(2));
