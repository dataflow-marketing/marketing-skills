// Built by pnpm build from its src folder. Do not edit: change the source and build again.

// ../../../../packages/core/src/settings/read-line.ts
var SITE_LINE = /^site ([a-z0-9-]+): (\S+) (\S+)(?: key in (\S+))?$/;
var STORE_LINE = /^store ([a-z0-9-]+): (\S+) (.+?)(?: key in (\S+))?$/;
var BINDING_LINE = /^binding (\S+) ([a-z0-9-]+): (\S+) (.+)$/;
var HOUSE_RULE_LINE = /^house rule (.+?): (.+)$/;
function readSiteLine(line) {
  const match = SITE_LINE.exec(line);
  if (!match) {
    return void 0;
  }
  const site = {
    business: match[1],
    platform: match[2],
    address: match[3]
  };
  if (match[4]) {
    site.keyName = match[4];
  }
  return site;
}
function readStoreLine(line) {
  const match = STORE_LINE.exec(line);
  if (!match) {
    return void 0;
  }
  const store = {
    name: match[1],
    connector: match[2],
    where: match[3]
  };
  if (match[4]) {
    store.keyName = match[4];
  }
  return store;
}
function readBindingLine(line) {
  const match = BINDING_LINE.exec(line);
  if (!match) {
    return void 0;
  }
  return {
    object: match[1],
    business: match[2],
    store: match[3],
    place: match[4]
  };
}
function readHouseRuleLine(line) {
  const match = HOUSE_RULE_LINE.exec(line);
  if (!match) {
    return void 0;
  }
  return {
    name: match[1],
    rule: match[2]
  };
}
function readValueAfter(prefix, line) {
  if (!line.startsWith(prefix)) {
    return void 0;
  }
  const value = line.slice(prefix.length).trim();
  if (value === "") {
    return void 0;
  }
  return value;
}

// ../../../../packages/core/src/settings/add-line.ts
var LINE_KINDS = [
  { name: "time zone", addTo: addTimeZone },
  { name: "week starts", addTo: addWeekStarts },
  { name: "keys file", addTo: addKeysFile },
  { name: "backups", addTo: addBackups },
  { name: "site", addTo: addSite },
  { name: "store", addTo: addStore },
  { name: "binding", addTo: addBinding },
  { name: "house rule", addTo: addHouseRule }
];
function addLine(settings, line) {
  for (const kind of LINE_KINDS) {
    if (kind.addTo(settings, line)) {
      return kind.name;
    }
  }
  return void 0;
}
function addTimeZone(settings, line) {
  const timeZone = readValueAfter("time zone:", line);
  if (timeZone === void 0) {
    return false;
  }
  settings.timeZone = timeZone;
  return true;
}
function addWeekStarts(settings, line) {
  const weekStarts = readValueAfter("week starts:", line);
  if (weekStarts === void 0) {
    return false;
  }
  settings.weekStarts = weekStarts;
  return true;
}
function addKeysFile(settings, line) {
  const keysFile = readValueAfter("keys file:", line);
  if (keysFile === void 0) {
    return false;
  }
  settings.keysFile = keysFile;
  return true;
}
function addBackups(settings, line) {
  const backups = readValueAfter("backups:", line);
  if (backups === void 0) {
    return false;
  }
  settings.backups = backups;
  return true;
}
function addSite(settings, line) {
  const site = readSiteLine(line);
  if (site === void 0) {
    return false;
  }
  settings.sites.push(site);
  return true;
}
function addStore(settings, line) {
  const store = readStoreLine(line);
  if (store === void 0) {
    return false;
  }
  settings.stores.push(store);
  return true;
}
function addBinding(settings, line) {
  const binding = readBindingLine(line);
  if (binding === void 0) {
    return false;
  }
  settings.bindings.push(binding);
  return true;
}
function addHouseRule(settings, line) {
  const houseRule = readHouseRuleLine(line);
  if (houseRule === void 0) {
    return false;
  }
  settings.houseRules.push(houseRule);
  return true;
}

// ../../../../packages/core/src/settings/check-settings.ts
var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
function checkSettings(settings) {
  return [
    ...checkTimeZone(settings),
    ...checkWeekStarts(settings),
    ...checkBindings(settings)
  ];
}
function checkTimeZone(settings) {
  if (!settings.timeZone) {
    return ["time zone: missing (it is required)"];
  }
  if (!isKnownTimeZone(settings.timeZone)) {
    return ["time zone: not a known time zone (for example Australia/Melbourne)"];
  }
  return [];
}
function isKnownTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}
function checkWeekStarts(settings) {
  if (DAYS.includes(settings.weekStarts)) {
    return [];
  }
  return ["week starts: not a day of the week (for example Monday)"];
}
function checkBindings(settings) {
  const listed = new Set(settings.stores.map((store) => store.name));
  const problems = [];
  for (const binding of settings.bindings) {
    if (!listed.has(binding.store)) {
      problems.push(`binding ${binding.object} ${binding.business}: the store "${binding.store}" is not listed`);
    }
  }
  return problems;
}

// ../../../../packages/core/src/settings/parse-settings.ts
var SPEC_LINE = "spec 1";
var DEFAULT_WEEK_START = "Monday";
var ONCE_ONLY = ["time zone", "week starts", "keys file", "backups"];
function parseSettings(text) {
  const lines = numberedLines(text);
  const settings = emptySettings();
  const specProblems = checkSpecLine(lines);
  const lineProblems = addEachLine(settings, lines);
  const repeatProblems = findRepeatedLines(lines);
  const settingsProblems = checkSettings(settings);
  return {
    settings,
    problems: [...specProblems, ...lineProblems, ...repeatProblems, ...settingsProblems]
  };
}
function numberedLines(text) {
  const lines = text.split(/\r?\n/).map((line, index) => ({ number: index + 1, text: line.trim() }));
  return lines.filter((line) => line.text !== "");
}
function emptySettings() {
  return {
    spec: SPEC_LINE,
    weekStarts: DEFAULT_WEEK_START,
    sites: [],
    stores: [],
    bindings: [],
    houseRules: []
  };
}
function checkSpecLine(lines) {
  const first = lines[0];
  if (first?.number === 1 && first.text === SPEC_LINE) {
    return [];
  }
  return [`line 1: expected "${SPEC_LINE}"`];
}
function addEachLine(settings, lines) {
  const problems = [];
  for (const line of linesAfterSpec(lines)) {
    const kind = addLine(settings, line.text);
    if (kind === void 0) {
      problems.push(notUnderstood(line));
    }
  }
  return problems;
}
function findRepeatedLines(lines) {
  const problems = [];
  const given = /* @__PURE__ */ new Set();
  for (const line of linesAfterSpec(lines)) {
    const kind = kindOf(line.text);
    if (kind === void 0 || !ONCE_ONLY.includes(kind)) {
      continue;
    }
    if (given.has(kind)) {
      problems.push(`line ${line.number}: ${kind} is given more than once`);
    }
    given.add(kind);
  }
  return problems;
}
function linesAfterSpec(lines) {
  return lines.filter((line) => line.number > 1);
}
function kindOf(text) {
  return addLine(emptySettings(), text);
}
function notUnderstood(line) {
  const kind = LINE_KINDS.find((each) => line.text.startsWith(each.name));
  if (kind) {
    return `line ${line.number}: a ${kind.name} line that is not understood`;
  }
  return `line ${line.number}: not understood`;
}

// ../../../../packages/core/src/run-log/format-run-line.ts
var SEPARATOR = " | ";
var NOTHING = "(none)";
function formatRunLine(entry) {
  const parts = [
    entry.when.toISOString(),
    oneLine(entry.skill),
    oneLine(entry.what),
    oneLine(entry.where),
    `before: ${oneLine(entry.before)}`,
    `after: ${oneLine(entry.after)}`
  ];
  return parts.join(SEPARATOR);
}
function oneLine(value) {
  const flat = value.replace(/\s+/g, " ").trim();
  if (flat === "") {
    return NOTHING;
  }
  return flat;
}

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

// ../../../../packages/core/src/output/write-mode.ts
var MODE_FLAGS = {
  "--preview": "preview",
  "--go": "go",
  "--read-back": "read-back"
};
function writeMode(args) {
  const named = [];
  for (const arg of args) {
    const mode = MODE_FLAGS[arg];
    if (mode) {
      named.push(mode);
    }
  }
  if (named.length > 1) {
    return { ok: false, problem: "Name one mode only: --preview, --go or --read-back." };
  }
  if (named.length === 1) {
    return { ok: true, mode: named[0] };
  }
  return { ok: true, mode: "preview" };
}
function isModeFlag(arg) {
  return arg in MODE_FLAGS;
}

// ../../../../packages/core/src/time/now-in.ts
function nowIn(timeZone, now = /* @__PURE__ */ new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZoneName: "longOffset"
    }).formatToParts(now).map((part) => [part.type, part.value])
  );
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  const offset = String(parts.timeZoneName).replace("GMT", "") || "+00:00";
  return { today, stamp: `${today}T${parts.hour}:${parts.minute}${offset}` };
}

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

// ../../../../packages/core/src/node/append-run-line.ts
import { appendFile } from "node:fs/promises";
async function appendRunLine(runLogPath2, entry) {
  const line = formatRunLine(entry);
  await appendFile(expandHome(runLogPath2), `${line}
`, "utf8");
}

// ../../../../packages/core/src/node/print-output.ts
function printOutput(result, mode) {
  const output = formatOutput(result, mode);
  process.stdout.write(`${output}
`);
}

// ../../../../packages/core/src/node/run-log-path.ts
import { dirname, join as join2 } from "node:path";
var RUN_LOG_FILE = "run-log.txt";
function runLogPath(settingsPath, given) {
  if (given) {
    return expandHome(given);
  }
  return join2(dirname(expandHome(settingsPath)), RUN_LOG_FILE);
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
async function writeText(path, text) {
  await writeFile(expandHome(path), text, "utf8");
}

// ../../../../packages/ledger/src/dates.ts
var DAY_MS = 864e5;
function addDays(d, n) {
  const ms = Date.parse(`${d}T00:00:00Z`) + n * DAY_MS;
  return new Date(ms).toISOString().slice(0, 10);
}
function mondayOf(d) {
  const day = (/* @__PURE__ */ new Date(`${d}T00:00:00Z`)).getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  return addDays(d, -daysSinceMonday);
}

// ../../../../packages/ledger/src/numbers.ts
function written(n) {
  const rounded = Math.round(n * 10) / 10;
  return rounded.toLocaleString("en-AU", { maximumFractionDigits: 1 });
}

// src/starter.ts
var STARTER = `spec 1
=== graph ===
fact followers: told (stated)
fact comments: told (stated)

check your profiles -> followers: ? (unknown)
new post -> followers: ? (unknown)
new post -> comments: ? (unknown)
post once on social -> followers: ? (unknown)
reply to comments -> followers: ? (unknown)

=== plan ===
start 2026-11-30
want followers +1 a week
every week check your profiles
every week new post
every week post once on social
every week reply to comments
how check your profiles: Check your profiles are up to date, for example your Google Business Profile: opening times, contact details and what you offer.
how new post: Answer a question a customer asked you this week, in a few lines. That is your new post.
how post once on social: Use content from your new post.
how reply to comments: Reply to everyone who comments on your post, within a day. A reply turns someone who read it into a conversation. Count how many comments you had this week.

=== done ===
started 2026-11-30
2026-11-30 fact total followers: 120
`;

// src/make-ledger.ts
function makeLedger(today, followers) {
  const week = mondayOf(today);
  const lines = STARTER.split("\n").flatMap((line) => {
    if (line.startsWith("start ")) {
      return [`start ${week}`];
    }
    if (line.startsWith("started ")) {
      return [`started ${week}`];
    }
    if (/^\d{4}-\d{2}-\d{2} fact total followers: /.test(line)) {
      return followers === void 0 ? [] : [`${today} fact total followers: ${written(followers)}`];
    }
    return [line];
  });
  return lines.join("\n");
}

// src/read-args.ts
var USAGE = "node dist/run.js --ledger <file> --settings <file> [--followers <n>] [--preview | --go] [--run-log <file>] [--json]";
var VALUE_FLAGS = ["--ledger", "--settings", "--followers", "--run-log"];
function readArgs(args) {
  const values = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    if (arg === "--json" || isModeFlag(arg)) {
      continue;
    }
    if (VALUE_FLAGS.includes(arg) && value !== void 0 && !value.startsWith("--")) {
      values[arg] = value;
      index += 1;
      continue;
    }
    return { ok: false, problem: `Not understood: ${arg}. Use: ${USAGE}` };
  }
  if (!values["--ledger"] || !values["--settings"]) {
    return { ok: false, problem: `Name the ledger to start and the settings. Use: ${USAGE}` };
  }
  const read = { ledger: values["--ledger"], settings: values["--settings"] };
  if (values["--followers"] !== void 0) {
    const followers = Number(values["--followers"].replace(/,/g, ""));
    if (!Number.isInteger(followers) || followers < 0) {
      return { ok: false, problem: "--followers must be a whole number, such as 120" };
    }
    read.followers = followers;
  }
  if (values["--run-log"]) {
    read.runLog = values["--run-log"];
  }
  return { ok: true, args: read };
}

// src/run.ts
var SKILL = "dfm-ledger:plan-make";
async function main(args) {
  const output = outputMode(args);
  const mode = writeMode(args);
  if (!mode.ok) {
    return failed(mode.problem);
  }
  if (mode.mode === "read-back") {
    return failed("plan-make starts a ledger: check it with dfm-ledger:plan-check.");
  }
  const asked = readArgs(args);
  if (!asked.ok) {
    return failed(asked.problem);
  }
  const settings = parseSettings(await readText(asked.args.settings) ?? "");
  const timeZone = settings.settings.timeZone;
  if (settings.problems.length > 0 || !timeZone) {
    return failed(`Fix the settings first: ${settings.problems.join("; ") || "they cannot be read"}`);
  }
  if (await readText(asked.args.ledger) !== void 0) {
    return failed(`${asked.args.ledger} is already there: plan-make never writes over a ledger.`);
  }
  const ledger = makeLedger(nowIn(timeZone).today, asked.args.followers);
  if (mode.mode === "preview") {
    printOutput({ text: `preview: nothing written
would start ${asked.args.ledger}:

${ledger}`, data: { ledger } }, output);
    return EXIT_DONE;
  }
  await writeText(asked.args.ledger, ledger);
  await appendRunLine(runLogPath(asked.args.settings, asked.args.runLog), {
    when: /* @__PURE__ */ new Date(),
    skill: SKILL,
    what: "ledger started from the starter plan",
    where: `ledger ${asked.args.ledger}`,
    before: "",
    after: "the starter plan"
  });
  const back = await readText(asked.args.ledger);
  if (back !== ledger) {
    return failed(`Read back: ${asked.args.ledger} is not what was written.`);
  }
  printOutput({ text: `started ${asked.args.ledger} from the starter plan
read back: it is there

${ledger}`, data: { ledger } }, output);
  return EXIT_DONE;
}
function failed(problem) {
  process.stderr.write(`${problem}
`);
  return EXIT_REFUSED_OR_FAILED;
}
process.exitCode = await main(process.argv.slice(2));
