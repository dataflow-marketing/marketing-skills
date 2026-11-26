// Built by pnpm build from its src folder. Do not edit: change the source and build again.

// ../../../../packages/core/src/settings/read-line.ts
var SITE_LINE = /^site ([a-z0-9-]+): (\S+) (\S+) key in (\S+)$/;
var STORE_LINE = /^store ([a-z0-9-]+): (\S+) (.+?)(?: key in (\S+))?$/;
var BINDING_LINE = /^binding (\S+) ([a-z0-9-]+): (\S+) (.+)$/;
var HOUSE_RULE_LINE = /^house rule (.+?): (.+)$/;
function readSiteLine(line) {
  const match = SITE_LINE.exec(line);
  if (!match) {
    return void 0;
  }
  return {
    business: match[1],
    platform: match[2],
    address: match[3],
    keyName: match[4]
  };
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
var ONCE_ONLY = ["time zone", "week starts", "keys file"];
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

// src/site-line.ts
function siteLine(site) {
  return `site ${site.business}: ${site.platform} ${site.address} key in ${site.keyName}`;
}

// src/check-read-back.ts
function checkReadBack(settingsText, site) {
  if (settingsText === void 0) {
    return ["The settings file is not there."];
  }
  const { settings, problems } = parseSettings(settingsText);
  const found = [];
  const expected = siteLine(site);
  const there = settings.sites.find((known) => siteLine(known) === expected);
  if (!there) {
    found.push(`The settings file does not have the line: ${expected}`);
  }
  for (const problem of problems) {
    found.push(`settings ${problem}`);
  }
  return found;
}

// src/check-site.ts
var NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
var KEY_NAME = /^[A-Z][A-Z0-9_]*$/;
function checkSite(name, address, keyName) {
  const problems = [];
  if (!NAME.test(name)) {
    problems.push(`The name ${name} must be lowercase letters, numbers and hyphens, such as coffee-shop.`);
  }
  const tidyAddress = tidyHttpsAddress(address);
  if (!tidyAddress) {
    problems.push(`The address ${address} must look like https://coffee-shop.example: https, a host and nothing secret.`);
  }
  if (!KEY_NAME.test(keyName)) {
    problems.push("The key's variable must be a NAME in capitals, such as COFFEE_SHOP_GHOST_ADMIN_KEY. Never give the key itself.");
  }
  if (problems.length > 0 || !tidyAddress) {
    return { ok: false, problems };
  }
  return { ok: true, site: { business: name, platform: "ghost", address: tidyAddress, keyName } };
}
function tidyHttpsAddress(address) {
  if (!address.startsWith("https://")) {
    return void 0;
  }
  let url;
  try {
    url = new URL(address);
  } catch {
    return void 0;
  }
  if (url.hostname === "" || url.username !== "" || url.password !== "") {
    return void 0;
  }
  if (url.search !== "" || url.hash !== "") {
    return void 0;
  }
  const path = url.pathname.replace(/\/+$/, "");
  return `${url.origin}${path}`;
}

// src/describe-result.ts
function describePlan(plan, settingsPath) {
  const lines = [];
  if (plan.kind === "add") {
    lines.push("preview: nothing written");
    lines.push(`would add to ${settingsPath}:`);
    lines.push(plan.line);
    if (plan.newFile) {
      lines.push("(the file is new: it would start with spec 1 and its time zone)");
    }
  }
  if (plan.kind === "already there") {
    lines.push(`already in ${settingsPath}: nothing to add`);
    lines.push(plan.line);
  }
  if (plan.kind === "refused") {
    lines.push(`refused: ${plan.problem}`);
  }
  return { text: lines.join("\n"), data: { settings: settingsPath, plan, wrote: false } };
}
function describeAdded(line, settingsPath, problems) {
  const lines = [];
  lines.push(`added to ${settingsPath}:`);
  lines.push(line);
  lines.push(...readBackLines(problems));
  return { text: lines.join("\n"), data: { settings: settingsPath, line, wrote: true, problems } };
}
function describeReadBack(line, settingsPath, problems) {
  const lines = [];
  lines.push(`checked ${settingsPath} for:`);
  lines.push(line);
  lines.push(...readBackLines(problems));
  return { text: lines.join("\n"), data: { settings: settingsPath, line, problems } };
}
function readBackLines(problems) {
  if (problems.length === 0) {
    return ["read back: the site is there"];
  }
  return [`read back: ${problems.length} problems`, ...problems];
}

// src/node/settings-file.ts
import { appendFile as appendFile2, readFile } from "node:fs/promises";
async function readSettingsText(settingsPath) {
  try {
    return await readFile(expandHome(settingsPath), "utf8");
  } catch {
    return void 0;
  }
}
async function appendSettingsText(settingsPath, text) {
  await appendFile2(expandHome(settingsPath), text, "utf8");
}

// src/plan-add.ts
var SPEC_LINE2 = "spec 1";
function planAdd(settingsText, site, timeZone) {
  const line = siteLine(site);
  if (settingsText === void 0) {
    return planNewFile(line, timeZone);
  }
  if (!settingsText.startsWith(SPEC_LINE2)) {
    return { kind: "refused", problem: `The settings file does not start with "${SPEC_LINE2}". It may not be a settings file.` };
  }
  const { settings, problems } = parseSettings(settingsText);
  if (problems.length > 0) {
    return { kind: "refused", problem: `Fix the settings file first: ${problems.join("; ")}` };
  }
  const sameName = settings.sites.find((known) => known.business === site.business && known.platform === site.platform);
  if (sameName && siteLine(sameName) === line) {
    return { kind: "already there", line };
  }
  if (sameName) {
    return {
      kind: "refused",
      problem: `Settings already have a different Ghost site called ${site.business}: ${siteLine(sameName)}. Change it by hand if it is wrong.`
    };
  }
  return { kind: "add", line, append: appendAfter(settingsText, line), newFile: false };
}
function planNewFile(line, timeZone) {
  if (!timeZone) {
    return {
      kind: "refused",
      problem: "There is no settings file yet. Starting one needs its time zone: add --time-zone, such as --time-zone Australia/Melbourne."
    };
  }
  const append = `${SPEC_LINE2}
time zone: ${timeZone}
${line}
`;
  const { problems } = parseSettings(append);
  if (problems.length > 0) {
    return { kind: "refused", problem: problems.join("; ") };
  }
  return { kind: "add", line, append, newFile: true };
}
function appendAfter(settingsText, line) {
  if (settingsText.endsWith("\n")) {
    return `${line}
`;
  }
  return `
${line}
`;
}

// src/read-args.ts
var USAGE = "node dist/run.js --name <name> --address <https://...> --key-name <NAME> --settings <file> [--time-zone <zone>] [--preview | --go | --read-back] [--run-log <file>] [--json]";
var VALUE_FLAGS = ["--name", "--address", "--key-name", "--settings", "--time-zone", "--run-log"];
function readArgs(args) {
  const values = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    if (arg === "--json" || isModeFlag(arg)) {
      continue;
    }
    if (VALUE_FLAGS.includes(arg) && isValue(value)) {
      values[arg] = value;
      index += 1;
      continue;
    }
    return { ok: false, problem: `Not understood: ${arg}. Use: ${USAGE}` };
  }
  const name = values["--name"];
  const address = values["--address"];
  const keyName = values["--key-name"];
  const settings = values["--settings"];
  if (!name || !address || !keyName || !settings) {
    return { ok: false, problem: `Name the site, its address, its key's variable and the settings file. Use: ${USAGE}` };
  }
  const read = { name, address, keyName, settings };
  if (values["--time-zone"]) {
    read.timeZone = values["--time-zone"];
  }
  if (values["--run-log"]) {
    read.runLog = values["--run-log"];
  }
  return { ok: true, args: read };
}
function isValue(value) {
  return value !== void 0 && !value.startsWith("--");
}

// src/run.ts
var SKILL = "dfm-ghost:site-add";
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
  const checked = checkSite(asked.args.name, asked.args.address, asked.args.keyName);
  if (!checked.ok) {
    return failed(checked.problems.join("\n"));
  }
  if (mode.mode === "read-back") {
    return readBack(asked.args, checked.site, output);
  }
  return addSite2(asked.args, checked.site, output, mode.mode === "go");
}
async function addSite2(asked, site, output, go) {
  const before = await readSettingsText(asked.settings);
  const plan = planAdd(before, site, asked.timeZone);
  printOutputIfNotWriting(plan, asked, output, go);
  if (plan.kind === "refused") {
    return EXIT_REFUSED_OR_FAILED;
  }
  if (plan.kind === "already there" || !go) {
    return EXIT_DONE;
  }
  await appendSettingsText(asked.settings, plan.append);
  await appendRunLine(runLogPath(asked.settings, asked.runLog), {
    when: /* @__PURE__ */ new Date(),
    skill: SKILL,
    what: "site added",
    where: `settings ${asked.settings}`,
    before: "",
    after: plan.line
  });
  const problems = checkReadBack(await readSettingsText(asked.settings), site);
  printOutput(describeAdded(plan.line, asked.settings, problems), output);
  if (problems.length > 0) {
    return EXIT_REFUSED_OR_FAILED;
  }
  return EXIT_DONE;
}
function printOutputIfNotWriting(plan, asked, output, go) {
  const writing = go && plan.kind === "add";
  if (!writing) {
    printOutput(describePlan(plan, asked.settings), output);
  }
}
async function readBack(asked, site, output) {
  const problems = checkReadBack(await readSettingsText(asked.settings), site);
  printOutput(describeReadBack(siteLine(site), asked.settings, problems), output);
  if (problems.length > 0) {
    return EXIT_PROBLEMS_FOUND;
  }
  return EXIT_DONE;
}
function failed(problem) {
  process.stderr.write(`${problem}
`);
  return EXIT_REFUSED_OR_FAILED;
}
async function runSafely(args) {
  try {
    return await main(args);
  } catch (error) {
    const message = error instanceof Error ? error.message : "an unknown error";
    return failed(`Failed: ${message}`);
  }
}
process.exitCode = await runSafely(process.argv.slice(2));
