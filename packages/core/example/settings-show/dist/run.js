// Built by pnpm build from its src folder. Do not edit: change the source and build again.

// ../../src/settings/read-line.ts
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

// ../../src/settings/add-line.ts
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

// ../../src/settings/check-settings.ts
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

// ../../src/settings/parse-settings.ts
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

// ../../src/output/output-mode.ts
function outputMode(args) {
  if (args.includes("--json")) {
    return "json";
  }
  return "text";
}

// ../../src/output/format-output.ts
function formatOutput(result, mode) {
  if (mode === "json") {
    return JSON.stringify(result.data, null, 2);
  }
  return result.text;
}

// ../../src/output/exit-codes.ts
var EXIT_DONE = 0;
var EXIT_PROBLEMS_FOUND = 1;
var EXIT_REFUSED_OR_FAILED = 2;

// ../../src/node/expand-home.ts
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

// ../../src/node/read-settings.ts
import { readFile } from "node:fs/promises";
async function readSettings(settingsPath) {
  const text = await readFile(expandHome(settingsPath), "utf8");
  return parseSettings(text);
}

// ../../src/node/print-output.ts
function printOutput(result, mode) {
  const output = formatOutput(result, mode);
  process.stdout.write(`${output}
`);
}

// src/describe-settings.ts
function describeSettings(result) {
  const { settings, problems } = result;
  const lines = [];
  lines.push(`time zone: ${settings.timeZone ?? "not set"}`);
  lines.push(`week starts: ${settings.weekStarts}`);
  for (const site of settings.sites) {
    lines.push(`site ${site.business}: ${site.platform} ${site.address}`);
  }
  for (const store of settings.stores) {
    lines.push(`store ${store.name}: ${store.connector} ${store.where}`);
  }
  for (const binding of settings.bindings) {
    lines.push(`binding ${binding.object} ${binding.business}: ${binding.store} ${binding.place}`);
  }
  for (const problem of problems) {
    lines.push(`problem: ${problem}`);
  }
  return { text: lines.join("\n"), data: result };
}

// src/settings-path-from.ts
function settingsPathFrom(args) {
  for (const arg of args) {
    if (!arg.startsWith("--")) {
      return arg;
    }
  }
  return void 0;
}

// src/run.ts
async function main(args) {
  const mode = outputMode(args);
  const settingsPath = settingsPathFrom(args);
  if (!settingsPath) {
    process.stderr.write("Name a settings file: node dist/run.js <settings file> [--json]\n");
    return EXIT_REFUSED_OR_FAILED;
  }
  const result = await readSettingsOrSay(settingsPath);
  if (!result) {
    return EXIT_REFUSED_OR_FAILED;
  }
  printOutput(describeSettings(result), mode);
  if (result.problems.length > 0) {
    return EXIT_PROBLEMS_FOUND;
  }
  return EXIT_DONE;
}
async function readSettingsOrSay(path) {
  try {
    return await readSettings(path);
  } catch {
    process.stderr.write(`Could not read the settings file: ${path}
`);
    return void 0;
  }
}
process.exitCode = await main(process.argv.slice(2));
