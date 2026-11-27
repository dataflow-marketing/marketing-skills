// Built by pnpm build from its src folder. Do not edit: change the source and build again.

// ../../../../packages/core/src/output/output-mode.ts
function outputMode(args) {
  if (args.includes("--json")) {
    return "json";
  }
  return "text";
}

// ../../../../packages/core/src/output/format-output.ts
function formatOutput(result, mode) {
  if (mode === "json") {
    return JSON.stringify(result.data, null, 2);
  }
  return result.text;
}

// ../../../../packages/core/src/output/exit-codes.ts
var EXIT_DONE = 0;
var EXIT_REFUSED_OR_FAILED = 2;

// ../../../../packages/core/src/node/expand-home.ts
import { homedir } from "node:os";
import { join } from "node:path";
function expandHome(path) {
  if (path === "~") {
    return homedir();
  }
  if (path.startsWith("~/")) {
    return join(homedir(), path.slice(2));
  }
  return path;
}

// ../../../../packages/core/src/node/print-output.ts
function printOutput(result, mode) {
  const output = formatOutput(result, mode);
  process.stdout.write(`${output}
`);
}

// ../../../../packages/core/src/node/text-file.ts
import { readFile, writeFile } from "node:fs/promises";
async function readText(path) {
  try {
    return await readFile(expandHome(path), "utf8");
  } catch {
    return void 0;
  }
}

// src/profile-parts.ts
var PARTS = [
  "counted",
  "what the site is and who it is for",
  "who is behind it",
  "who they speak to",
  "what it offers",
  "what they believe",
  "kinds of content and their shapes",
  "how titles and headlines are written",
  "how it is said",
  "words and phrases they use",
  "themes they come back to",
  "channels and tools they mention",
  "proof they show",
  "questions the site answers",
  "what it asks readers to do",
  "how they write"
];
function profileParts(text) {
  const parts = /* @__PURE__ */ new Map();
  let current;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line === "=== counted ===") {
      current = "counted";
      continue;
    }
    if (/^=== .+ ===$/.test(line)) {
      current = void 0;
      continue;
    }
    const label = line.endsWith(":") ? line.slice(0, -1) : void 0;
    if (label !== void 0 && PARTS.includes(label)) {
      current = label;
      continue;
    }
    if (current !== void 0 && line !== "") {
      parts.set(current, [...parts.get(current) ?? [], line]);
    }
  }
  return parts;
}
function sentencesOf(lines) {
  return lines.flatMap((line) => line.startsWith('"') ? [line] : line.split(/(?<=[.!?])\s+(?=[A-Z"])/)).map((each) => each.trim()).filter((each) => each !== "");
}

// src/compare.ts
function overTime(before, after) {
  const was = profileParts(before);
  const now = profileParts(after);
  const result = { changed: [], same: [] };
  for (const part of PARTS) {
    const old = sentencesOf(was.get(part) ?? []);
    const neu = sentencesOf(now.get(part) ?? []);
    const out = old.filter((sentence) => !neu.includes(sentence));
    const came = neu.filter((sentence) => !old.includes(sentence));
    if (out.length === 0 && came.length === 0) {
      result.same.push(part);
    } else {
      result.changed.push({ part, out, in: came });
    }
  }
  return result;
}
function overTimeText(names, result) {
  const lines = [`what changed from ${names.before} to ${names.after}:`, ""];
  if (result.changed.length === 0) {
    lines.push("nothing changed");
  }
  for (const change of result.changed) {
    lines.push(`${change.part}:`, ...change.out.map((sentence) => `- ${sentence}`), ...change.in.map((sentence) => `+ ${sentence}`), "");
  }
  lines.push(`the same: ${result.same.length} of ${PARTS.length} parts`);
  return lines.join("\n");
}
function sideBySideText(profiles) {
  const parsed = profiles.map((profile) => ({ name: profile.name, parts: profileParts(profile.text) }));
  const lines = [];
  for (const part of PARTS) {
    lines.push(`## ${part}`);
    for (const profile of parsed) {
      lines.push(`${profile.name}: ${(profile.parts.get(part) ?? ["(nothing)"]).join(" ")}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

// src/read-args.ts
var USAGE = "node dist/run.js --before <profile> --after <profile> | --side-by-side <name>=<profile> <name>=<profile> ... [--json]";
function readArgs(args) {
  const rest = args.filter((arg) => arg !== "--json");
  if (rest[0] === "--side-by-side") {
    const profiles = rest.slice(1).map(namedProfile);
    if (profiles.length < 2 || profiles.some((each) => each === void 0)) {
      return { ok: false, problem: `Name two or more profiles as name=file. Use: ${USAGE}` };
    }
    return { ok: true, args: { mode: "side by side", profiles } };
  }
  const before = valueOf(rest, "--before");
  const after = valueOf(rest, "--after");
  if (!before || !after || rest.length !== 4) {
    return { ok: false, problem: `Name the profile before and the profile after. Use: ${USAGE}` };
  }
  return { ok: true, args: { mode: "over time", before, after } };
}
function namedProfile(arg) {
  const at = arg.indexOf("=");
  return at > 0 && at < arg.length - 1 ? { name: arg.slice(0, at), file: arg.slice(at + 1) } : void 0;
}
function valueOf(args, flag) {
  const at = args.indexOf(flag);
  return at >= 0 ? args[at + 1] : void 0;
}

// src/run.ts
async function main(args) {
  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }
  if (asked.args.mode === "over time") {
    const before = await readText(asked.args.before);
    const after = await readText(asked.args.after);
    if (before === void 0 || after === void 0) {
      return failed(`Cannot read ${before === void 0 ? asked.args.before : asked.args.after}`);
    }
    const result = overTime(before, after);
    printOutput({ text: overTimeText({ before: asked.args.before, after: asked.args.after }, result), data: result }, outputMode(args));
    return EXIT_DONE;
  }
  const profiles = [];
  for (const each of asked.args.profiles) {
    const text = await readText(each.file);
    if (text === void 0) {
      return failed(`Cannot read ${each.file}`);
    }
    profiles.push({ name: each.name, text });
  }
  printOutput({ text: sideBySideText(profiles), data: { names: profiles.map((each) => each.name) } }, outputMode(args));
  return EXIT_DONE;
}
function failed(problem) {
  process.stderr.write(`${problem}
`);
  return EXIT_REFUSED_OR_FAILED;
}
process.exitCode = await main(process.argv.slice(2));
