// Built by pnpm build from its src folder. Do not edit: change the source and build again.

// ../../src/settings/read-line.ts
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
var ONCE_ONLY = ["time zone", "week starts", "keys file"];
var KINDS = ["time zone", "week starts", "keys file", "site", "store", "binding", "house rule"];
function parseSettings(text) {
  const settings = emptySettings();
  const problems = [];
  const lines = text.split(/\r?\n/);
  const firstLine = lines[0]?.trim();
  if (firstLine !== SPEC_LINE) {
    problems.push(`line 1: expected "${SPEC_LINE}"`);
  }
  const given = /* @__PURE__ */ new Set();
  for (let index = 1; index < lines.length; index++) {
    const line = lines[index].trim();
    if (line === "") {
      continue;
    }
    const kind = addLine(settings, line);
    if (!kind) {
      problems.push(notUnderstood(index + 1, line));
      continue;
    }
    if (ONCE_ONLY.includes(kind) && given.has(kind)) {
      problems.push(`line ${index + 1}: ${kind} is given more than once`);
    }
    given.add(kind);
  }
  problems.push(...checkSettings(settings));
  return { settings, problems };
}
function notUnderstood(lineNumber, line) {
  const kind = KINDS.find((first) => line.startsWith(first));
  if (kind) {
    return `line ${lineNumber}: a ${kind} line that is not understood`;
  }
  return `line ${lineNumber}: not understood`;
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
function addLine(settings, line) {
  const timeZone = readValueAfter("time zone:", line);
  if (timeZone) {
    settings.timeZone = timeZone;
    return "time zone";
  }
  const weekStarts = readValueAfter("week starts:", line);
  if (weekStarts) {
    settings.weekStarts = weekStarts;
    return "week starts";
  }
  const keysFile = readValueAfter("keys file:", line);
  if (keysFile) {
    settings.keysFile = keysFile;
    return "keys file";
  }
  const site = readSiteLine(line);
  if (site) {
    settings.sites.push(site);
    return "site";
  }
  const store = readStoreLine(line);
  if (store) {
    settings.stores.push(store);
    return "store";
  }
  const binding = readBindingLine(line);
  if (binding) {
    settings.bindings.push(binding);
    return "binding";
  }
  const houseRule = readHouseRuleLine(line);
  if (houseRule) {
    settings.houseRules.push(houseRule);
    return "house rule";
  }
  return void 0;
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
