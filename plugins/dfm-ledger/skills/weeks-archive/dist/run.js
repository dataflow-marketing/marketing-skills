// Built by pnpm build from its src folder. Do not edit: change the source and build again.

// ../../../../packages/core/src/settings/read-line.ts
var SITE_LINE = /^site ([a-z0-9-]+): (\S+) (\S+)(?: account (\S+))?(?: key in (\S+))?$/;
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
    site.account = match[4];
  }
  if (match[5]) {
    site.keyName = match[5];
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
  { name: "house rule", addTo: addHouseRule },
  { name: "own email", addTo: addOwnEmail }
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
function addOwnEmail(settings, line) {
  const email = readValueAfter("own email:", line);
  if (email === void 0 || !/^\S+@\S+$/.test(email)) {
    return false;
  }
  settings.ownEmails.push(email.toLowerCase());
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
    houseRules: [],
    ownEmails: []
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
var EXIT_PROBLEMS_FOUND = 1;
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

// src/describe-result.ts
function describeResult(outcome, ledger, history, plan, rules) {
  const bytes = plan.kind === "move" ? plan.bytesBefore : plan.bytes;
  const lines = ["spec 1", `ledger: ${ledger} (${grouped(bytes)} bytes, ${Math.round(bytes * 100 / rules.limit)}% of ${grouped(rules.limit)})`];
  if (plan.kind === "under the threshold") {
    lines.push(`nothing to move: the ledger is under ${rules.atPercent}% of the limit`);
  } else if (plan.kind === "nothing old enough") {
    lines.push(`nothing to move: no done lines before ${plan.keepFrom} (the last ${rules.keepWeeks} weeks are kept)`);
  } else {
    lines.push(outcome === "preview" ? "preview: nothing written" : outcome);
    const verb = outcome === "preview" ? "would move" : "moved";
    lines.push(`${verb} ${plan.moving.length} done lines from the weeks before ${plan.keepFrom} to ${history}; the ledger ${outcome === "preview" ? "would be" : "is"} ${grouped(plan.bytesAfter)} bytes`);
  }
  return {
    text: lines.join("\n"),
    data: { spec: 1, outcome, ledger, history, kind: plan.kind, bytes, limit: rules.limit, moving: plan.kind === "move" ? plan.moving : [] }
  };
}
function grouped(n) {
  return n.toLocaleString("en-AU");
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

// ../../../../packages/ledger/src/edit/put-in-part.ts
var ORDER = ["graph", "plan", "done", "summary"];
var ANY_HEADING = /^=== (graph|plan|done|summary) ===$/;
function putInPart(ledgerText, part, change) {
  const lines = ledgerText.replace(/\s+$/, "").split("\n");
  const start = headingAt(lines, part);
  const after = lines.findIndex((line, index) => index > start && ANY_HEADING.test(line.trim()));
  const end = after < 0 ? lines.length : after;
  const kept = lines.slice(start + 1, end).filter((line) => !change.remove.some((beginning) => line.startsWith(beginning)));
  while (kept.length > 0 && kept[kept.length - 1].trim() === "") {
    kept.pop();
  }
  const body = [...kept, ...change.add, ...after < 0 ? [] : [""]];
  return `${[...lines.slice(0, start + 1), ...body, ...lines.slice(end)].join("\n")}
`;
}
function headingAt(lines, part) {
  const heading = `=== ${part} ===`;
  const at = lines.findIndex((line) => line.trim() === heading);
  if (at >= 0) {
    return at;
  }
  const later = ORDER.slice(ORDER.indexOf(part) + 1).map((name) => `=== ${name} ===`);
  const before = lines.findIndex((line) => later.includes(line.trim()));
  const place = before < 0 ? lines.length : before;
  lines.splice(place, 0, heading);
  return place;
}

// src/plan-archive.ts
var DEFAULT_RULES = { keepWeeks: 26, limit: 65535, atPercent: 75 };
var EMPTY_HISTORY = "spec 1\n=== done ===\n";
var DATED = /^(\d{4}-\d{2}-\d{2}) /;
function planArchive(ledgerText, historyText, today, rules = DEFAULT_RULES) {
  const bytes = bytesOf(ledgerText);
  const threshold = Math.floor(rules.limit * rules.atPercent / 100);
  if (bytes <= threshold) {
    return { kind: "under the threshold", bytes, threshold };
  }
  const keepFrom = addDays(mondayOf(today), -7 * (rules.keepWeeks - 1));
  const moving = doneLines(ledgerText).filter((line) => weekOf(line) !== void 0 && weekOf(line) < keepFrom);
  if (moving.length === 0) {
    return { kind: "nothing old enough", bytes, threshold, keepFrom };
  }
  const ledger = putInPart(ledgerText, "done", { remove: moving, add: [] });
  const inHistory = new Set(doneLines(historyText));
  const history = putInPart(historyText.trim() === "" ? EMPTY_HISTORY : historyText, "done", {
    remove: [],
    add: moving.filter((line) => !inHistory.has(line))
  });
  return { kind: "move", moving, keepFrom, bytesBefore: bytes, bytesAfter: bytesOf(ledger), ledger, history };
}
function doneLines(text) {
  const lines = text.split("\n").map((line) => line.trim());
  const start = lines.indexOf("=== done ===");
  if (start < 0) {
    return [];
  }
  const after = lines.findIndex((line, index) => index > start && /^=== \w+ ===$/.test(line));
  return lines.slice(start + 1, after < 0 ? lines.length : after).filter((line) => line !== "");
}
function weekOf(line) {
  const date = DATED.exec(line)?.[1];
  return date === void 0 ? void 0 : mondayOf(date);
}
function bytesOf(text) {
  return new TextEncoder().encode(text).length;
}

// src/read-args.ts
var USAGE = "node dist/run.js --ledger <file> --history <file> --settings <file> [--today <date>] [--keep <weeks>] [--limit <bytes>] [--at <percent>] [--preview | --go | --read-back] [--run-log <file>] [--json]";
var VALUE_FLAGS = ["--ledger", "--history", "--settings", "--today", "--keep", "--limit", "--at", "--run-log"];
var DATE = /^\d{4}-\d{2}-\d{2}$/;
var WHOLE = /^\d+$/;
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
  if (!values["--ledger"] || !values["--history"] || !values["--settings"]) {
    return { ok: false, problem: `Name the ledger, its history and the settings. Use: ${USAGE}` };
  }
  if (values["--today"] && !DATE.test(values["--today"])) {
    return { ok: false, problem: `A date is written as 2026-11-30: ${values["--today"]}` };
  }
  for (const flag of ["--keep", "--limit", "--at"]) {
    if (values[flag] && !WHOLE.test(values[flag])) {
      return { ok: false, problem: `${flag} takes a whole number: ${values[flag]}` };
    }
  }
  const asked = {
    ledger: values["--ledger"],
    history: values["--history"],
    settings: values["--settings"],
    rules: {
      keepWeeks: Number(values["--keep"] ?? DEFAULT_RULES.keepWeeks),
      limit: Number(values["--limit"] ?? DEFAULT_RULES.limit),
      atPercent: Number(values["--at"] ?? DEFAULT_RULES.atPercent)
    }
  };
  if (values["--today"]) {
    asked.today = values["--today"];
  }
  if (values["--run-log"]) {
    asked.runLog = values["--run-log"];
  }
  return { ok: true, args: asked };
}

// src/run.ts
var SKILL = "dfm-ledger:weeks-archive";
async function main(args) {
  const output = outputMode(args);
  const mode = writeMode(args);
  if (!mode.ok) {
    return failed(mode.problem);
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
  const ledgerText = await readText(asked.args.ledger);
  if (ledgerText === void 0) {
    return failed(`Cannot read the ledger: ${asked.args.ledger}`);
  }
  const historyText = await readText(asked.args.history) ?? "";
  const today = asked.args.today ?? nowIn(timeZone).today;
  const plan = planArchive(ledgerText, historyText, today, asked.args.rules);
  if (mode.mode === "read-back") {
    return readBack(asked.args.ledger, asked.args.history, output);
  }
  if (plan.kind !== "move" || mode.mode === "preview") {
    printOutput(describeResult("preview", asked.args.ledger, asked.args.history, plan, asked.args.rules), output);
    return EXIT_DONE;
  }
  await writeText(asked.args.history, plan.history);
  await writeText(asked.args.ledger, plan.ledger);
  await appendRunLine(runLogPath(asked.args.settings, asked.args.runLog), {
    when: /* @__PURE__ */ new Date(),
    skill: SKILL,
    what: `moved ${plan.moving.length} done lines before ${plan.keepFrom}`,
    where: `ledger ${asked.args.ledger}, history ${asked.args.history}`,
    before: "",
    after: ""
  });
  printOutput(describeResult("written", asked.args.ledger, asked.args.history, plan, asked.args.rules), output);
  return checkMoved(asked.args.ledger, asked.args.history, plan.moving);
}
async function checkMoved(ledgerPath, historyPath, moving) {
  const inLedger = new Set(doneLines(await readText(ledgerPath) ?? ""));
  const inHistory = new Set(doneLines(await readText(historyPath) ?? ""));
  const missing = moving.filter((line) => !inHistory.has(line) || inLedger.has(line));
  if (missing.length > 0) {
    process.stderr.write(`read back: ${missing.length} moved lines are not where they should be
`);
    return EXIT_PROBLEMS_FOUND;
  }
  return EXIT_DONE;
}
async function readBack(ledgerPath, historyPath, output) {
  const history = doneLines(await readText(historyPath) ?? "");
  const ledger = new Set(doneLines(await readText(ledgerPath) ?? ""));
  const both = history.filter((line) => ledger.has(line));
  printOutput({ text: `history: ${history.length} done lines; in both: ${both.length}`, data: { history: history.length, inBoth: both.length } }, output);
  return both.length > 0 ? EXIT_PROBLEMS_FOUND : EXIT_DONE;
}
function failed(problem) {
  process.stderr.write(`${problem}
`);
  return EXIT_REFUSED_OR_FAILED;
}
process.exitCode = await main(process.argv.slice(2));
